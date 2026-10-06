import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const outputGuardSchema = z.object({
    grounded: z.boolean(),
    inventedLectureOrTimestamp: z.boolean(),
    unsupportedClaims: z.boolean(),
    safeToReturn: z.boolean(),
    reason: z.string(),
});

export type OutputGuardResult =
    z.infer<typeof outputGuardSchema>;

export async function validateOutput(
    query: string,
    answer: string,
    context: string
): Promise<OutputGuardResult> {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel =
        model.withStructuredOutput(outputGuardSchema);

    return structuredModel.invoke(`
You are an output grounding validator for a course RAG system.

User query:
${query}

Retrieved evidence:
${context}

Generated answer:
${answer}

Evaluate whether the answer is fully grounded in the retrieved evidence.

Check:

1. grounded
true only if the answer's important claims are supported by the evidence.

2. inventedLectureOrTimestamp
true if the answer mentions:
- a lecture not present in the evidence
- a module not present in the evidence
- a timestamp not present in the evidence
- a timestamp range that contradicts the evidence

3. unsupportedClaims
true if the answer adds explanations, facts, or conclusions
that are not supported by the retrieved evidence.

4. safeToReturn
true only when:
- grounded = true
- inventedLectureOrTimestamp = false
- unsupportedClaims = false

Be strict.
Do not reward an answer just because it sounds plausible.
`);
}