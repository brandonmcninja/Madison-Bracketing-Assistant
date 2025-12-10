import { Competitor, AppSettings, ProcessingResult, Bracket, Belt, Discipline, Gender } from '../types';

export const ADULT_AGE_THRESHOLD = 16;

// Rankings for sorting
const BELT_RANK: Record<Belt, number> = {
  [Belt.WHITE]: 1, [Belt.BEGINNER]: 1,
  [Belt.GREY]: 2,
  [Belt.YELLOW]: 3,
  [Belt.ORANGE]: 4,
  [Belt.GREEN]: 5,
  [Belt.BLUE]: 6, [Belt.INTERMEDIATE]: 6,
  [Belt.PURPLE]: 7, [Belt.ADVANCED]: 7,
  [Belt.BROWN]: 8, [Belt.EXPERT]: 8,
  [Belt.BLACK]: 9
};

// Updated Order: Youngest to Oldest as requested, with Roman Numerals for Masters
const DIVISION_RANK_ORDER = [
  "8U Coed",
  "9-12 Coed",
  "13-15 Male",
  "13-15 Female",
  "Adult (16+) Male",
  "Adult (16+) Female",
  "Masters I (35+) Male",
  "Masters I (35+) Female",
  "Masters II (40+) Male",
  "Masters II (40+) Female",
  "Masters III (45+) Male",
  "Masters III (45+) Female"
];

const getDivisionRank = (divName: string): number => {
  const index = DIVISION_RANK_ORDER.indexOf(divName);
  return index === -1 ? 99 : index; // Unknown divisions go last
};

// Helper to determine the precise division based on requirements
const getDivisionKey = (c: Competitor): string => {
  if (c.age <= 8) return "8U Coed";
  if (c.age <= 12) return "9-12 Coed";
  if (c.age <= 15) return `13-15 ${c.gender}`;
  
  if (c.age >= 45) return `Masters III (45+) ${c.gender}`;
  if (c.age >= 40) return `Masters II (40+) ${c.gender}`;
  if (c.age >= 35) return `Masters I (35+) ${c.gender}`;
  
  return `Adult (16+) ${c.gender}`;
};

