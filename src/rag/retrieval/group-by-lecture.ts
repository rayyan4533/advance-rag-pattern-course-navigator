import { ScoredDocument } from "../reranking/rerank-results";

export function groupBestByLecture(
    results: ScoredDocument[]
): ScoredDocument[] {
    const bestByLecture = new Map<string, ScoredDocument>();

    for (const result of results) {
        const [document, score] = result;

        const lectureId = document.metadata.lectureId;

        if (!lectureId) continue;

        const existing = bestByLecture.get(lectureId);

        if (!existing || score > existing[1]) {
            bestByLecture.set(lectureId, result);
        }
    }

    return Array.from(bestByLecture.values()).sort(
        (a, b) => b[1] - a[1]
    );
}