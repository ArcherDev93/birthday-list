export interface Birthday {
  id: string;
  name: string;
  birthDate: string; // ISO date string
  location?: string; // party location
  asistencia?: string[]; // list of kids attending
  age?: number; // calculated field
  daysUntilBirthday?: number; // calculated field
}

export interface BirthdayFormData {
  name: string;
  birthDate: string;
  location?: string;
  asistencia?: string[];
}
