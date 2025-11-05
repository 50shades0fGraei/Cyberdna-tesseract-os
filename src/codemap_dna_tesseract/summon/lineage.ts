import processIndexData from '../config/processIndex.json' assert { type: 'json' };
import segmentsData from '../config/segments.json' assert { type: 'json' };
import fs from 'fs';

interface ProcessIndex {
  [key: string]: {
    program: string;
    process: string;
    function: string;
    pipeline: string;
    strand: string;
    invoked: string;
  };
}

interface Segments {
  [key: string]: {
    strand: string;
    function: string;
    process: string;
    program: string;
    pipeline: string;
    introduced: string;
  };
}

const processIndex: ProcessIndex = processIndexData;
const segments: Segments = segmentsData;

export function updateLineage(segment: string) {
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
