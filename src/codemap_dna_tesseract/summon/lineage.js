import processIndexData from '../config/processIndex.json' assert { type: 'json' };
import segmentsData from '../config/segments.json' assert { type: 'json' };
import fs from 'fs';
const processIndex = processIndexData;
const segments = segmentsData;
export function updateLineage(segment) {
    const entry = segments[segment];
    const lineageEntry = {
        program: entry.program,
        process: entry.process,
        function: entry.function,
        pipeline: entry.pipeline,
        strand: entry.strand,
        invoked: new Date().toISOString()
    };
    processIndex[segment] = lineageEntry;
    fs.writeFileSync('./config/processIndex.json', JSON.stringify(processIndex, null, 2));
}
