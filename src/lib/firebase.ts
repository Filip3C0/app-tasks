
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyA06MYTTaz9avNLBVCm3OgAygK9zGCnsRM",
  authDomain: "tasks-field-services.firebaseapp.com",
  databaseURL: "https://tasks-field-services-default-rtdb.firebaseio.com",
  projectId: "tasks-field-services",
  storageBucket: "tasks-field-services.firebasestorage.app",
  messagingSenderId: "869022037892",
  appId: "1:869022037892:web:7691f20abf38d588498fd1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app);

