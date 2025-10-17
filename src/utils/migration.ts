import { addSchool, addClass } from "@/services/schoolService";
import { getAllBirthdays, updateBirthday } from "@/services/birthdayService";

export const migrateToNewStructure = async (): Promise<{ schoolId: string; classId: string }> => {
  try {
    console.log("Starting migration to new structure...");

    // Step 1: Create the default school
    const schoolId = await addSchool({
      name: "Brains - Las Palmas",
    });
    console.log("Created school:", schoolId);

    // Step 2: Create the default class
    const classId = await addClass({
      name: "Superheroes - infantil",
      schoolId: schoolId,
    });
    console.log("Created class:", classId);

    // Step 3: Get all existing birthdays
    const existingBirthdays = await getAllBirthdays();
    console.log("Found existing birthdays:", existingBirthdays.length);

    // Step 4: Update each birthday to include the classId
    for (const birthday of existingBirthdays) {
      // Only update if birthday doesn't already have a classId
      if (!birthday.classId) {
        await updateBirthday(birthday.id, {
          classId: classId,
        });
        console.log(`Updated birthday ${birthday.name} with classId`);
      }
    }

    console.log("Migration completed successfully!");
    return { schoolId, classId };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Function to check if migration is needed
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const birthdays = await getAllBirthdays();
    // If any birthday doesn't have a classId, migration is needed
    return birthdays.some((birthday) => !birthday.classId);
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
};
