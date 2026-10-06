import dotenv from "dotenv";
dotenv.config()

import { decomposeQuery } from "../../src/rag/query-translation/decompose-query";

async function main() {
    const queries = [
        "where does he explain API routes and where does he call them from the client?",
        "what are native components?",
        "where does he explain authentication and Google OAuth?",
    ];

    for (const query of queries) {
        console.log("\nOriginal:", query);
        console.log("Sub-queries:", await decomposeQuery(query));
    }
}

main().catch(console.error);