import { searchCourse } from "./search-course";
import { normalizeVectorResults } from "./normalize-vector-results";
import { generateHydeDocument } from "../query-translation/generate-hyde";

export async function searchHyde(
    query: string,
    k = 10
) {
    const hypotheticalDocument =
        await generateHydeDocument(query);

    const vectorRaw = await searchCourse(
        hypotheticalDocument,
        k
    );

    return normalizeVectorResults(
        vectorRaw,
        "hyde"
    );
}

/*
user query
   ↓
generateHydeDocument()
   ↓
hypothetical answer-like passage
   ↓
embed/search in Qdrant
   ↓
HyDE RetrievalResult[]

*/