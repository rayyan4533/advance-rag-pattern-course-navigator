import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { FusedRetrievalResult } from "../retrieval/reciprocal-rank-fusion";

const gradeSchema = z.object({
    score: z.number().min(0).max(10),
    sufficient: z.boolean(),
    reason: z.string(),
});

export type RetrievalGrade = z.infer<typeof gradeSchema>;

export async function gradeRetrieval(
    query: string,
    results: FusedRetrievalResult[]
): Promise<RetrievalGrade> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel =
        model.withStructuredOutput(gradeSchema);

    const context = results
        .slice(0, 5)
        .map(
            (result, index) => `
Result ${index + 1}

Title: ${result.lectureTitle}

Transcript:
${result.text}
`
        )
        .join("\n");

    return structuredModel.invoke(`
You are a retrieval quality grader for a course RAG system.

User query:
${query}

Retrieved passages:
${context}

Evaluate whether the retrieved passages contain enough relevant evidence
to answer the user's query accurately.

Scoring:
0-2 = unrelated
3-4 = weakly related
5-6 = partially relevant but incomplete
7-8 = good evidence
9-10 = strong direct evidence

Set sufficient=true only when the passages provide enough evidence
to answer the user's actual question without guessing.

Be strict.
Do not mark results sufficient merely because they contain related words.
`);
}