import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_APIKEY || process.env.QDRANT_API_KEY,
});

export const QDRANT_COLLECTION = "course-rag";