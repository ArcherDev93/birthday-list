export interface Event {
  id: string;
  name: string;
  birthDate?: string; // ISO date string - optional (actual birth date)
  celebrationDate: string; // ISO date string - required (party/celebration date)
  location?: string; // party location
  attendees?: string[]; // list of people attending (renamed from asistencia)
  groupId: string; // reference to the group this event belongs to
  userId: string; // owner of the event
  categories: string[]; // categories like ["birthday", "party", "celebration", etc.]
  age?: number; // calculated field
  daysUntilEvent?: number; // calculated field (renamed from daysUntilBirthday)
}

export interface EventFormData {
  name: string;
  birthDate?: string;
  celebrationDate: string;
  location?: string;
  attendees?: string[];
  groupId: string; // required when creating/editing events
  categories: string[];
}
