import "dotenv/config";

import { hybridSearch } from "../../src/rag/retrieval/hybrid-search";

async function main() {
    const query = "native components";

    const results = await hybridSearch(query, 10);

    console.log(
        results.slice(0, 10).map((result) => ({
            chunkId: result.chunkId,
            title: result.lectureTitle,
            start: result.start,

            rrfScore: result.rrfScore,

            sources: result.sources,

            originalScore: result.originalScore,

            text: result.text.slice(0, 150),
        }))
    );
}

main().catch(console.error);