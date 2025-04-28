// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLfiBjHesFjiw0JxN50nTmg0wrpzTa1f0",
  authDomain: "usos-2b8b3.firebaseapp.com",
  projectId: "usos-2b8b3",
  storageBucket: "usos-2b8b3.firebasestorage.app",
  messagingSenderId: "529846891029",
  appId: "1:529846891029:web:6e11fee971172cfd2b941c",
  measurementId: "G-0Q3XW4T5KB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);

export { auth,firestore };