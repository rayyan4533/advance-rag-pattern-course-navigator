import "dotenv/config";

import { answerCourseQuestion } from "../../src/rag/generation/answer-course-question";

async function main() {
    const query =
        "where does he explain authentication and Google OAuth?";

    const answer =
        await answerCourseQuestion(query);

    console.log(answer);
}

main().catch(console.error);