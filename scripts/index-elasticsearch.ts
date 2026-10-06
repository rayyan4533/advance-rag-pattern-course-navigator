import "dotenv/config";
import { indexCourseElasticsearch } from "../src/rag/indexing/index-course-elasticsearch";

indexCourseElasticsearch()
    .then(() => {
        console.log("Elasticsearch indexing complete");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
