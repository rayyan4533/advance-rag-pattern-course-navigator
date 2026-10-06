import { Document } from "@langchain/core/documents";
import { TranscriptChunk } from "../types/types";

export function chunksToDocuments(
    chunks: TranscriptChunk[]
): Document[] {
    return chunks.map((chunk) => {
        return new Document({
            pageContent: chunk.text,

            metadata: {
                chunkId: chunk.id,
                lectureId: chunk.lectureId,

                moduleNumber: chunk.moduleNumber,
                lectureNumber: chunk.lectureNumber,
                lectureTitle: chunk.lectureTitle,

                start: chunk.start,
                end: chunk.end,
            },
        });
    });
}

/*
TranscriptChunk
├── text          → pageContent
├── lecture info  → metadata
├── timestamps    → metadata
└── cues[]        → kept in our source data, not embedded
*/