export interface Birthday {
  id: string;
  name: string;
  birthDate?: string; // ISO date string - optional (actual birth date)
  celebrationDate: string; // ISO date string - required (party/celebration date)
  location?: string; // party location
  asistencia?: string[]; // list of kids attending
  age?: number; // calculated field
  daysUntilBirthday?: number; // calculated field
}

export interface BirthdayFormData {
  name: string;
  birthDate?: string;
  celebrationDate: string;
  location?: string;
  asistencia?: string[];
}
