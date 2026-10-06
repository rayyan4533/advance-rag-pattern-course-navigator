import { chunkLecture } from "@/src/rag/chunking/chunk-lecture";
import { parseLecture } from "@/src/rag/ingestion/parse-lecture";
import path from "path";
// import { parseLecture } from "../src/rag/ingestion/parse-lecture";
// import { chunkLecture } from "../src/rag/chunking/chunk-lecture";

const samplePath = path.join(
    process.cwd(),
    "data/transcripts/class-subtitle/module 2/01_native-components-vs-core-components_epm/01_native-components-vs-core-components_epm.vtt"
);

const lecture = parseLecture(samplePath);

const chunks = chunkLecture(lecture);

console.log("Lecture:", lecture.title);
console.log("Total cues:", lecture.cues.length);
console.log("Total chunks:", chunks.length);

console.log(
    chunks.slice(0, 3).map((chunk) => ({
        id: chunk.id,
        start: chunk.start,
        end: chunk.end,
        text: chunk.text,
        cueCount: chunk.cues.length,
    }))
);