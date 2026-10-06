import dotenv from "dotenv";

dotenv.config();

import { searchHyde } from "../../src/rag/retrieval/search-hyde";

async function main() {
    const query =
        "where did he make backend inside expo?";

    const results = await searchHyde(query, 5);

    console.log(
        results.map((result) => ({
            chunkId: result.chunkId,
            title: result.lectureTitle,
            start: result.start,
            score: result.originalScore,
            queryVariant: result.queryVariant,
            text: result.text.slice(0, 200),
        }))
    );
}

main().catch(console.error);