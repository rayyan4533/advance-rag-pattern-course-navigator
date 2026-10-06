import path from "path";
import { loadLectures } from "../../src/rag/ingestion/load-lectures";

const transcriptsPath = path.join(
    process.cwd(),
    "data/transcripts/class-subtitle"
);

const lectures = loadLectures(transcriptsPath);

console.log("Total lectures:", lectures.length);

console.log(
    lectures.slice(0, 5).map((lecture) => ({
        id: lecture.id,
        moduleNumber: lecture.moduleNumber,
        lectureNumber: lecture.lectureNumber,
        title: lecture.title,
        totalCues: lecture.cues.length,
    }))
);