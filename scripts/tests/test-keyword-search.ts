import "dotenv/config";

import { keywordSearch } from "../../src/rag/retrieval/keyword-search";

async function main() {
    const query = "native components";

    const results = await keywordSearch(query, 5);

    results.forEach((result, index) => {
        console.log(`\n--- Result ${index + 1} ---`);
        console.log("Score:", result.score);
        console.log("Title:", result.lectureTitle);
        console.log("Start:", result.start);
        console.log("End:", result.end);
        console.log("Text:", result.text);
    });
}

main().catch(console.error);