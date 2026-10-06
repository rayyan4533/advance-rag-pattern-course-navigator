/*                     User Query
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
        original       rewrite     step-back
            │            │            │
            ▼            ▼            ▼
       hybridSearch  hybridSearch  hybridSearch
            │            │            │
            └────────────┼────────────┘
                         ▼
                    final fusion
                         ▼
                      reranker
                      */



import { rewriteQuery } from "../query-translation/rewire-query";
import { generateStepBackQuery } from "../query-translation/step-back-query";
import { searchHyde } from "./search-hyde";

import { hybridSearch } from "./hybrid-search";
import {
    reciprocalRankFusion,
    FusedRetrievalResult,
} from "./reciprocal-rank-fusion";
import { RetrievalResult } from "./types/types";

export async function searchWithQueryTranslations(
    query: string,
    k = 10
): Promise<FusedRetrievalResult[]> {
    // Generate query transformations in parallel
    const [rewrittenQuery, stepBackQuery] = await Promise.all([
        rewriteQuery(query),
        generateStepBackQuery(query),
    ]);

    console.log({
        original: query,
        rewritten: rewrittenQuery,
        stepBack: stepBackQuery,
    });

    // Search all three variants in parallel
    const [
        originalResults,
        rewrittenResults,
        stepBackResults,
        hydeResults,
    ] = await Promise.all([
        hybridSearch(query, k, "original"),
        hybridSearch(rewrittenQuery, k, "rewritten"),
        hybridSearch(stepBackQuery, k, "step-back"),
        searchHyde(query, k),
    ]);

    /*
                            QUERY
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       Original        Rewrite          Step-back
          │               │                │
       Hybrid          Hybrid            Hybrid
   Qdrant + ES      Qdrant + ES       Qdrant + ES
          │               │                │
          └───────────────┼────────────────┘
                          │
                          │
                    HyDE document
                          │
                       Qdrant
                          │
          ────────────────┴──────────────
                          ↓
                         RRF
                          ↓
                       candidates
                          ↓
                       reranker
    
    */

    const normalizeHybridResults = (
        results: typeof originalResults,
        queryVariant: "original" | "rewritten" | "step-back"
    ): RetrievalResult[] => {
        return results.map((result) => ({
            chunkId: result.chunkId,
            lectureId: result.lectureId,

            moduleNumber: result.moduleNumber,
            lectureNumber: result.lectureNumber,
            lectureTitle: result.lectureTitle,

            start: result.start,
            end: result.end,

            text: result.text,

            retriever: "hybrid",
            queryVariant,

            originalScore: result.rrfScore,
        }));
    };

    const originalNormalized = normalizeHybridResults(
        originalResults,
        "original"
    );

    const rewrittenNormalized = normalizeHybridResults(
        rewrittenResults,
        "rewritten"
    );

    const stepBackNormalized = normalizeHybridResults(
        stepBackResults,
        "step-back"
    );

    return reciprocalRankFusion([
        originalNormalized,
        rewrittenNormalized,
        stepBackNormalized,
        hydeResults,
    ]);
}