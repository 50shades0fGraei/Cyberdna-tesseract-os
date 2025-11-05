import segmentsData from '../config/segments.json' assert { type: 'json' };
const segments = segmentsData;
export function resolveAddress(segment, strand) {
    const entry = segments[segment];
    if (!entry || entry.strand !== strand) {
        throw new Error(`Invalid segment or strand: ${segment} / ${strand}`);
    }
    return `../strands/${strand}/${entry.function}`;
}
