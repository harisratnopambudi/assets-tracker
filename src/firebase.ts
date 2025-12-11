// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBwziLfqqHCAsP2a0ckPjs4nLlveA6d7XI",
    authDomain: "asset-tracker-ec242.firebaseapp.com",
    projectId: "asset-tracker-ec242",
    storageBucket: "asset-tracker-ec242.firebasestorage.app",
    messagingSenderId: "530517126858",
    appId: "1:530517126858:web:f5ec055a3b24bae5b24e33",
    measurementId: "G-MN441VE3X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics: any = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

export { analytics };
export default app;
