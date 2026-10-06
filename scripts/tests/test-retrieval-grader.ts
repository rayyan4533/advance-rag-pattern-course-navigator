import dotenv from "dotenv";
dotenv.config();

import { retrieveCourseContext } from "../../src/rag/retrieval/retrieve-course-context";
import { gradeRetrieval } from "../../src/rag/crag/grade-retrieval";

async function test(query: string) {
    const results = await retrieveCourseContext(query, 10);

    const grade = await gradeRetrieval(
        query,
        results
    );

    console.log("\nQuery:");
    console.log(query);

    console.log("Grade:");
    console.log(grade);
}

async function main() {
    await test("what are native components?");
    await test("where is Redis caching taught?");
}

main().catch(console.error);