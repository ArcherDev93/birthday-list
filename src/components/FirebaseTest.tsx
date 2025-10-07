"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function FirebaseTest() {
  const [status, setStatus] = useState("Testing Firebase connection...");
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setDetails((prev) => [...prev, "Attempting to connect to Firebase..."]);

        // Test basic connection
        const testCollection = collection(db, "test");
        setDetails((prev) => [...prev, "Created collection reference"]);

        // Try to read from Firestore (this will create the database if it doesn't exist)
        const querySnapshot = await getDocs(testCollection);
        setDetails((prev) => [...prev, `Successfully connected! Found ${querySnapshot.size} documents in test collection`]);

        // Now test the birthdays collection
        const birthdaysCollection = collection(db, "birthdays");
        const birthdaysSnapshot = await getDocs(birthdaysCollection);
        setDetails((prev) => [...prev, `Birthdays collection: ${birthdaysSnapshot.size} documents`]);

        setStatus("✅ Firebase connection successful!");
      } catch (error: unknown) {
        console.error("Firebase test error:", error);
        setStatus("❌ Firebase connection failed");
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorCode = (error as { code?: string })?.code || "Unknown";
        setDetails((prev) => [...prev, `Error: ${errorCode} - ${errorMessage}`]);

        if (errorCode === "permission-denied") {
          setDetails((prev) => [...prev, "This is likely a Firestore security rules issue"]);
        } else if (errorCode === "not-found") {
          setDetails((prev) => [...prev, "Firestore database may not be initialized"]);
        }
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔥 Firebase Connection Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">{status}</h2>
        <div className="space-y-1">
          {details.map((detail, index) => (
            <div key={index} className="text-sm text-gray-700">
              {index + 1}. {detail}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Environment Check:</h3>
        <div className="text-sm space-y-1">
          <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not set"}</div>
          <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not set"}</div>
          <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Not set"}</div>
        </div>
      </div>
    </div>
  );
}
