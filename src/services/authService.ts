import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, updateProfile, sendPasswordResetEmail, User, AuthError } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    theme?: "light" | "dark";
    language?: string;
    notifications?: boolean;
  };
}

export interface AuthResult {
  user: User | null;
  error?: string;
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user profile in Firestore
    await createUserProfile(user, displayName);

    return { user };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: getAuthErrorMessage(authError.code),
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: getAuthErrorMessage(authError.code),
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Check if user profile exists, create if not
    const userProfileExists = await getUserProfile(user.uid);
    if (!userProfileExists) {
      await createUserProfile(user);
    }

    return { user };
  } catch (error) {
    const authError = error as AuthError;
    return {
      user: null,
      error: getAuthErrorMessage(authError.code),
    };
  }
};

// Sign out
export const signOutUser = async (): Promise<{ error?: string }> => {
  try {
    await signOut(auth);
    return {};
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError.code) };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error?: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {};
  } catch (error) {
    const authError = error as AuthError;
    return { error: getAuthErrorMessage(authError.code) };
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user: User, displayName?: string): Promise<void> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    displayName: displayName || user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      theme: "light",
      language: "es",
      notifications: true,
    },
  };

  await setDoc(doc(db, "users", user.uid), userProfile);
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<{ error?: string }> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return {};
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "Failed to update profile" };
  }
};

// Update user display name
export const updateUserDisplayName = async (displayName: string): Promise<{ error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "No user signed in" };
    }

    await updateProfile(user, { displayName });
    await updateUserProfile(user.uid, { displayName });
    return {};
  } catch (error) {
    console.error("Error updating display name:", error);
    return { error: "Failed to update display name" };
  }
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No se encontró una cuenta con este email";
    case "auth/wrong-password":
      return "Contraseña incorrecta";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con este email";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres";
    case "auth/invalid-email":
      return "Email inválido";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta más tarde";
    case "auth/network-request-failed":
      return "Error de conexión. Verifica tu internet";
    case "auth/popup-closed-by-user":
      return "Inicio de sesión cancelado";
    default:
      return "Error de autenticación. Intenta de nuevo";
  }
};
