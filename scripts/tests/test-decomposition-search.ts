import dotenv from "dotenv";
dotenv.config();

import { searchWithDecomposition } from "../../src/rag/retrieval/search-with-decomposition";

async function main() {
    const query =
        "where does he explain authentication and Google OAuth?";

    const results = await searchWithDecomposition(query, 10);

    console.log(
        results.slice(0, 10).map((result) => ({
            chunkId: result.chunkId,
            title: result.lectureTitle,
            start: result.start,
            rrfScore: result.rrfScore,
            text: result.text.slice(0, 180),
        }))
    );
}

main().catch(console.error);