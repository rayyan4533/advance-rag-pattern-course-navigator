import { elasticClient } from "../elasticsearch/client";

export type KeywordSearchResult = {
    chunkId: string;
    lectureId: string;
    moduleNumber: number;
    lectureNumber: number | null;
    lectureTitle: string;
    start: number;
    end: number;
    text: string;
    score: number;
};

export async function keywordSearch(
    query: string,
    k = 10
): Promise<KeywordSearchResult[]> {
    const response = await elasticClient.search({
        index: "course-rag",

        size: k,

        query: {
            multi_match: {
                query,
                fields: [
                    "lectureTitle^2",
                    "text",
                ],
            },
        },
    });

    return response.hits.hits.map((hit) => {
        const source = hit._source as any;

        return {
            ...source,
            chunkId: source.chunkId || source.id || hit._id,
            score: hit._score ?? 0,

        };
    });
}