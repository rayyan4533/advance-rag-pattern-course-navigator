import { rewriteQuery } from "../query-translation/rewire-query";
import { hybridSearch } from "./hybrid-search";

import {
    reciprocalRankFusion,
    FusedRetrievalResult,
} from "./reciprocal-rank-fusion";
import { RetrievalResult } from "./types/types";

export async function searchWithRewrite(
    query: string,
    k = 10
): Promise<FusedRetrievalResult[]> {
    // 1. Rewrite the query
    const rewrittenQuery = await rewriteQuery(query);

    // 2. Search original + rewritten query in parallel
    const [originalResults, rewrittenResults] = await Promise.all([
        hybridSearch(query, k, "original"),
        hybridSearch(rewrittenQuery, k, "rewritten"),
    ]);

    // 3. Convert fused hybrid results back into RetrievalResult[]
    // so we can fuse the two ranked lists again
    const originalNormalized: RetrievalResult[] = originalResults.map(
        (result) => ({
            chunkId: result.chunkId,
            lectureId: result.lectureId,
            moduleNumber: result.moduleNumber,
            lectureNumber: result.lectureNumber,
            lectureTitle: result.lectureTitle,
            start: result.start,
            end: result.end,
            text: result.text,

            retriever: "hybrid",
            queryVariant: "original",

            originalScore: result.rrfScore,
        })
    );

    const rewrittenNormalized: RetrievalResult[] = rewrittenResults.map(
        (result) => ({
            chunkId: result.chunkId,
            lectureId: result.lectureId,
            moduleNumber: result.moduleNumber,
            lectureNumber: result.lectureNumber,
            lectureTitle: result.lectureTitle,
            start: result.start,
            end: result.end,
            text: result.text,

            retriever: "hybrid",
            queryVariant: "rewritten",

            originalScore: result.rrfScore,
        })
    );
    // 4. Fuse original-query ranking and rewritten-query ranking
    return reciprocalRankFusion([
        originalNormalized,
        rewrittenNormalized,
    ]);
}