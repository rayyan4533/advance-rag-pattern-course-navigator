export type RetrieverType = "vector" | "keyword" | "hybrid";

export type QueryVariant =
    | "original"
    | "rewritten"
    | "step-back"
    | "hyde"
    | "sub-query";

export type RetrievalResult = {
    chunkId: string;
    lectureId: string;

    moduleNumber: number;
    lectureNumber: number | null;
    lectureTitle: string;

    start: number;
    end: number;

    text: string;

    retriever: RetrieverType;
    queryVariant: QueryVariant;

    originalScore: number;
};