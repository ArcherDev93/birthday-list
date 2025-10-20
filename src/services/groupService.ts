import { collection, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, setDoc, getDocs, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Group, GroupFormData } from "@/types/group";
import { generateUniqueSlug } from "@/utils/slugs";
import { generateTrustCode } from "@/utils/trustCode";

// Helper function to get existing group slugs for a specific user
const getExistingGroupSlugs = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, "groups"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.id);
};

// Group operations
export const addGroup = async (groupData: GroupFormData, userId: string): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const existingSlugs = await getExistingGroupSlugs(userId);
    const groupId = generateUniqueSlug(groupData.name, existingSlugs);
    const trustCode = generateTrustCode();

    await setDoc(doc(db, "groups", groupId), {
      ...groupData,
      userId, // Add user ID to group data
      trustCode, // Generate unique trust code
      members: [userId], // Initialize with creator as first member
      createdAt: now,
      updatedAt: now,
    });

    return groupId;
  } catch (error) {
    console.error("Error adding group:", error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, groupData: GroupFormData): Promise<void> => {
  try {
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      ...groupData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "groups", groupId));
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

export const subscribeToGroups = (userId: string, onGroupsUpdate: (groups: Group[]) => void, onError: (error: Error) => void) => {
  // Subscribe to groups where user is either owner or member
  const q = query(collection(db, "groups"), where("members", "array-contains", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const groups: Group[] = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() } as Group);
      });
      // Sort on the client side instead of in the query
      groups.sort((a, b) => a.name.localeCompare(b.name));
      onGroupsUpdate(groups);
    },
    onError
  );
};

export const subscribeToAllGroups = (userId: string, onGroupsUpdate: (groups: Group[]) => void, onError: (error: Error) => void) => {
  // Subscribe to groups where user is either owner or member
  const q = query(collection(db, "groups"), where("members", "array-contains", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const groups: Group[] = [];
      querySnapshot.forEach((doc) => {
        groups.push({ id: doc.id, ...doc.data() } as Group);
      });
      // Sort on the client side instead of in the query
      groups.sort((a, b) => a.name.localeCompare(b.name));
      onGroupsUpdate(groups);
    },
    onError
  );
};

// Get all groups for migration purposes
export const getAllGroups = async (userId: string): Promise<Group[]> => {
  try {
    const q = query(collection(db, "groups"), where("userId", "==", userId), orderBy("name"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Group)
    );
  } catch (error) {
    console.error("Error getting groups:", error);
    throw new Error("Failed to fetch groups");
  }
};

// Trust Code Management Functions

/**
 * Regenerate trust code for a group (only group owner can do this)
 */
export const regenerateTrustCode = async (groupId: string, userId: string): Promise<string> => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupDoc.data() as Group;

    // Only group owner can regenerate trust code
    if (groupData.userId !== userId) {
      throw new Error("Only group owner can regenerate trust code");
    }

    const newTrustCode = generateTrustCode();

    await updateDoc(groupRef, {
      trustCode: newTrustCode,
      updatedAt: new Date().toISOString(),
    });

    return newTrustCode;
  } catch (error) {
    console.error("Error regenerating trust code:", error);
    throw error;
  }
};

/**
 * Find group by trust code
 */
export const findGroupByTrustCode = async (trustCode: string): Promise<Group | null> => {
  try {
    const q = query(collection(db, "groups"), where("trustCode", "==", trustCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Group;
  } catch (error) {
    console.error("Error finding group by trust code:", error);
    throw error;
  }
};

/**
 * Join a group using trust code
 */
export const joinGroupByTrustCode = async (trustCode: string, userId: string): Promise<Group> => {
  try {
    const group = await findGroupByTrustCode(trustCode);

    if (!group) {
      throw new Error("Invalid trust code. Group not found.");
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      throw new Error("You are already a member of this group.");
    }

    // Add user to group members
    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      updatedAt: new Date().toISOString(),
    });

    // Return updated group data
    return { ...group, members: [...group.members, userId] };
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

/**
 * Leave a group (only for members, not owner)
 */
export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupDoc.data() as Group;

    // Group owner cannot leave their own group
    if (groupData.userId === userId) {
      throw new Error("Group owner cannot leave the group. Delete the group instead.");
    }

    // Remove user from members array
    const updatedMembers = groupData.members.filter((memberId) => memberId !== userId);

    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};
