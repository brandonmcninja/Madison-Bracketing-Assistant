import { Competitor, Gender, Belt } from '../types';

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const ACADEMIES = ['Gracie Barra', 'Alliance', 'Checkmat', 'Atos', '10th Planet', 'Renzo Gracie', 'Carlson Gracie', 'GF Team', 'Unity', 'Fabio Clemente'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateDummyData = (count: number): Competitor[] => {
  return Array.from({ length: count }).map((_, i) => {
    const gender = Math.random() > 0.3 ? Gender.MALE : Gender.FEMALE; // 70% male bias common in tournaments
    
    // Weighted belt distribution
    const rand = Math.random();
    let belt = Belt.WHITE;
    if (rand > 0.4) belt = Belt.BLUE;
    if (rand > 0.7) belt = Belt.PURPLE;
    if (rand > 0.85) belt = Belt.BROWN;
    if (rand > 0.95) belt = Belt.BLACK;

    // Weight roughly correlated with gender
    const baseWeight = gender === Gender.MALE ? 140 : 110;
    const weight = getRandomInt(baseWeight, baseWeight + 100);

    // Age roughly correlated with belt (slightly)
    let minAge = 18;
    if (belt === Belt.BLACK) minAge = 25;
    const age = getRandomInt(minAge, minAge + 25);

    return {
      id: `comp-${Date.now()}-${i}`,
      name: `${getRandomElement(FIRST_NAMES)} ${String.fromCharCode(65 + i % 26)}.`,
      academy: getRandomElement(ACADEMIES),
      gender,
      age,
      weight,
      belt
    };
  });
};