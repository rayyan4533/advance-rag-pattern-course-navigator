import "dotenv/config";
import { rewriteQuery } from "@/src/rag/query-translation/rewire-query";

async function main() {
    const queries = [
        "where he gets params from url",
        "where did he make backend inside expo",
        "useLocalSearchParams",
        "where does he explain notifications",
    ];

    for (const query of queries) {
        const rewritten = await rewriteQuery(query);

        console.log("\nOriginal:");
        console.log(query);

        console.log("Rewritten:");
        console.log(rewritten);
    }
}

main().catch(console.error);