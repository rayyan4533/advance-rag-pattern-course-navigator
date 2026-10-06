/* 
Lecture
↓
125 subtitle cues
↓
group nearby cues
↓
TranscriptChunk[]
*/

import { Lecture, TranscriptChunk } from "../types/types";

export function chunkLecture(
  lecture: Lecture,
  chunkDuration = 45,
  overlapDuration = 10
): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];

  let windowStart = 0;

  const lectureEnd =
    lecture.cues.length > 0
      ? lecture.cues[lecture.cues.length - 1].end
      : 0;

  let chunkIndex = 0;

  while (windowStart < lectureEnd) {
    const windowEnd = windowStart + chunkDuration;

    const cuesInWindow = lecture.cues.filter((cue) => {
      return cue.end > windowStart && cue.start < windowEnd;
    });

    if (cuesInWindow.length > 0) {
      const start = cuesInWindow[0].start;
      const end = cuesInWindow[cuesInWindow.length - 1].end;

      const text = cuesInWindow
        .map((cue) => cue.text)
        .join(" ");

      chunks.push({
        id: `${lecture.id}-chunk-${chunkIndex}`,
        lectureId: lecture.id,

        moduleNumber: lecture.moduleNumber,
        lectureNumber: lecture.lectureNumber,
        lectureTitle: lecture.title,

        start,
        end,

        text,

        cues: cuesInWindow,
      });

      chunkIndex++;
    }

    windowStart += chunkDuration - overlapDuration;
  }

  return chunks;
}