import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

import { getLectureById } from "../ingestion/lecture-store";
import { secondsToTimestamp } from "../utils/timestamps";

const localizationSchema = z.object({
    startCueIndex: z.number().int().min(0),
    endCueIndex: z.number().int().min(0),
    reason: z.string(),
});

export type RefinedTimestamp = {
    start: number;
    end: number;
    reason: string;
};

type TimestampCandidate = {
    lectureId: string;
    start: number;
    end: number;
    text: string;
};



export async function refineTimestamp(
    query: string,
    candidate: TimestampCandidate
): Promise<RefinedTimestamp | null> {
    const lecture = await getLectureById(
        candidate.lectureId
    );

    if (!lecture) {
        return null;
    }

    const relevantCues = lecture.cues.filter(
        (cue) =>
            cue.end > candidate.start &&
            cue.start < candidate.end
    );

    if (relevantCues.length === 0) {
        return null;
    }

    const cueText = relevantCues
        .map(
            (cue, index) =>
                `[${index}]
${secondsToTimestamp(cue.start, true)} --> ${secondsToTimestamp(cue.end, true)}
${cue.text}`
        )
        .join("\n\n");


    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel =
        model.withStructuredOutput(localizationSchema);

    const selection = await structuredModel.invoke(`
You are an evidence-localization system for course transcripts.

User query:
${query}

Subtitle cues:

${cueText}

Choose the smallest consecutive group of cues that directly
contains enough evidence to answer the query.

Rules:
- Return cue indexes only.
- startCueIndex and endCueIndex must refer to the provided cues.
- They must be consecutive evidence from the transcript.
- Prefer the smallest range that still answers the query.
- Do not select a cue merely because it contains matching keywords.
- The selected cues must actually explain the requested concept.

Return a short reason.
`);

    const startCue =
        relevantCues[selection.startCueIndex];

    const endCue =
        relevantCues[selection.endCueIndex];

    if (!startCue || !endCue) {
        return null;
    }

    if (
        selection.startCueIndex >
        selection.endCueIndex
    ) {
        return null;
    }

    return {
        start: startCue.start,
        end: endCue.end,
        reason: selection.reason,
    };
}