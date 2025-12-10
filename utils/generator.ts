import { Competitor, Gender, Belt, Discipline } from '../types';

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Liam', 'Noah', 'Oliver', 'Emma', 'Ava', 'Sophia', 'Mia', 'Lucas'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];
const ACADEMIES = ['Gracie Barra', 'Alliance', 'Checkmat', 'Atos', '10th Planet', 'Renzo Gracie', 'Carlson Gracie', 'GF Team', 'Unity', 'Fabio Clemente'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateDummyData = (count: number): Competitor[] => {
  return Array.from({ length: count }).map((_, i) => {
    const gender = Math.random() > 0.3 ? Gender.MALE : Gender.FEMALE; // 70% male bias common in tournaments
    
    // Decide if Kid (< 16) or Adult (>= 16)
    // Let's make 25% kids for testing
    const isKid = Math.random() < 0.25;

    let age: number;
    let weight: number;
    let belt: Belt;
    const discipline = Math.random() > 0.5 ? Discipline.GI : Discipline.NOGI;

    if (isKid) {
      age = getRandomInt(6, 15);
      // Lighter weights for kids
      weight = getRandomInt(40, 150);
      
      // Kids belts (White, Grey, Yellow, Orange, Green)
      // Weighted towards lower belts
      const rand = Math.random();
      if (rand < 0.3) belt = Belt.WHITE;
      else if (rand < 0.55) belt = Belt.GREY;
      else if (rand < 0.75) belt = Belt.YELLOW;
      else if (rand < 0.90) belt = Belt.ORANGE;
      else belt = Belt.GREEN;

    } else {
      // Adult (16+)
      age = getRandomInt(16, 50);
      
      const baseWeight = gender === Gender.MALE ? 135 : 105;
      weight = getRandomInt(baseWeight, baseWeight + 100);

      // Adult Belt distribution
      const rand = Math.random();
      belt = Belt.WHITE;
      if (rand > 0.4) belt = Belt.BLUE;
      if (rand > 0.7) belt = Belt.PURPLE;
      if (rand > 0.85) belt = Belt.BROWN;
      if (rand > 0.95) belt = Belt.BLACK;
    }
    
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);

    return {
      id: `comp-${Date.now()}-${i}`,
      name: `${firstName} ${lastName}`,
      academy: getRandomElement(ACADEMIES),
      gender,
      age,
      weight,
      belt,
      discipline,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      notes: ''
    };
  });
};