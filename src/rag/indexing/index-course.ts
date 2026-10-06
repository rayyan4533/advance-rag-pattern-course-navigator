import path from "path";

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

import { loadLectures } from "../ingestion/load-lectures";
import { chunkLecture } from "../chunking/chunk-lecture";
import { chunksToDocuments } from "../documents/chunks-to-documents";
import { qdrantClient, QDRANT_COLLECTION } from "../../../qdrant/db";

export async function indexCourse() {
    const transcriptsPath = path.join(
        process.cwd(),
        "data/transcripts/class-subtitle"
    );

    const lectures = loadLectures(transcriptsPath);

    console.log("Lectures loaded:", lectures.length);

    const allChunks = lectures.flatMap((lecture) =>
        chunkLecture(lecture)
    );

    console.log("Total chunks:", allChunks.length);

    const documents = chunksToDocuments(allChunks);

    console.log("Documents created:", documents.length);

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });

    const batchSize = 100;

    let vectorStore: QdrantVectorStore | null = null;

    for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        if (!vectorStore) {
            // First batch also creates/connects the collection
            vectorStore = await QdrantVectorStore.fromDocuments(
                batch,
                embeddings,
                {
                    client: qdrantClient,
                    collectionName: QDRANT_COLLECTION,
                }
            );
        } else {
            await vectorStore.addDocuments(batch);
        }

        console.log(
            `Indexed ${Math.min(i + batch.length, documents.length)}/${documents.length}`
        );
    }

    console.log("Course indexed successfully");
}