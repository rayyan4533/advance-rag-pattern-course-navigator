import path from "path";
import { parseLecture } from "../../src/rag/ingestion/parse-lecture";

const samplePath = path.join(
    process.cwd(),
    "data/transcripts/class-subtitle/module 2/01_native-components-vs-core-components_epm/01_native-components-vs-core-components_epm.vtt"
);

const lecture = parseLecture(samplePath);

console.log({
    id: lecture.id,
    moduleNumber: lecture.moduleNumber,
    lectureNumber: lecture.lectureNumber,
    title: lecture.title,
    totalCues: lecture.cues.length,
});

console.log("\nFirst 5 cues:");
console.log(lecture.cues.slice(0, 5));