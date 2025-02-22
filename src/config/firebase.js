import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBOzdG15pPvoA5WTr__Hoku0qFmAQMXEoE",
  authDomain: "starcadence-a6850.firebaseapp.com",
  projectId: "starcadence-a6850",
  storageBucket: "starcadence-a6850.firebasestorage.app",
  messagingSenderId: "1084181145552",
  appId: "1:1084181145552:web:568ac0ff672a94b15ffbd5",
  measurementId: "G-C3X75PGG78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics }; 