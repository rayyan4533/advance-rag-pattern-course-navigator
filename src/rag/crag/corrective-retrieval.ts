import { generateStepBackQuery } from "../query-translation/step-back-query";
import { hybridSearch } from "../retrieval/hybrid-search";
import { searchHyde } from "../retrieval/search-hyde";
import { reciprocalRankFusion } from "../retrieval/reciprocal-rank-fusion";
import {
    QueryVariant,
    RetrievalResult,
} from "../retrieval/types/types";
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

export async function correctiveRetrieval(
    query: string,
    k = 10
) {
    const [rewrittenQuery, stepBackQuery] = await Promise.all([
        rewriteQuery(query),
        generateStepBackQuery(query),
    ]);

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

    return reciprocalRankFusion([
        normalizeHybridResults(originalResults, "original"),
        normalizeHybridResults(rewrittenResults, "rewritten"),
        normalizeHybridResults(stepBackResults, "step-back"),
        hydeResults,
    ]);
}