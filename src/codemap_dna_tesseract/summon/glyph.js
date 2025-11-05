import traitsData from '../config/traits.json' assert { type: 'json' };
import cycloneData from '../config/cyclone.json' assert { type: 'json' };
const traits = traitsData;
const cyclone = cycloneData;
export function validateGlyph({ segment, traits: activeTraits, cyclone: clause }) {
    const clauseRules = cyclone[clause];
    if (!clauseRules)
        return false;
    const inRange = segment >= clauseRules.range[0] && segment <= clauseRules.range[1];
    const strandAllowed = clauseRules.allowedStrands.some(strand => activeTraits.some(trait => traits[trait]?.includes(strand)));
    return inRange && strandAllowed;
}
