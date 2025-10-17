import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, setDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { School, Class, SchoolFormData, ClassFormData } from "@/types/school";
import { createSlug, generateUniqueSlug } from "@/utils/slugs";

// Helper function to get existing school slugs
const getExistingSchoolSlugs = async (): Promise<string[]> => {
  const q = query(collection(db, "schools"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.id);
};

// Helper function to get existing class slugs for a school
const getExistingClassSlugs = async (schoolId: string): Promise<string[]> => {
  const q = query(collection(db, "classes"), where("schoolId", "==", schoolId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.id);
};

// School operations
export const addSchool = async (schoolData: SchoolFormData): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const existingSlugs = await getExistingSchoolSlugs();
    const schoolId = generateUniqueSlug(schoolData.name, existingSlugs);

    await setDoc(doc(db, "schools", schoolId), {
      ...schoolData,
      createdAt: now,
      updatedAt: now,
    });

    return schoolId;
  } catch (error) {
    console.error("Error adding school:", error);
    throw error;
  }
};

export const updateSchool = async (schoolId: string, schoolData: SchoolFormData): Promise<void> => {
  try {
    const schoolRef = doc(db, "schools", schoolId);
    await updateDoc(schoolRef, {
      ...schoolData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
};

export const deleteSchool = async (schoolId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "schools", schoolId));
  } catch (error) {
    console.error("Error deleting school:", error);
    throw error;
  }
};

export const subscribeToSchools = (onSchoolsUpdate: (schools: School[]) => void, onError: (error: Error) => void) => {
  const q = query(collection(db, "schools"), orderBy("name"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const schools: School[] = [];
      querySnapshot.forEach((doc) => {
        schools.push({ id: doc.id, ...doc.data() } as School);
      });
      onSchoolsUpdate(schools);
    },
    onError
  );
};

// Class operations
export const addClass = async (classData: ClassFormData): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const existingSlugs = await getExistingClassSlugs(classData.schoolId);
    const classId = generateUniqueSlug(classData.name, existingSlugs);

    await setDoc(doc(db, "classes", classId), {
      ...classData,
      createdAt: now,
      updatedAt: now,
    });

    return classId;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

export const updateClass = async (classId: string, classData: ClassFormData): Promise<void> => {
  try {
    const classRef = doc(db, "classes", classId);
    await updateDoc(classRef, {
      ...classData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "classes", classId));
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

export const subscribeToClassesBySchool = (schoolId: string, onClassesUpdate: (classes: Class[]) => void, onError: (error: Error) => void) => {
  console.log("Subscribing to classes for schoolId:", schoolId);

  // Remove orderBy to avoid composite index requirement for now
  const q = query(collection(db, "classes"), where("schoolId", "==", schoolId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      console.log("Classes query result:", querySnapshot.size, "documents");
      const classes: Class[] = [];
      querySnapshot.forEach((doc) => {
        const classData = { id: doc.id, ...doc.data() } as Class;
        console.log("Found class:", classData);
        classes.push(classData);
      });

      // Sort manually by name
      classes.sort((a, b) => a.name.localeCompare(b.name));

      onClassesUpdate(classes);
    },
    (error) => {
      console.error("Error in classes subscription:", error);
      onError(error);
    }
  );
};

export const subscribeToAllClasses = (onClassesUpdate: (classes: Class[]) => void, onError: (error: Error) => void) => {
  const q = query(collection(db, "classes"), orderBy("name"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const classes: Class[] = [];
      querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() } as Class);
      });
      onClassesUpdate(classes);
    },
    onError
  );
};
