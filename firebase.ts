import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCuKeS4djQ-b8Lpj3Hr_92Qu2kUugeeR4c",
  authDomain: "spinstrike-bd.firebaseapp.com", 
  databaseURL: "https://spinstrike-bd-default-rtdb.firebaseio.com",
  projectId: "spinstrike-bd",
  storageBucket: "spinstrike-bd.firebasestorage.app",
  messagingSenderId: "178535326334",
  appId: "1:178535326334:web:f4bbc2afa6b5b1ac9b6e2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database instance
export const db = getDatabase(app);