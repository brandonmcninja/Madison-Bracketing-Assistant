import { Competitor, Gender, Belt, Discipline } from '../types';

// Helper to parse a CSV line correctly handling quotes
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"'; // Handle escaped quotes
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
};

const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const normalizeBelt = (rawBelt: string): Belt => {
    const normalized = rawBelt.trim();
    
    // Check direct enum match
    if (Object.values(Belt).includes(normalized as Belt)) {
        return normalized as Belt;
    }

    // Map No-Gi ranks to logic-friendly Belts if needed
    if (normalized === 'Beginner') return Belt.BEGINNER;
    if (normalized === 'Intermediate') return Belt.INTERMEDIATE;
    if (normalized === 'Advanced') return Belt.ADVANCED;
    if (normalized === 'Expert') return Belt.EXPERT;

    return Belt.WHITE; // Default fallback
};

const determineDiscipline = (row: string[], headerMap: Record<string, number>): Discipline => {
    const entryIdx = headerMap['Entry'];
    const divisionIdx = headerMap['Division'];
    const groupIdx = headerMap['Group'];

    const entry = (entryIdx !== undefined && row[entryIdx]) ? row[entryIdx].replace(/^"|"$/g, '') : '';
    const division = (divisionIdx !== undefined && row[divisionIdx]) ? row[divisionIdx].replace(/^"|"$/g, '') : '';
    const group = (groupIdx !== undefined && row[groupIdx]) ? row[groupIdx].replace(/^"|"$/g, '') : '';

    const combined = (entry + ' ' + division + ' ' + group).toLowerCase();

    if (combined.includes('no gi') || combined.includes('nogi')) {
        return Discipline.NOGI;
    }
    return Discipline.GI;
};

// Simple slugify for ID generation
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const parseCSV = (csvText: string): Competitor[] => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Get Headers
  const headers = parseCSVLine(lines[0]);
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerMap[h.replace(/^"|"$/g, '').trim()] = i; 
  });

  const competitors: Competitor[] = [];

  // Helper to get value by column name safely
  const getCol = (row: string[], colName: string): string => {
      const idx = headerMap[colName];
      return (idx !== undefined && row[idx]) ? row[idx].replace(/^"|"$/g, '') : '';
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    
    // Extract Fields based on the specific format provided
    const firstName = getCol(row, 'Firstname');
    const lastName = getCol(row, 'Lastname');
    const name = `${firstName} ${lastName}`;
    
    const academy = getCol(row, 'Team') || getCol(row, 'Club');
    
    const rawGender = getCol(row, 'Gender');
    const gender = rawGender === 'F' ? Gender.FEMALE : Gender.MALE;

    // Age Calculation
    const birthStr = getCol(row, 'Birth');
    let age = calculateAge(birthStr);
    if (age === 0) {
        // Fallback to Age column if Birth is missing/invalid
        const ageCol = parseInt(getCol(row, 'Age'));
        if (!isNaN(ageCol)) age = ageCol;
    }

    // Weight extraction
    let weight = parseFloat(getCol(row, 'Weighin weight'));
    if (isNaN(weight)) {
         const fallbackWeight = parseFloat(getCol(row, 'Weight'));
         if (!isNaN(fallbackWeight)) weight = fallbackWeight;
         else weight = 0; 
    }

    const rawBelt = getCol(row, 'Belt');
    const belt = normalizeBelt(rawBelt);

    const email = getCol(row, 'Email');
    const phone = getCol(row, 'Phone');
    
    const discipline = determineDiscipline(row, headerMap);

    // Notes aggregation
    const adminNote = getCol(row, 'Admin note');
    const paymentNote = getCol(row, 'Payment note');
    const publicNote = getCol(row, 'Public note');
    const notes = [adminNote, paymentNote, publicNote].filter(Boolean).join('\n');

    if (name.trim()) {
        // Generate a deterministic ID based on Name + Discipline + Division Group to allow Gi/NoGi as separate entries
        const groupStr = getCol(row, 'Group');
        const uniqueString = `${name}-${discipline}-${groupStr}-${i}`;
        
        competitors.push({
            id: `comp-${slugify(uniqueString)}`,
            name,
            academy,
            gender,
            age,
            weight,
            belt,
            discipline,
            email,
            phone,
            notes
        });
    }
  }

  return competitors;
};