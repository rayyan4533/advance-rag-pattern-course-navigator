import { ChatOpenAI } from "@langchain/openai";

export async function generateHydeDocument(
    query: string
): Promise<string> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke(`
You generate a short hypothetical passage for semantic retrieval
over programming course transcripts.

The passage should describe what a relevant course section MIGHT say.

Rules:
- Write 2-4 sentences.
- Preserve exact technical terms from the query.
- You may add closely related technical vocabulary and synonyms.
- Do NOT invent specific libraries, frameworks, databases, services,
  APIs, or products unless the user explicitly mentioned or strongly implied them.
- Prefer generic technical concepts over guessing implementation details.
- Do NOT invent lecture names, module numbers, timestamps, or course facts.
- This passage is used ONLY to create an embedding for retrieval.
- Return only the passage.

Examples:

Query:
"where did he make backend inside expo?"

Good hypothetical passage:
"Expo can support server-side API routes that act as backend endpoints.
These routes can define handlers such as GET and POST and can be called
from the client side of the application."

Bad hypothetical passage:
"The backend uses Express, Firebase, MongoDB and Node.js."
Reason: those technologies were never mentioned.

Query:
"useLocalSearchParams"

Good hypothetical passage:
"useLocalSearchParams is used to access route or URL parameters inside
a screen. It is commonly used with dynamic routing to retrieve values
passed through the URL."

User query:
${query}
`);

    return String(response.content).trim();
}