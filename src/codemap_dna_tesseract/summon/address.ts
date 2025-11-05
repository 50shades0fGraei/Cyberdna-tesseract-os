import segmentsData from '../config/segments.json' assert { type: 'json' };

interface Segment {
  strand: string;
  function: string;
  process: string;
  program: string;
  pipeline: string;
  introduced: string;
}

interface Segments {
  [key: string]: Segment;
}

const segments: Segments = segmentsData;

export function resolveAddress(segment: string, strand: string): string {
  const entry = segments[segment];
  if (!entry || entry.strand !== strand) {
    throw new Error(`Invalid segment or strand: ${segment} / ${strand}`);
  }
  return `../strands/${strand}/${entry.function}`;
}
