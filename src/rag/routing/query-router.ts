import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const routeSchema = z.object({
    useRewrite: z.boolean(),
    useStepBack: z.boolean(),
    useHyde: z.boolean(),
    useDecomposition: z.boolean(),
});

export type QueryRoute = z.infer<typeof routeSchema>;

export async function routeQuery(
    query: string
): Promise<QueryRoute> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel =
        model.withStructuredOutput(routeSchema);

    return structuredModel.invoke(`
You are a retrieval router for a programming-course RAG system.

Decide which query-processing strategies are useful.

Strategies:

rewrite:
Use when the user's wording is informal, vague, poorly phrased,
or could benefit from technical synonyms.

stepBack:
Use when the question is very specific and retrieving the broader
underlying concept could help.

hyde:
Use when the user's wording is vague or significantly different
from likely course-transcript wording.

decomposition:
Use ONLY when the query contains multiple distinct information needs.

Important:
- Do not enable every strategy by default.
- Exact technical terms like function names usually do not need HyDE.
- Simple clear conceptual questions usually need few transformations.
- Multi-part questions should use decomposition.
- Preserve efficiency.

Examples:

Query:
"useLocalSearchParams"

Decision:
rewrite=false
stepBack=false
hyde=false
decomposition=false

Query:
"where did he make backend inside expo?"

Decision:
rewrite=true
stepBack=false
hyde=true
decomposition=false

Query:
"why does useLocalSearchParams return values from the URL?"

Decision:
rewrite=false
stepBack=true
hyde=false
decomposition=false

Query:
"where does he explain authentication and Google OAuth?"

Decision:
rewrite=false
stepBack=false
hyde=false
decomposition=true

Query:
"where he gets params from url"

Decision:
rewrite=true
stepBack=true
hyde=false
decomposition=false

User query:
${query}
`);
}