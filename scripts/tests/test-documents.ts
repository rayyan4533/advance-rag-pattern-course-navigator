import path from "path";

import { parseLecture } from "../../src/rag/ingestion/parse-lecture";
import { chunkLecture } from "../../src/rag/chunking/chunk-lecture";
import { chunksToDocuments } from "../../src/rag/documents/chunks-to-documents";

const samplePath = path.join(
    process.cwd(),
    "data/transcripts/class-subtitle/module 2/01_native-components-vs-core-components_epm/01_native-components-vs-core-components_epm.vtt"
);

const lecture = parseLecture(samplePath);

const chunks = chunkLecture(lecture);

const documents = chunksToDocuments(chunks);

console.log("Total chunks:", chunks.length);
console.log("Total documents:", documents.length);

console.log(documents.slice(0, 2));