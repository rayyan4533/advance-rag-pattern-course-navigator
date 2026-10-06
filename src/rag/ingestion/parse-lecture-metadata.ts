import path from "path";
/*parse-lecture-metadata.ts
= understands naming/folder structure*/
export type LectureMetadata = {
    moduleNumber: number;
    lectureNumber: number | null;
    title: string;
};

export function parseLectureMetadata(
    filePath: string
): LectureMetadata {
    const moduleMatch = filePath.match(/module\s+(\d+)/i);
    const moduleNumber = Number(moduleMatch?.[1]);

    const fileName = path.basename(filePath, ".vtt");

    const lectureMatch = fileName.match(/^(\d+)/);

    const lectureNumber = lectureMatch
        ? Number(lectureMatch[1])
        : null;

    const title = fileName
        .replace(/^\d+_/, "")
        .replace(/_epm$/, "")
        .replace(/-/g, " ")
        .replace(/_/g, " ");

    return {
        moduleNumber,
        lectureNumber,
        title,
    };
}
