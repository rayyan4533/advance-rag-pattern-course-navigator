import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_APIKEY!,
});

async function main() {
    console.log("URL:", process.env.QDRANT_URL);
    console.log(
        "API key loaded:",
        Boolean(process.env.QDRANT_APIKEY)
    );

    const collections = await client.getCollections();

    console.log(collections);
}

main().catch(console.error);