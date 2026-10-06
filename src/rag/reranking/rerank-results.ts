import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";

export type ScoredDocument = readonly [Document, number];

export type RerankedDocument = {
    document: Document;
    vectorScore: number;
    rerankScore: number;
};

export async function rerankResults(
    query: string,
    results: ScoredDocument[]
): Promise<RerankedDocument[]> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const reranked: RerankedDocument[] = [];

    for (const [document, vectorScore] of results) {
        const response = await model.invoke(`
You are reranking transcript passages for a course search system.

User query:
${query}

Transcript passage:
${document.pageContent}

Judge how useful THIS PASSAGE is for directly answering the user's exact query.

10 = directly and explicitly answers the exact question
8-9 = strongly explains the requested topic
6-7 = relevant but mainly discusses related concepts
3-5 = mentions the topic/background
1-2 = loosely related
0 = unrelated

Return ONLY one integer from 0 to 10.
`);

        const parsedScore = Number.parseInt(
            String(response.content).trim(),
            10
        );

        reranked.push({
            document,
            vectorScore,
            rerankScore: Number.isNaN(parsedScore) ? 0 : parsedScore,
        });
    }

    reranked.sort((a, b) => b.rerankScore - a.rerankScore);

    return reranked;
}