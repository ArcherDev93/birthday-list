import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot, Unsubscribe, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event, EventFormData } from "@/types/event";

const COLLECTION_NAME = "events";

// Add a new event
export async function addEvent(event: EventFormData, userId: string): Promise<string> {
  try {
    const eventWithUser = { ...event, userId }; // Add user ID
    const docRef = await addDoc(collection(db, COLLECTION_NAME), eventWithUser);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Failed to add event");
  }
}

// Update an existing event
export async function updateEvent(id: string, event: Partial<EventFormData>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, event);
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
}

// Delete an event
export async function deleteEvent(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}

// Get all events for a specific group (one-time fetch)
export async function getEventsByGroup(groupId: string, userId: string): Promise<Event[]> {
  try {
    // Query events for specific group and user
    const q = query(collection(db, COLLECTION_NAME), where("groupId", "==", groupId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Event)
    );

    // Sort manually by celebration date
    events.sort((a, b) => {
      const dateA = new Date(a.celebrationDate);
      const dateB = new Date(b.celebrationDate);
      return dateA.getTime() - dateB.getTime();
    });

    return events;
  } catch (error) {
    console.error("Error getting events:", error);
    throw new Error("Failed to fetch events");
  }
}

// Get all events (for migration purposes)
export async function getAllEvents(userId: string): Promise<Event[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Event)
    );

    // Sort on the client side instead of in the query
    events.sort((a, b) => {
      const dateA = new Date(a.celebrationDate);
      const dateB = new Date(b.celebrationDate);
      return dateA.getTime() - dateB.getTime();
    });

    return events;
  } catch (error) {
    console.error("Error getting events:", error);
    throw new Error("Failed to fetch events");
  }
}

// Subscribe to real-time updates for a specific group
export function subscribeToEventsByGroup(groupId: string, userId: string, callback: (events: Event[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  // Query events for specific group and user
  const q = query(collection(db, COLLECTION_NAME), where("groupId", "==", groupId), where("userId", "==", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const events = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Event)
      );

      // Sort manually by celebration date
      events.sort((a, b) => {
        const dateA = new Date(a.celebrationDate);
        const dateB = new Date(b.celebrationDate);
        return dateA.getTime() - dateB.getTime();
      });

      callback(events);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (errorCallback) {
        errorCallback(new Error(error.message || "Unknown Firebase error"));
      }
    }
  );
}

// Legacy function for backward compatibility - subscribe to all events
export function subscribeToEvents(callback: (events: Event[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION_NAME), orderBy("celebrationDate"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const events = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Event)
      );

      callback(events);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (errorCallback) {
        errorCallback(new Error(error.message || "Unknown Firebase error"));
      }
    }
  );
}

// Export data for sharing (for a specific group)
export async function exportEventsData(userId: string, groupId?: string): Promise<string> {
  try {
    const events = groupId ? await getEventsByGroup(groupId, userId) : await getAllEvents(userId);
    return JSON.stringify(events);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
}

// Get events by category
export async function getEventsByCategory(category: string, userId: string): Promise<Event[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("categories", "array-contains", category), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Event)
    );

    // Sort manually by celebration date
    events.sort((a, b) => {
      const dateA = new Date(a.celebrationDate);
      const dateB = new Date(b.celebrationDate);
      return dateA.getTime() - dateB.getTime();
    });

    return events;
  } catch (error) {
    console.error("Error getting events by category:", error);
    throw new Error("Failed to fetch events by category");
  }
}

// Subscribe to events by category
export function subscribeToEventsByCategory(category: string, userId: string, callback: (events: Event[]) => void, errorCallback?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION_NAME), where("categories", "array-contains", category), where("userId", "==", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const events = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Event)
      );

      // Sort manually by celebration date
      events.sort((a, b) => {
        const dateA = new Date(a.celebrationDate);
        const dateB = new Date(b.celebrationDate);
        return dateA.getTime() - dateB.getTime();
      });

      callback(events);
    },
    (error) => {
      console.error("Error in real-time listener:", error);
      if (errorCallback) {
        errorCallback(new Error(error.message || "Unknown Firebase error"));
      }
    }
  );
}
