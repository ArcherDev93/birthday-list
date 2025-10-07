import { Birthday } from "@/types/birthday";

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

export function calculateDaysUntilBirthday(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  const currentYear = today.getFullYear();

  // Create this year's birthday
  const thisYearBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());

  // If birthday has passed this year, calculate for next year
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(currentYear + 1);
  }

  const diffTime = thisYearBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function enrichBirthdayData(birthday: Omit<Birthday, "age" | "daysUntilBirthday">): Birthday {
  // Use celebrationDate for calculations, fallback to birthDate if available
  const dateForCalculation = birthday.celebrationDate || birthday.birthDate;
  
  if (!dateForCalculation) {
    return {
      ...birthday,
      age: 0,
      daysUntilBirthday: 0,
    };
  }
  
  return {
    ...birthday,
    age: birthday.birthDate ? calculateUpcomingAge(birthday.birthDate) : 0, // Age based on actual birth date
    daysUntilBirthday: calculateDaysUntilBirthday(dateForCalculation), // Days until celebration
  };
}

export function sortBirthdaysByUpcoming(birthdays: Birthday[]): Birthday[] {
  return [...birthdays].sort((a, b) => {
    const daysA = a.daysUntilBirthday || 0;
    const daysB = b.daysUntilBirthday || 0;
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
