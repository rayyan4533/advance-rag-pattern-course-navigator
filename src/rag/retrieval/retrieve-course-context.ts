/*
User query
↓
routeQuery()
↓
decision
│
├── decomposition?
│       ↓
│   decompose query
│       ↓
│   retrieve per sub-query
│
└── otherwise
       ↓
   always run original hybrid search
       +
   optional rewrite
   optional step-back
   optional HyDE
       ↓
   RRF fusion
       ↓
   return candidates

*/
import { routeQuery } from "../routing/query-router";
import { decomposeQuery } from "../query-translation/decompose-query";

import { generateStepBackQuery } from "../query-translation/step-back-query";

import { hybridSearch } from "./hybrid-search";
import { searchHyde } from "./search-hyde";
import { reciprocalRankFusion } from "./reciprocal-rank-fusion";

import {
    QueryVariant,
    RetrievalResult,
} from "./types/types";
import { rewriteQuery } from "../query-translation/rewire-query";

function normalizeHybridResults(
    results: Awaited<ReturnType<typeof hybridSearch>>,
    queryVariant: QueryVariant
): RetrievalResult[] {
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
}

async function retrieveSingleIntent(
    query: string,
    k = 10
) {
    const route = await routeQuery(query);

    console.log({
        query,
        route,
    });

    const searches: Promise<RetrievalResult[]>[] = [];

    // Always search the original query
    searches.push(
        hybridSearch(query, k, "original").then((results) =>
            normalizeHybridResults(results, "original")
        )
    );

    // Optional rewrite
    if (route.useRewrite) {
        searches.push(
            (async () => {
                const rewritten = await rewriteQuery(query);

                console.log("Rewrite:", rewritten);

                const results = await hybridSearch(
                    rewritten,
                    k,
                    "rewritten"
                );

                return normalizeHybridResults(
                    results,
                    "rewritten"
                );
            })()
        );
    }

    // Optional step-back
    if (route.useStepBack) {
        searches.push(
            (async () => {
                const stepBack =
                    await generateStepBackQuery(query);

                console.log("Step-back:", stepBack);

                const results = await hybridSearch(
                    stepBack,
                    k,
                    "step-back"
                );

                return normalizeHybridResults(
                    results,
                    "step-back"
                );
            })()
        );
    }

    // Optional HyDE
    if (route.useHyde) {
        searches.push(searchHyde(query, k));
    }

    const resultLists = await Promise.all(searches);

    return reciprocalRankFusion(resultLists);
}

export async function retrieveCourseContext(
    query: string,
    k = 10
) {
    const route = await routeQuery(query);

    // Multi-intent query
    if (route.useDecomposition) {
        const subQueries = await decomposeQuery(query);

        console.log({
            original: query,
            subQueries,
        });

        const resultLists = await Promise.all(
            subQueries.map((subQuery) =>
                retrieveSingleIntent(subQuery, k)
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

    // Single-intent query
    return retrieveSingleIntent(query, k);
}