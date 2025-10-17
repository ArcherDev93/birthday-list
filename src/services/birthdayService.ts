import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot, Unsubscribe, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Birthday, BirthdayFormData } from "@/types/birthday";

const COLLECTION_NAME = "birthdays";

// Add a new birthday
export async function addBirthday(birthday: BirthdayFormData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), birthday);
    return docRef.id;
  } catch (error) {
    console.error("Error adding birthday:", error);
    throw new Error("Failed to add birthday");
  }
}

// Update an existing birthday
export async function updateBirthday(id: string, birthday: Partial<BirthdayFormData>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, birthday);
  } catch (error) {
    console.error("Error updating birthday:", error);
    throw new Error("Failed to update birthday");
  }
}

// Delete a birthday
export async function deleteBirthday(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting birthday:", error);
    throw new Error("Failed to delete birthday");
  }
}

// Get all birthdays for a specific class (one-time fetch)
export async function getBirthdaysByClass(classId: string): Promise<Birthday[]> {
  try {
    // Remove orderBy to avoid composite index requirement
    const q = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));
    const querySnapshot = await getDocs(q);

    const birthdays = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Birthday)
    );

    // Sort manually by celebration date
    birthdays.sort((a, b) => {
      const dateA = new Date(a.celebrationDate);
      const dateB = new Date(b.celebrationDate);
      return dateA.getTime() - dateB.getTime();
    });

    return birthdays;
  } catch (error) {
    console.error("Error getting birthdays:", error);
    throw new Error("Failed to fetch birthdays");
  }
}

// Get all birthdays (for migration purposes)
export async function getAllBirthdays(): Promise<Birthday[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("celebrationDate"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Birthday)
    );
  } catch (error) {
    console.error("Error getting birthdays:", error);
    throw new Error("Failed to fetch birthdays");
  }
}

// Subscribe to real-time updates for a specific class
export function subscribeToBirthdaysByClass(classId: string, callback: (birthdays: Birthday[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  // Remove orderBy to avoid composite index requirement
  const q = query(collection(db, COLLECTION_NAME), where("classId", "==", classId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const birthdays = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Birthday)
      );

      // Sort manually by celebration date
      birthdays.sort((a, b) => {
        const dateA = new Date(a.celebrationDate);
        const dateB = new Date(b.celebrationDate);
        return dateA.getTime() - dateB.getTime();
      });

      callback(birthdays);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (errorCallback) {
        errorCallback(new Error(error.message || "Unknown Firebase error"));
      }
    }
  );
}

// Legacy function for backward compatibility - subscribe to all birthdays
export function subscribeToBirthdays(callback: (birthdays: Birthday[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION_NAME), orderBy("celebrationDate"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const birthdays = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Birthday)
      );

      callback(birthdays);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (errorCallback) {
        errorCallback(new Error(error.message || "Unknown Firebase error"));
      }
    }
  );
}

// Export data for sharing (for a specific class)
export async function exportBirthdaysData(classId?: string): Promise<string> {
  try {
    const birthdays = classId ? await getBirthdaysByClass(classId) : await getAllBirthdays();
    return JSON.stringify(birthdays);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
}