// Helper to check validity of a specific group
const isValidGroup = (group: Competitor[], settings: AppSettings, isAdult: boolean): boolean => {
  if (group.length < 2) return false;
  
  const sorted = [...group].sort((a,b) => a.weight - b.weight);
  const minWeight = sorted[0].weight;
  const maxWeight = sorted[sorted.length - 1].weight;
  
  // Ultra Heavy Logic: If smallest person is > 225 and setting is on, ignore weight diff
  if (settings.ultraHeavyIgnore && minWeight >= 225) {
      // Pass weight check automatically
  } else {
      const weightDiffPerc = ((maxWeight - minWeight) / minWeight) * 100;
      const weightDiffLbs = maxWeight - minWeight;
      
      const maxPerc = isAdult ? settings.adultsMaxWeightDiffPercent : settings.kidsMaxWeightDiffPercent;
      
      // Validity: Must satisfy Percentage Rule AND Absolute Cap Rule
      // e.g. 10% allowed, but never more than 13lbs.
      if (weightDiffPerc > maxPerc) return false;
      if (weightDiffLbs > settings.maxWeightDiffLbs) return false;
  }
  
  // Age Logic
  const ages = group.map(c => c.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const ageGap = maxAge - minAge;

  const maxAgeGap = isAdult 
    ? (settings.adultsIgnoreAgeGap ? 100 : 15)
    : 5; // Default safe gap within bucket

  return ageGap <= maxAgeGap;
};

export const recalculateBracketStats = (bracket: Bracket): Bracket => {
  if (bracket.competitors.length === 0) {
    return {
      ...bracket,
      avgWeight: 0,
      maxWeightDiffPerc: 0,
      maxAgeGap: 0
    };
  }

  const sorted = [...bracket.competitors].sort((a, b) => a.weight - b.weight);
  const minWeight = sorted[0].weight;
  const maxWeight = sorted[sorted.length - 1].weight;
  const ages = bracket.competitors.map(c => c.age);
  
  return {
    ...bracket,
    competitors: sorted,
    avgWeight: bracket.competitors.reduce((sum, c) => sum + c.weight, 0) / bracket.competitors.length,
    maxWeightDiffPerc: minWeight > 0 ? ((maxWeight - minWeight) / minWeight) * 100 : 0,
    maxAgeGap: ages.length > 0 ? Math.max(...ages) - Math.min(...ages) : 0
  };
};

// Convert number index to Letter (0 -> A, 1 -> B)
const getGroupLetter = (index: number): string => {
    return String.fromCharCode(65 + index); // 65 is 'A'
};

const createBracketsFromPool = (
  pool: Competitor[], 
  discipline: Discipline,
  divisionName: string,
  beltName: string,
  settings: AppSettings, 
  isAdult: boolean,
  startId: number
): { brackets: Bracket[], outliers: Competitor[] } => {
  
  const brackets: Bracket[] = [];
  const outliers: Competitor[] = [];
  
  pool.sort((a, b) => a.weight - b.weight);

  // Strategy: Prioritize groups of 5, then 4, then 3. Strict max 5.
  let sizesToTry = [5, 4, 3];
  // If target is 3, try 3 first.
  if (settings.targetBracketSize === 3) sizesToTry = [3, 4, 5];
  // If target is 4, try 4, 5, 3
  if (settings.targetBracketSize === 4) sizesToTry = [4, 5, 3];

  let i = 0;
  while (i < pool.length) {
    const remaining = pool.length - i;
    let bestMatch: Competitor[] | null = null;

    for (const size of sizesToTry) {
      if (remaining < size) continue;
      
      const candidateGroup = pool.slice(i, i + size);
      if (isValidGroup(candidateGroup, settings, isAdult)) {
        bestMatch = candidateGroup;
        break;
      }
    }

    if (bestMatch) {
      const letter = getGroupLetter(brackets.length);
      const b: Bracket = {
        id: `bracket-${discipline}-${divisionName}-${beltName}-${startId + brackets.length}`.replace(/[^a-zA-Z0-9-]/g, '-'),
        name: `${divisionName} - ${beltName} (Group ${letter})`,
        discipline,
        division: divisionName,
        competitors: bestMatch,
        avgWeight: bestMatch.reduce((sum, c) => sum + c.weight, 0) / bestMatch.length,
        maxWeightDiffPerc: ((bestMatch[bestMatch.length-1].weight - bestMatch[0].weight) / bestMatch[0].weight) * 100,
        maxAgeGap: Math.max(...bestMatch.map(c=>c.age)) - Math.min(...bestMatch.map(c=>c.age))
      };
      brackets.push(b);
      i += bestMatch.length;
    } else {
      // Stragglers logic
      outliers.push(pool[i]);
      i += 1;
    }
  }

  return { brackets, outliers };
};

const sortBrackets = (brackets: Bracket[]): Bracket[] => {
    return brackets.sort((a, b) => {
        // 1. Discipline (Gi first)
        if (a.discipline !== b.discipline) {
            return a.discipline === Discipline.GI ? -1 : 1;
        }
        
        // 2. Belt (White -> Black)
        const beltA = a.competitors[0]?.belt || Belt.WHITE;
        const beltB = b.competitors[0]?.belt || Belt.WHITE;
        if (BELT_RANK[beltA] !== BELT_RANK[beltB]) {
            return BELT_RANK[beltA] - BELT_RANK[beltB];
        }

        // 3. Division (Age Groups)
        const rankA = getDivisionRank(a.division);
        const rankB = getDivisionRank(b.division);
        if (rankA !== rankB) return rankA - rankB;

        // 4. Name (Group A, Group B)
        return a.name.localeCompare(b.name);
    });
};

export const processCompetitors = (competitors: Competitor[], settings: AppSettings): ProcessingResult => {
  let allBrackets: Bracket[] = [];
  let allOutliers: Competitor[] = [];

  // Grouping Key: Discipline + Division + Belt
  const pools = new Map<string, Competitor[]>();

  competitors.forEach(c => {
    // Treat 0 weight OR 0 age as immediate outlier
    if (c.weight === 0 || c.age === 0) {
        allOutliers.push(c);
        return;
    }

    const division = getDivisionKey(c);
    const beltKey = c.belt as string;
    const isAdultDivision = division.includes('Adult') || division.includes('Masters');
    
    // We strictly bucket by these keys for the auto-generator
    const key = JSON.stringify({
        discipline: c.discipline,
        division: division,
        belt: beltKey,
        isAdult: isAdultDivision
    });

    if (!pools.has(key)) pools.set(key, []);
    pools.get(key)?.push(c);
  });

  // Process each pool
  pools.forEach((pool, keyString) => {
      const keyInfo = JSON.parse(keyString);
      const { brackets, outliers } = createBracketsFromPool(
          pool, 
          keyInfo.discipline, 
          keyInfo.division, 
          keyInfo.belt, 
          settings, 
          keyInfo.isAdult, 
          allBrackets.length
      );
      allBrackets = [...allBrackets, ...brackets];
      allOutliers = [...allOutliers, ...outliers];
  });

  return { 
      validBrackets: sortBrackets(allBrackets), 
      outliers: allOutliers 
  };
};