import { ChatOpenAI } from "@langchain/openai";
import { searchWithQueryTranslations } from "../retrieval/search-with-query-translations";
import { groupBestByLecture } from "../retrieval/group-by-lecture";
import { secondsToTimestamp } from "../utils/timestamps";
import { rerankResults } from "../reranking/rerank-results";
import { Document } from "@langchain/core/documents";
import { searchWithRewrite } from "../retrieval/search-with-rewrite";
import { searchWithDecomposition } from "../retrieval/search-with-decomposition";
import { retrieveCourseContext } from "../retrieval/retrieve-course-context";
import { retrieveWithCrag } from "../crag/retrieve-with-crag";
import { refineTimestamp } from "../localization/refine-timestamp";
import { validateInput } from "../guardrails/validate-input";
import { validateOutput } from "../guardrails/validate-output";




export async function answerCourseQuestion(query: string) {
    const guard = await validateInput(query);

    if (!guard.allowed) {
        if (guard.containsSensitiveData) {
            return "Please remove sensitive credentials or secrets from your query before continuing.";
        }

        if (guard.promptInjectionDetected) {
            return "I can help you find and explain content from the course, but I can't follow instructions that try to bypass the course-grounding rules.";
        }

        if (!guard.isCourseRelated) {
            return "This assistant is limited to questions about the course content.";
        }

        return "I couldn't process that request.";
    }

    const cragResult = await retrieveWithCrag(query, 10, 2);
    if (!cragResult.sufficient) {
        return `I couldn't find a sufficiently relevant lecture covering "${query}" in this course.`;
    }

    const fusedResults = cragResult.results;
    /*
                   USER QUERY
                     ↓
                   Router
                     ↓
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
    simple         difficult     multi-intent
      ↓              ↓              ↓
   Hybrid       selected query    Decompose
   search        strategies          ↓
      │              │          route each
      └──────────────┴──────────────┘
                     ↓
                    RRF
                     ↓
                  Reranker
                     ↓
             Group by lecture
                     ↓
                   Answer
    
    */

    // 2. Convert fused results into the shape our current reranker expects
    const resultsForReranking = fusedResults.map((result) => {
        const document = new Document({
            pageContent: result.text,

            metadata: {
                chunkId: result.chunkId,
                lectureId: result.lectureId,

                moduleNumber: result.moduleNumber,
                lectureNumber: result.lectureNumber,
                lectureTitle: result.lectureTitle,

                start: result.start,
                end: result.end,

                rrfScore: result.rrfScore,
                sources: result.sources,
            },
        });

        return [document, result.rrfScore] as const;
    });
    // 3. Rerank the fused candidates
    const rerankedResults = await rerankResults(
        query,
        resultsForReranking
    );

    // 4. Convert back into [Document, score]
    // so groupBestByLecture can reuse its existing logic
    const rerankedForGrouping = rerankedResults.map((item) => {
        return [item.document, item.rerankScore] as const;
    });

    // 5. Keep the strongest chunk from each lecture
    const results = groupBestByLecture(
        rerankedForGrouping
    ).slice(0, 5);
    //5.2
    const refinedResults = await Promise.all(
        results.map(async ([document, score]) => {
            const refined = await refineTimestamp(query, {
                lectureId: document.metadata.lectureId,
                start: document.metadata.start,
                end: document.metadata.end,
                text: document.pageContent,
            });

            return {
                document,
                score,
                refined,
            };
        })
    );

    // 6. Build final context
    const context = refinedResults
        .map((item, index) => {
            const start =
                item.refined?.start ??
                item.document.metadata.start;

            const end =
                item.refined?.end ??
                item.document.metadata.end;

            return `
Result ${index + 1}

Module: ${item.document.metadata.moduleNumber}
Lecture: ${item.document.metadata.lectureTitle}

Best timestamp:
${secondsToTimestamp(start, true)}

Relevant range:
${secondsToTimestamp(start, true)}
-
${secondsToTimestamp(end, true)}

Transcript:
${item.document.pageContent}
`;
        })
        .join("\n");
    // 7. Final answer generation
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0,
    });

    const response = await model.invoke(`
You are a course navigation assistant.

The user wants to know where a topic is taught in the course.

Use ONLY the retrieved transcript context below.

Return several relevant lectures when appropriate.

For each result include:
- module number
- lecture title
- best available timestamp range
- a short 1-3 line summary

Do not invent lectures or timestamps.

If only one lecture is genuinely relevant, return only one.

If the retrieved context does not sufficiently contain the topic,
say that you could not find it.

User question:
${query}

Retrieved context:
${context}
`);
    const answer = String(response.content);
    const outputGuard = await validateOutput(
        query,
        answer,
        context
    );
    if (!outputGuard.safeToReturn) {
        return `I found relevant course material, but I couldn't verify the generated answer strongly enough against the retrieved evidence.`;
    }

    return answer;
}