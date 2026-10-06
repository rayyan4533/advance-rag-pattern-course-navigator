import { ChatOpenAI } from "@langchain/openai";

export async function rewriteQuery(
    query: string
): Promise<string> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke(`
You rewrite user questions into better retrieval queries
for searching programming course transcripts.

Rules:
- Preserve the user's original intent.
- Preserve exact technical terms, API names, function names,
  library names, and error messages.
- Add useful synonymous technical terminology when appropriate.
- Do NOT assume technologies or concepts the user did not imply.
- Do NOT answer the question.
- Return only the rewritten search query.

User query:
${query}
`);

    return String(response.content).trim();
}