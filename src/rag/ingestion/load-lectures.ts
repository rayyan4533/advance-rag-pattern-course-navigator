import fs from "fs";
import path from "path";
import { Lecture } from "../types/types";
import { parseLecture } from "./parse-lecture";
/*load-lectures.ts
= whole-course loader


                RAW DATA
                   │
                   ▼
             .vtt files
                   │
                   ▼
          load-lectures.ts
                   │
                   ▼
             find .vtt files
                   │
                   ▼
             parse-lecture.ts
              /            \
             /              \
            ▼                ▼
     parse-vtt.ts   parse-lecture-metadata.ts
            │                │
            ▼                ▼
      SubtitleCue[]       metadata
             \              /
              \            /
               ▼          ▼
                  Lecture
                    │
                    ▼
          chunk-lecture.ts
                    │
                    ▼
          TranscriptChunk[]






*/
function findVttFiles(directory: string): string[] {
    const entries = fs.readdirSync(directory, {
        withFileTypes: true,
    });

    const vttFiles: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            const nestedFiles = findVttFiles(fullPath);
            vttFiles.push(...nestedFiles);
            continue;
        }

        if (entry.isFile() && entry.name.toLowerCase().endsWith(".vtt")) {
            vttFiles.push(fullPath);
        }
    }

    return vttFiles;
}

export function loadLectures(rootDirectory: string): Lecture[] {
    const vttFiles = findVttFiles(rootDirectory);

    const lectures = vttFiles.map((filePath) => {
        return parseLecture(filePath);
    });

    return lectures;
}