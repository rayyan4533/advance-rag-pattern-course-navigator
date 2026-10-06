import dotenv from "dotenv";

dotenv.config();

import { retrieveWithCrag } from "../../src/rag/crag/retrieve-with-crag";

async function test(query: string) {
    console.log("\n==============================");
    console.log("Query:", query);

    const result = await retrieveWithCrag(
        query,
        10,
        2
    );

    console.log("\nFINAL CRAG RESULT:");
    console.log({
        sufficient: result.sufficient,
        score: result.score,
        attempts: result.attempts,
        reason: result.reason,
    });
}

async function main() {
    await test("what are native components?");
    await test("where is Redis caching taught?");
}

main().catch(console.error);