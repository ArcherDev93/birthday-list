import { Event } from "@/types/event";

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Calculate the age they will turn on their next birthday
export function calculateUpcomingAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  const currentYear = today.getFullYear();

  // Create this year's birthday
  const thisYearBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());

  // If birthday hasn't happened this year, they'll turn currentYear - birthYear
  // If birthday has passed this year, they'll turn (currentYear + 1) - birthYear
  if (thisYearBirthday >= today) {
    return currentYear - birth.getFullYear();
  } else {
    return currentYear + 1 - birth.getFullYear();
  }
}

export function calculateDaysUntilEvent(eventDate: string): number {
  const today = new Date();
  const event = new Date(eventDate);
  const currentYear = today.getFullYear();

  // Create this year's event date
  const thisYearEvent = new Date(currentYear, event.getMonth(), event.getDate());

  // If event has passed this year, calculate for next year
  if (thisYearEvent < today) {
    thisYearEvent.setFullYear(currentYear + 1);
  }

  const diffTime = thisYearEvent.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function enrichEventData(event: Omit<Event, "age" | "daysUntilEvent">): Event {
  // Use celebrationDate for calculations
  const dateForCalculation = event.celebrationDate;

  if (!dateForCalculation) {
    return {
      ...event,
      age: 0,
      daysUntilEvent: 0,
    };
  }

  return {
    ...event,
    age: event.birthDate ? calculateUpcomingAge(event.birthDate) : undefined, // Age based on actual birth date
    daysUntilEvent: calculateDaysUntilEvent(dateForCalculation), // Days until celebration
  };
}

export function sortEventsByUpcoming(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const daysA = a.daysUntilEvent || 0;
    const daysB = b.daysUntilEvent || 0;
    return daysA - daysB;
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

// Get events by category
export function filterEventsByCategory(events: Event[], category: string): Event[] {
  return events.filter((event) => event.categories && event.categories.includes(category));
}

// Get all unique categories from events
export function getUniqueCategories(events: Event[]): string[] {
  const categories = new Set<string>();
  events.forEach((event) => {
    if (event.categories) {
      event.categories.forEach((category) => categories.add(category));
    }
  });
  return Array.from(categories).sort();
}
