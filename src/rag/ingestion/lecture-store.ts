import path from "path";

import { Lecture } from "../types/types";
import { loadLectures } from "./load-lectures";

let lectureMapPromise: Promise<Map<string, Lecture>> | null = null;

async function buildLectureMap() {
    const rootDirectory = path.join(
        process.cwd(),
        "data",
        "transcripts",
        "class-subtitle"
    );

    const lectures = await loadLectures(rootDirectory);

    return new Map(
        lectures.map((lecture) => [
            lecture.id,
            lecture,
        ])
    );
}

export async function getLectureById(
    lectureId: string
): Promise<Lecture | null> {
    if (!lectureMapPromise) {
        lectureMapPromise = buildLectureMap();
    }

    const lectureMap = await lectureMapPromise;

    return lectureMap.get(lectureId) ?? null;
}