import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { qdrantClient, QDRANT_COLLECTION } from "../../../qdrant/db";

export async function searchCourse(
    query: string,
    k = 5
) {
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            client: qdrantClient,
            collectionName: QDRANT_COLLECTION,
        }
    );

    const results = await vectorStore.similaritySearchWithScore(
        query,
        k
    );

    return results;
}