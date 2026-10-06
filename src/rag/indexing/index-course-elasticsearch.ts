import path from "path";

import { elasticClient } from "../elasticsearch/client";
import { loadLectures } from "../ingestion/load-lectures";
import { chunkLecture } from "../chunking/chunk-lecture";

const INDEX_NAME = "course-rag";

export async function indexCourseElasticsearch() {
    const transcriptsPath = path.join(
        process.cwd(),
        "data/transcripts/class-subtitle"
    );

    const lectures = loadLectures(transcriptsPath);

    const chunks = lectures.flatMap((lecture) =>
        chunkLecture(lecture)
    );

    console.log("Lectures:", lectures.length);
    console.log("Chunks:", chunks.length);

    const exists = await elasticClient.indices.exists({
        index: INDEX_NAME,
    });

    if (!exists) {
        await elasticClient.indices.create({
            index: INDEX_NAME,
            mappings: {
                properties: {
                    chunkId: { type: "keyword" },
                    lectureId: { type: "keyword" },

                    moduleNumber: { type: "integer" },
                    lectureNumber: { type: "integer" },

                    lectureTitle: {
                        type: "text",
                    },

                    start: { type: "float" },
                    end: { type: "float" },

                    text: {
                        type: "text",
                    },
                },
            },
        });
    }

    const result = await elasticClient.helpers.bulk({
        datasource: chunks,

        onDocument(chunk) {
            return {
                index: {
                    _index: INDEX_NAME,
                    _id: chunk.id,
                },
            };
        },

        onDrop(doc) {
            console.error("Dropped document:", doc);
        },
    });

    console.log("Indexed:", result.successful);
    console.log("Failed:", result.failed);
}