import dotenv from "dotenv";

dotenv.config();

import { generateHydeDocument } from "../../src/rag/query-translation/generate-hyde";

async function main() {
    const queries = [
        "where did he make backend inside expo?",
        "where he gets params from url",
        "useLocalSearchParams",
    ];

    for (const query of queries) {
        const hyde = await generateHydeDocument(query);

        console.log("\nOriginal:");
        console.log(query);

        console.log("\nHyDE:");
        console.log(hyde);
    }
}

main().catch(console.error);