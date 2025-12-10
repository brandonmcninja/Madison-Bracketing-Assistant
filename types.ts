export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum Discipline {
  GI = 'Gi',
  NOGI = 'No Gi'
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
  BLACK = 'Black',
  // No Gi Ranks
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export interface Competitor {
  id: string;
  name: string;
  academy: string;
  gender: Gender;
  age: number;
  weight: number; // in lbs or kg, assuming uniform unit
  belt: Belt;
  discipline: Discipline;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface Bracket {
  id: string;
  name: string; // e.g., "Gi - Male White Belt - Light"
  discipline: Discipline;
  division: string; // e.g. "8U Coed"
  competitors: Competitor[];
  avgWeight: number;
  maxWeightDiffPerc: number;
  maxAgeGap: number;
}

export interface AppSettings {
  targetBracketSize: number;
  
  // Kids Rules (< 16)
  kidsMaxWeightDiffPercent: number;
  
  // Adult Rules (16+)
  adultsMaxWeightDiffPercent: number;
  adultsIgnoreAgeGap: boolean; // If true, allows 16yo vs 40yo
  
  // Advanced Weight Rules
  maxWeightDiffLbs: number; // Absolute cap (e.g. 13 lbs)
  ultraHeavyIgnore: boolean; // Ignore max weight diff if min weight > 225
}

export interface ProcessingResult {
  validBrackets: Bracket[];
  outliers: Competitor[];
}