import { SubtitleCue } from "../types/types";
import { timestampToSeconds } from "../utils/timestamps";

/*
raw VTT string
      ↓
normalize line endings
      ↓
split into blocks
      ↓
find timestamp line
      ↓
split start/end timestamp
      ↓
timestampToSeconds()
      ↓
join subtitle text
      ↓
SubtitleCue[]
*/


export function parseVtt(content: string): SubtitleCue[] {
    const blocks = content
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .split(/\n\s*\n/);

    const cues: SubtitleCue[] = [];

    for (const block of blocks) {
        const lines = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const timestampIndex = lines.findIndex((line) =>
            line.includes("-->")
        );

        if (timestampIndex === -1) {
            continue;
        }

        const timestampLine = lines[timestampIndex];

        const [startRaw, endRaw] = timestampLine.split("-->");

        if (!startRaw || !endRaw) {
            continue;
        }

        const startTimestamp = startRaw.trim();

        const endTimestamp = endRaw
            .trim()
            .split(/\s+/)[0];

        const start = timestampToSeconds(startTimestamp);
        const end = timestampToSeconds(endTimestamp);

        const text = lines
            .slice(timestampIndex + 1)
            .join(" ");

        if (!text) {
            continue;
        }

        cues.push({
            start,
            end,
            text,
        });
    }

    return cues;
}

