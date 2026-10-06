import dotenv from "dotenv";

dotenv.config();

import { routeQuery } from "../../src/rag/routing/query-router";

async function main() {
    const queries = [
        "useLocalSearchParams",

        "where did he make backend inside expo?",

        "where he gets params from url",

        "what are native components?",

        "where does he explain authentication and Google OAuth?",

        "why does useLocalSearchParams return values from the URL?",
    ];

    for (const query of queries) {
        const route = await routeQuery(query);

        console.log("\nQuery:");
        console.log(query);

        console.log("Route:");
        console.log(route);
    }
}

main().catch(console.error);