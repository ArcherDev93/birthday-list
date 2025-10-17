import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Fixes missing or invalid createdAt/updatedAt dates in existing documents
 */
export const fixInvalidDates = async () => {
  try {
    console.log("Starting date repair...");

    // Fix schools
    const schoolsSnapshot = await getDocs(collection(db, "schools"));
    for (const schoolDoc of schoolsSnapshot.docs) {
      const schoolData = schoolDoc.data();
      let needsUpdate = false;
      const updates: any = {};

      // Check if createdAt is missing or invalid
      if (!schoolData.createdAt || isNaN(new Date(schoolData.createdAt).getTime())) {
        updates.createdAt = new Date().toISOString();
        needsUpdate = true;
        console.log(`Fixing createdAt for school: ${schoolData.name}`);
      }

      // Check if updatedAt is missing or invalid
      if (!schoolData.updatedAt || isNaN(new Date(schoolData.updatedAt).getTime())) {
        updates.updatedAt = new Date().toISOString();
        needsUpdate = true;
        console.log(`Fixing updatedAt for school: ${schoolData.name}`);
      }

      if (needsUpdate) {
        await updateDoc(doc(db, "schools", schoolDoc.id), updates);
      }
    }

    // Fix classes
    const classesSnapshot = await getDocs(collection(db, "classes"));
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      let needsUpdate = false;
      const updates: any = {};

      // Check if createdAt is missing or invalid
      if (!classData.createdAt || isNaN(new Date(classData.createdAt).getTime())) {
        updates.createdAt = new Date().toISOString();
        needsUpdate = true;
        console.log(`Fixing createdAt for class: ${classData.name}`);
      }

      // Check if updatedAt is missing or invalid
      if (!classData.updatedAt || isNaN(new Date(classData.updatedAt).getTime())) {
        updates.updatedAt = new Date().toISOString();
        needsUpdate = true;
        console.log(`Fixing updatedAt for class: ${classData.name}`);
      }

      if (needsUpdate) {
        await updateDoc(doc(db, "classes", classDoc.id), updates);
      }
    }

    console.log("Date repair completed!");
    return { success: true };
  } catch (error) {
    console.error("Date repair failed:", error);
    throw error;
  }
};
