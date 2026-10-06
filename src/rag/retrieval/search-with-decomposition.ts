/*
            User query
            ↓
            decomposeQuery()
            ↓
            ┌──────────────────────┐
            │ sub-query 1          │
            │ sub-query 2          │
            │ sub-query 3 ...      │
            └──────────┬───────────┘
                    ↓
            for each sub-query:
            searchWithQueryTranslations()
                    ↓
                result list
                    ↓
            fuse all result lists
                    ↓
            final candidates
*/

import { decomposeQuery } from "../query-translation/decompose-query";
import { searchWithQueryTranslations } from "./search-with-query-translations";
import { reciprocalRankFusion } from "./reciprocal-rank-fusion";
import { RetrievalResult } from "./types/types";

export async function searchWithDecomposition(
    query: string,
    k = 10
) {
    const subQueries = await decomposeQuery(query);

    console.log({
        original: query,
        subQueries,
    });

    const resultLists = await Promise.all(
        subQueries.map((subQuery) =>
            searchWithQueryTranslations(subQuery, k)
        )
    );

    const normalizedLists: RetrievalResult[][] =
        resultLists.map((results) =>
            results.map((result) => ({
                chunkId: result.chunkId,
                lectureId: result.lectureId,

                moduleNumber: result.moduleNumber,
                lectureNumber: result.lectureNumber,
                lectureTitle: result.lectureTitle,

                start: result.start,
                end: result.end,

                text: result.text,

                retriever: "hybrid",
                queryVariant: "sub-query",

                originalScore: result.rrfScore,
            }))
        );

    return reciprocalRankFusion(normalizedLists);
}