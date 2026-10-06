import "dotenv/config";

import { searchCourse } from "../../src/rag/retrieval/search-course";

async function main() {
    const query = "where does he explain getting parameters from the URL?";

    const results = await searchCourse(query, 5);

    results.forEach(([document, score], index) => {
        console.log(`\n--- Result ${index + 1} ---`);
        console.log("Score:", score);
        console.log("Metadata:", document.metadata);
        console.log("Text:", document.pageContent);
    });
}

main().catch(console.error);
