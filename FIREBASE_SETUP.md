# Firebase Setup Instructions for Birthday List

This guide will help you set up Firebase Firestore to replace local storage with a cloud database.

## Prerequisites

1. A Google account
2. Node.js project already set up (which you have)

## Step-by-Step Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "birthday-list-app")
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### 2. Set up Firestore Database

1. In your Firebase project dashboard, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

### 3. Get Firebase Configuration

1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register app name (e.g., "Birthday List")
5. Don't check "Firebase Hosting" for now
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 4. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Firebase config:

```bash
# ✅ CONFIGURED - Your actual Firebase values are set
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-6eMsp16bFxNC7R0ORJsS0MmAv34yF7c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=birthday-list-363f7.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=birthday-list-363f7
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=birthday-list-363f7.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=839104157887
NEXT_PUBLIC_FIREBASE_APP_ID=1:839104157887:web:784d8d0776c47e68504e0a
```

### 5. Update Your Main Page

Replace the import in `src/app/page.tsx`:

```typescript
// Change this:
import BirthdayList from "@/components/BirthdayList";

// To this:
import BirthdayListFirebase from "@/components/BirthdayListFirebase";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <BirthdayListFirebase />
    </div>
  );
}
```

### 6. Set Firestore Security Rules (Optional but Recommended)

1. Go to Firebase Console → Firestore Database → Rules
2. For development, you can use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to birthdays collection
    match /birthdays/{document=**} {
      allow read, write: if true; // Change this for production
    }
  }
}
```

For production, consider adding authentication and more restrictive rules.

## Key Changes Made

### New Files Created:

- `src/lib/firebase.ts` - Firebase configuration
- `src/services/birthdayService.ts` - Firestore operations
- `src/components/BirthdayListFirebase.tsx` - Firebase-enabled component
- `.env.local` - Environment variables (you need to fill this)

### Key Differences from Local Storage Version:

1. **Real-time Updates**: Multiple users can see changes instantly
2. **Cloud Storage**: Data persists across devices and browsers
3. **Collaborative**: Multiple people can edit simultaneously
4. **Error Handling**: Better error handling for network issues
5. **Loading States**: Shows loading indicator while fetching data

## Testing Your Setup

1. Make sure your `.env.local` file has the correct Firebase values
2. Update `src/app/page.tsx` to use `BirthdayListFirebase`
3. Run `npm run dev`
4. Add a birthday and check if it appears in Firebase Console → Firestore Database

## Troubleshooting

### Common Issues:

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**

   - Check that your environment variables are correct
   - Make sure variable names start with `NEXT_PUBLIC_`

2. **"Missing or insufficient permissions"**

   - Check Firestore security rules
   - Make sure you're in "test mode" for development

3. **Environment variables not loading**
   - Restart your development server after changing `.env.local`
   - Double-check variable names and values

### Firebase Console Debugging:

- Go to Firestore Database → Data tab to see your stored birthdays
- Check the "Usage" tab to monitor your free tier limits

## Free Tier Limits

Firebase Firestore free tier includes:

- 1 GB storage
- 50,000 reads per day
- 20,000 writes per day
- 20,000 deletes per day

This is more than enough for a family birthday list!

## Next Steps (Optional)

1. **Add Authentication**: Allow users to have private birthday lists
2. **Improve Security Rules**: Restrict access based on user authentication
3. **Add Offline Support**: Use Firebase's offline persistence
4. **Deploy to Production**: Use Vercel or Firebase Hosting
