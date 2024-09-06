import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import * as core from '@actions/core';
import { parseChunked } from '@discoveryjs/json-ext';
export async function parseStatsFileToJson(statsFilePath) {
    try {
        const path = resolve(process.cwd(), statsFilePath);
        return (await parseChunked(createReadStream(path)));
    }
    catch (error) {
        if (error instanceof Error) {
            core.warning(error);
        }
        return [];
    }
}
