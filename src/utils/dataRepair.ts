import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { School, Class } from "@/types/school";
import { createSlug, generateUniqueSlug } from "@/utils/slugs";

/**
 * Repairs existing data by converting random Firebase IDs to slug-based IDs
 */
export const repairExistingData = async () => {
  try {
    console.log("Starting data repair...");

    // Get all existing schools
    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    const schools: (School & { oldId: string })[] = [];

    schoolsSnapshot.forEach((doc) => {
      schools.push({
        id: doc.id,
        oldId: doc.id,
        ...doc.data(),
      } as School & { oldId: string });
    });

    console.log("Found schools:", schools.length);

    // Create mapping of old IDs to new slug IDs
    const schoolIdMapping: { [oldId: string]: string } = {};
    const existingSchoolSlugs: string[] = [];

    // Process schools
    for (const school of schools) {
      const newSlug = generateUniqueSlug(school.name, existingSchoolSlugs);
      existingSchoolSlugs.push(newSlug);
      schoolIdMapping[school.oldId] = newSlug;

      // Only migrate if the ID is not already a slug
      if (school.oldId !== newSlug) {
        console.log(`Migrating school "${school.name}" from ${school.oldId} to ${newSlug}`);

        // Create new document with slug ID
        await setDoc(doc(db, "schools", newSlug), {
          name: school.name,
          createdAt: school.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Delete old document
        await deleteDoc(doc(db, "schools", school.oldId));
      } else {
        console.log(`School "${school.name}" already has slug ID: ${newSlug}`);
      }
    }

    // Get all existing classes
    const classesSnapshot = await getDocs(collection(db, "classes"));
    const classes: (Class & { oldId: string })[] = [];

    classesSnapshot.forEach((doc) => {
      classes.push({
        id: doc.id,
        oldId: doc.id,
        ...doc.data(),
      } as Class & { oldId: string });
    });

    console.log("Found classes:", classes.length);

    // Process classes
    for (const classItem of classes) {
      const newSchoolId = schoolIdMapping[classItem.schoolId] || classItem.schoolId;
      const existingClassSlugs = classes.filter((c) => (schoolIdMapping[c.schoolId] || c.schoolId) === newSchoolId).map((c) => createSlug(c.name));

      const newSlug = generateUniqueSlug(classItem.name, existingClassSlugs);

      // Only migrate if the ID is not already a slug
      if (classItem.oldId !== newSlug) {
        console.log(`Migrating class "${classItem.name}" from ${classItem.oldId} to ${newSlug}`);

        // Create new document with slug ID
        await setDoc(doc(db, "classes", newSlug), {
          name: classItem.name,
          schoolId: newSchoolId,
          createdAt: classItem.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Delete old document
        await deleteDoc(doc(db, "classes", classItem.oldId));

        // Update any birthdays that reference this class
        await updateBirthdaysClassId(classItem.oldId, newSlug);
      } else {
        console.log(`Class "${classItem.name}" already has slug ID: ${newSlug}`);
      }
    }

    console.log("Data repair completed!");
    return { success: true, schoolIdMapping };
  } catch (error) {
    console.error("Data repair failed:", error);
    throw error;
  }
};

/**
 * Updates birthdays to use new class ID
 */
async function updateBirthdaysClassId(oldClassId: string, newClassId: string) {
  try {
    const { getAllBirthdays, updateBirthday } = await import("@/services/birthdayService");
    const birthdays = await getAllBirthdays();

    for (const birthday of birthdays) {
      if (birthday.classId === oldClassId) {
        await updateBirthday(birthday.id, { classId: newClassId });
        console.log(`Updated birthday "${birthday.name}" classId from ${oldClassId} to ${newClassId}`);
      }
    }
  } catch (error) {
    console.error("Error updating birthday classIds:", error);
  }
}
