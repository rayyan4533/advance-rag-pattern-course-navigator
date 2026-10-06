import { Document } from "@langchain/core/documents";
import { RetrievalResult, QueryVariant } from "./types/types";

export function normalizeVectorResults(
    results: [Document, number][],
    queryVariant: QueryVariant = "original"
): RetrievalResult[] {
    return results.map(([document, score]) => {
        const metadata = document.metadata;

        return {
            chunkId: metadata.chunkId,
            lectureId: metadata.lectureId,

            moduleNumber: metadata.moduleNumber,
            lectureNumber: metadata.lectureNumber ?? null,
            lectureTitle: metadata.lectureTitle,

            start: metadata.start,
            end: metadata.end,

            text: document.pageContent,

            retriever: "vector",
            queryVariant,

            originalScore: score,
        };
    });
}