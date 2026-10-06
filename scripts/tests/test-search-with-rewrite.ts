import "dotenv/config";

import { searchWithRewrite } from "../../src/rag/retrieval/search-with-rewrite";

async function main() {
    const query = "where he gets params from url";

    const results = await searchWithRewrite(query, 10);

    console.log(
        results.slice(0, 10).map((result) => ({
            chunkId: result.chunkId,
            title: result.lectureTitle,
            start: result.start,
            rrfScore: result.rrfScore,
            sources: result.sources,
            text: result.text.slice(0, 180),
        }))
    );
}

main().catch(console.error);