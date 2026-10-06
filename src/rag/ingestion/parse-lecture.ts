import fs from "fs";
import { Lecture } from "../types/types";
import { parseVtt } from "./parse-vtt";
import { parseLectureMetadata } from "./parse-lecture-metadata";

/*
file path
   ↓
read file
   ↓
parseVtt()
   ↓
SubtitleCue[]

file path
   ↓
parseLectureMetadata()
   ↓
metadata

metadata + cues
   ↓
Lecture



               filePath
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
 read file          parse metadata
         │                 │
         ▼                 ▼
     parseVtt()     module/title/etc
         │                 │
         └────────┬────────┘
                  ▼
               Lecture




*/

export function parseLecture(filePath: string): Lecture {
    const content = fs.readFileSync(filePath, "utf-8");

    const cues = parseVtt(content);
    const metadata = parseLectureMetadata(filePath);

    const slug = metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const id =
        metadata.lectureNumber !== null
            ? `module-${metadata.moduleNumber}-lecture-${metadata.lectureNumber}`
            : `module-${metadata.moduleNumber}-${slug}`;

    return {
        id,
        moduleNumber: metadata.moduleNumber,
        lectureNumber: metadata.lectureNumber,
        title: metadata.title,
        sourceFile: filePath,
        cues,
    };
};
