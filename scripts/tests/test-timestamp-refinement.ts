import dotenv from "dotenv";

dotenv.config();

import { retrieveWithCrag } from "../../src/rag/crag/retrieve-with-crag";
import { refineTimestamp } from "../../src/rag/localization/refine-timestamp";
import { secondsToTimestamp } from "../../src/rag/utils/timestamps";

async function main() {
    const query =
        "where he gets params from url";

    const crag = await retrieveWithCrag(
        query,
        10,
        2
    );

    if (!crag.sufficient) {
        console.log("No sufficient retrieval.");
        return;
    }

    const candidate = crag.results[0];

    console.log("\nOriginal chunk:");
    console.log({
        lecture: candidate.lectureTitle,
        start: secondsToTimestamp(candidate.start),
        end: secondsToTimestamp(candidate.end),
    });

    const refined = await refineTimestamp(
        query,
        candidate
    );

    console.log("\nRefined timestamp:");
    console.log(refined);

    if (refined) {
        console.log({
            bestStart: secondsToTimestamp(
                refined.start,
                true
            ),
            relevantUntil: secondsToTimestamp(
                refined.end,
                true
            ),
        });
    }
}

main().catch(console.error);