import { retrieveCourseContext } from "../retrieval/retrieve-course-context";
import { correctiveRetrieval } from "./corrective-retrieval";
import { gradeRetrieval } from "./grade-retrieval";

export type CragResult = {
    results: Awaited<ReturnType<typeof retrieveCourseContext>>;
    sufficient: boolean;
    score: number;
    attempts: number;
    reason: string;
};

export async function retrieveWithCrag(
    query: string,
    k = 10,
    maxRetries = 2
): Promise<CragResult> {
    let attempts = 1;

    // Attempt 1: normal routed retrieval
    let results = await retrieveCourseContext(query, k);

    let grade = await gradeRetrieval(query, results);

    console.log({
        attempt: attempts,
        score: grade.score,
        sufficient: grade.sufficient,
        reason: grade.reason,
    });

    if (grade.sufficient) {
        return {
            results,
            sufficient: true,
            score: grade.score,
            attempts,
            reason: grade.reason,
        };
    }

    // Corrective retries
    while (attempts <= maxRetries) {
        attempts++;

        results = await correctiveRetrieval(query, k);

        grade = await gradeRetrieval(query, results);

        console.log({
            attempt: attempts,
            score: grade.score,
            sufficient: grade.sufficient,
            reason: grade.reason,
        });

        if (grade.sufficient) {
            return {
                results,
                sufficient: true,
                score: grade.score,
                attempts,
                reason: grade.reason,
            };
        }
    }

    return {
        results,
        sufficient: false,
        score: grade.score,
        attempts,
        reason: grade.reason,
    };
}