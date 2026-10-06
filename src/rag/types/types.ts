export type SubtitleCue = {
    start: number
    end: number
    text: string
}

export type Lecture = {
    id: string;
    moduleNumber: number;
    lectureNumber: number | null;
    title: string;
    sourceFile: string;
    cues: SubtitleCue[];
};

export type TranscriptChunk = {
    id: string;
    lectureId: string;

    moduleNumber: number;
    lectureNumber: number | null;
    lectureTitle: string;

    start: number;
    end: number;

    text: string;

    cues: SubtitleCue[];
};
