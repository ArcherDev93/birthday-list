export interface Birthday {
  id: string;
  name: string;
  birthDate: string; // ISO date string
  age?: number; // calculated field
  daysUntilBirthday?: number; // calculated field
}

export interface BirthdayFormData {
  name: string;
  birthDate: string;
}
