import { Competitor, AppSettings, ProcessingResult, Bracket, Belt } from '../types';

export const ADULT_AGE_THRESHOLD = 18;

// Helper to check validity of a specific group
const isValidGroup = (group: Competitor[], maxWeightDiff: number, maxAgeGap: number): boolean => {
  if (group.length < 2) return false;
  
  const minWeight = group[0].weight;
  const maxWeight = group[group.length - 1].weight;
  const weightDiff = ((maxWeight - minWeight) / minWeight) * 100;
  
  const ages = group.map(c => c.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const ageGap = maxAge - minAge;

  return weightDiff <= maxWeightDiff && ageGap <= maxAgeGap;
};

// Exported helper to recalculate stats for a bracket after manual modification
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

// Generic bracket finder for a specific pool of people
const createBracketsFromPool = (
  pool: Competitor[], 
  baseName: string, 
  settings: AppSettings, 
  isAdult: boolean,
  startId: number
): { brackets: Bracket[], outliers: Competitor[] } => {
  
  const brackets: Bracket[] = [];
  const outliers: Competitor[] = [];
  
  // Sort by weight
  pool.sort((a, b) => a.weight - b.weight);

  const maxWeightDiff = isAdult ? settings.adultsMaxWeightDiffPercent : settings.kidsMaxWeightDiffPercent;
  // If adults ignore age gap, we use a very high number (e.g. 100 years)
  const maxAgeGap = isAdult 
    ? (settings.adultsIgnoreAgeGap ? 100 : 15) // Default to 15y if not ignored, but usually ignored
    : settings.kidsMaxAgeGap;

  let i = 0;
  while (i < pool.length) {
    const remaining = pool.length - i;
    
    // Size preference logic
    let sizesToTry: number[] = [];
    if (settings.targetBracketSize === 4) sizesToTry = [4, 5, 3];
    else if (settings.targetBracketSize === 3) sizesToTry = [3, 4, 5];
    else sizesToTry = [5, 4, 3];

    let bestMatch: Competitor[] | null = null;

    // Greedy search
    for (const size of sizesToTry) {
      if (remaining < size) continue;
      
      const candidateGroup = pool.slice(i, i + size);
      if (isValidGroup(candidateGroup, maxWeightDiff, maxAgeGap)) {
        bestMatch = candidateGroup;
        break;
      }
    }

    if (bestMatch) {
      brackets.push({
        id: `bracket-${baseName.replace(/\s+/g, '-')}-${startId + brackets.length}`,
        name: `${baseName} (Group ${brackets.length + 1})`,
        competitors: bestMatch,
        avgWeight: bestMatch.reduce((sum, c) => sum + c.weight, 0) / bestMatch.length,
        maxWeightDiffPerc: ((bestMatch[bestMatch.length-1].weight - bestMatch[0].weight) / bestMatch[0].weight) * 100,
        maxAgeGap: Math.max(...bestMatch.map(c=>c.age)) - Math.min(...bestMatch.map(c=>c.age))
      });
      i += bestMatch.length;
    } else {
      // Straggler Handling
      if (remaining < 3) {
         // Try to merge into previous bracket
         const lastBracket = brackets.length > 0 ? brackets[brackets.length - 1] : null;
         let merged = false;

         if (lastBracket) {
           const combinedGroup = [...lastBracket.competitors, ...pool.slice(i)];
           if (isValidGroup(combinedGroup, maxWeightDiff, maxAgeGap)) {
             lastBracket.competitors = combinedGroup;
             // Re-calc stats
             lastBracket.maxWeightDiffPerc = ((combinedGroup[combinedGroup.length-1].weight - combinedGroup[0].weight) / combinedGroup[0].weight) * 100;
             lastBracket.maxAgeGap = Math.max(...combinedGroup.map(c=>c.age)) - Math.min(...combinedGroup.map(c=>c.age));
             lastBracket.avgWeight = combinedGroup.reduce((sum, c) => sum + c.weight, 0) / combinedGroup.length;
             merged = true;
           }
         }

         if (!merged) {
           for (let j = i; j < pool.length; j++) outliers.push(pool[j]);
         }
         break;
      } else {
        outliers.push(pool[i]);
        i += 1;
      }
    }
  }

  return { brackets, outliers };
};

export const processCompetitors = (competitors: Competitor[], settings: AppSettings): ProcessingResult => {
  let allBrackets: Bracket[] = [];
  let allOutliers: Competitor[] = [];

  // 1. Split Kids and Adults
  const kids = competitors.filter(c => c.age < ADULT_AGE_THRESHOLD);
  const adults = competitors.filter(c => c.age >= ADULT_AGE_THRESHOLD);

  // --- PROCESS KIDS ---
  // Group Strictly by Gender + Belt
  const kidPools = new Map<string, Competitor[]>();
  kids.forEach(c => {
    const key = `${c.gender} ${c.belt} (Kids)`;
    if (!kidPools.has(key)) kidPools.set(key, []);
    kidPools.get(key)?.push(c);
  });

  kidPools.forEach((pool, name) => {
    const { brackets, outliers } = createBracketsFromPool(pool, name, settings, false, allBrackets.length);
    allBrackets = [...allBrackets, ...brackets];
    allOutliers = [...allOutliers, ...outliers];
  });

  // --- PROCESS ADULTS ---
  // Group by Gender + (Belt Logic)
  const adultPools = new Map<string, Competitor[]>();
  
  adults.forEach(c => {
    let beltKey = c.belt as string;
    
    // Belt Merging Logic
    if (settings.adultsCombineBrownBlack) {
      if (c.belt === Belt.BROWN || c.belt === Belt.BLACK) {
        beltKey = "Brown/Black";
      }
    }
    if (settings.adultsCombineWhiteBlue) {
        if (c.belt === Belt.WHITE || c.belt === Belt.BLUE) {
            beltKey = "White/Blue";
        }
    }

    const key = `${c.gender} ${beltKey} (Adult)`;
    if (!adultPools.has(key)) adultPools.set(key, []);
    adultPools.get(key)?.push(c);
  });

  adultPools.forEach((pool, name) => {
    const { brackets, outliers } = createBracketsFromPool(pool, name, settings, true, allBrackets.length);
    allBrackets = [...allBrackets, ...brackets];
    allOutliers = [...allOutliers, ...outliers];
  });

  return { validBrackets: allBrackets, outliers: allOutliers };
};