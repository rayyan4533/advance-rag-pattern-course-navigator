import { searchCourse } from "./search-course";
import { keywordSearch } from "./keyword-search";
import { normalizeVectorResults } from "./normalize-vector-results";
import { normalizeKeywordResults } from "./normalize-keyword-results";
import { reciprocalRankFusion } from "./reciprocal-rank-fusion";
import { QueryVariant } from "./types/types";

export async function hybridSearch(
    query: string,
    k = 10,
    queryVariant: QueryVariant = "original"
) {
    const [vectorRaw, keywordRaw] = await Promise.all([
        searchCourse(query, k),
        keywordSearch(query, k),
    ]);

    const vectorResults = normalizeVectorResults(
        vectorRaw,
        queryVariant
    );

    const keywordResults = normalizeKeywordResults(
        keywordRaw,
        queryVariant
    );

    return reciprocalRankFusion([
        vectorResults,
        keywordResults,
    ]);
}