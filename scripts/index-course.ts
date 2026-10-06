import "dotenv/config";
import { indexCourse } from "../src/rag/indexing/index-course";

indexCourse()
    .then(() => {
        console.log("Done");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });