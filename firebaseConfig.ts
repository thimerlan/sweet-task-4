import { initializeApp } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const usersDB = getDatabase();
export default app;
