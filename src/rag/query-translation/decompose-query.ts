import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const schema = z.object({
    subQueries: z.array(z.string()).min(1).max(4),
});

export async function decomposeQuery(
    query: string
): Promise<string[]> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel =
        model.withStructuredOutput(schema);

    const result = await structuredModel.invoke(`
You decompose questions for searching programming course transcripts.

Rules:
- Split only when the user has multiple distinct information needs.
- Each sub-query must make sense on its own.
- Preserve exact technical terms.
- Do not answer the question.
- If there is only one retrieval intent, return the original query only.
- Maximum 4 sub-queries.

User query:
${query}
`);

    return result.subQueries;
}