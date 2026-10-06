import { RetrievalResult, RetrieverType } from "./types/types";

export type FusedRetrievalResult = RetrievalResult & {
    rrfScore: number;
    sources: RetrieverType[];
};

export function reciprocalRankFusion(
    rankedLists: RetrievalResult[][],
    k = 60
): FusedRetrievalResult[] {
    const fused = new Map<string, FusedRetrievalResult>();

    for (const list of rankedLists) {
        list.forEach((result, index) => {
            const rank = index + 1;

            const contribution = 1 / (k + rank);

            const existing = fused.get(result.chunkId);

            if (!existing) {
                fused.set(result.chunkId, {
                    ...result,
                    rrfScore: contribution,
                    sources: [result.retriever],
                });

                return;
            }

            existing.rrfScore += contribution;

            if (!existing.sources.includes(result.retriever)) {
                existing.sources.push(result.retriever);
            }
        });
    }

    return Array.from(fused.values()).sort(
        (a, b) => b.rrfScore - a.rrfScore
    );
}