import { KeywordSearchResult } from "./keyword-search";
import { RetrievalResult, QueryVariant } from "./types/types";

export function normalizeKeywordResults(
    results: KeywordSearchResult[],
    queryVariant: QueryVariant = "original"
): RetrievalResult[] {
    return results.map((result) => {
        return {
            chunkId: result.chunkId,
            lectureId: result.lectureId,

            moduleNumber: result.moduleNumber,
            lectureNumber: result.lectureNumber,
            lectureTitle: result.lectureTitle,

            start: result.start,
            end: result.end,

            text: result.text,

            retriever: "keyword",
            queryVariant,

            originalScore: result.score,
        };
    });
}