import dotenv from "dotenv";
dotenv.config()
import { generateStepBackQuery } from "../../src/rag/query-translation/step-back-query";

async function main() {
    const queries = [
        "where he gets params from url",
        "useLocalSearchParams",
        "where does he create a POST endpoint",
        "how does the app know which screen to open",
    ];

    for (const query of queries) {
        const stepBack = await generateStepBackQuery(query);

        console.log("\nOriginal:");
        console.log(query);

        console.log("Step-back:");
        console.log(stepBack);
    }
}

main().catch(console.error);