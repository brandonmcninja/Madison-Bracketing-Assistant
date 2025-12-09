export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum Belt {
  WHITE = 'White',
  GREY = 'Grey',
  YELLOW = 'Yellow',
  ORANGE = 'Orange',
  GREEN = 'Green',
  BLUE = 'Blue',
  PURPLE = 'Purple',
  BROWN = 'Brown',
  BLACK = 'Black'
}

export interface Competitor {
  id: string;
  name: string;
  academy: string;
  gender: Gender;
  age: number;
  weight: number; // in lbs or kg, assuming uniform unit
  belt: Belt;
}

export interface Bracket {
  id: string;
  name: string; // e.g., "Male White Belt - Light"
  competitors: Competitor[];
  avgWeight: number;
  maxWeightDiffPerc: number;
  maxAgeGap: number;
}

export interface AppSettings {
  targetBracketSize: number;
  
  // Kids Rules (< 18)
  kidsMaxWeightDiffPercent: number;
  kidsMaxAgeGap: number;

  // Adult Rules (18+)
  adultsMaxWeightDiffPercent: number;
  adultsIgnoreAgeGap: boolean; // If true, allows 18yo vs 40yo
  adultsCombineBrownBlack: boolean; // Merge Brown and Black belts
  adultsCombineWhiteBlue: boolean; // Merge White and Blue belts (optional)
}

export interface ProcessingResult {
  validBrackets: Bracket[];
  outliers: Competitor[];
}