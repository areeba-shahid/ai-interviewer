// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Your Firebase configuration
// Replace with your own Firebase config from https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Add scopes if needed
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Helper functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { user: null, error: error.message };
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: error.message };
  }
};

export { auth, googleProvider, signInWithGoogle, logout };
export default app;
