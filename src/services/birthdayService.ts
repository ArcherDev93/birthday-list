import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Birthday } from "@/types/birthday";

const COLLECTION_NAME = "birthdays";

// Type for birthday data when adding to Firestore (without ID)
export type FirebaseBirthday = Omit<Birthday, "id">;

// Add a new birthday
export async function addBirthday(birthday: Omit<Birthday, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), birthday);
    return docRef.id;
  } catch (error) {
    console.error("Error adding birthday:", error);
    throw new Error("Failed to add birthday");
  }
}

// Update an existing birthday
export async function updateBirthday(id: string, birthday: Partial<Birthday>): Promise<void> {
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

// Get all birthdays (one-time fetch)
export async function getBirthdays(): Promise<Birthday[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("birthDate"));
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

// Subscribe to real-time updates
export function subscribeToBirthdays(callback: (birthdays: Birthday[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION_NAME), orderBy("birthDate"));

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

// Export data for sharing (same as before, but from Firestore)
export async function exportBirthdaysData(): Promise<string> {
  try {
    const birthdays = await getBirthdays();
    return JSON.stringify(birthdays);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
}
