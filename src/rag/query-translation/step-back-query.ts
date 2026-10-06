import { ChatOpenAI } from "@langchain/openai";

export async function generateStepBackQuery(
    query: string
): Promise<string> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke(`
You generate a step-back search query for a programming course.

Your job is to make the user's query ONE LEVEL more general,
so retrieval can find the broader concept surrounding the question.

Important rules:

- Preserve the core technical concept.
- If the user mentions an exact API, hook, method, library, or function,
  identify the broader concept that API belongs to.
- Do NOT jump to a very broad field like "web development",
  "software engineering", or "state management" unless that is truly the topic.
- Do NOT invent technologies that were not implied.
- Do NOT answer the question.
- Return only the broader search query.

Examples:

Original:
useLocalSearchParams

Step-back:
accessing route parameters and URL parameters

Original:
where does he create a POST endpoint

Step-back:
creating and handling API endpoints

Original:
how does the app know which screen to open

Step-back:
application routing and navigation

Original:
where does he get params from the URL

Step-back:
accessing and handling URL and route parameters

User query:
${query}
`);

    return String(response.content).trim();
}