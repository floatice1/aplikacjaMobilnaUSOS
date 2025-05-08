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
  apiKey: "AIzaSyAhLbB_T5ORF1YCEOINcHGlhvx-L_hdSNE",
  authDomain: "usos2-326e4.firebaseapp.com",
  projectId: "usos2-326e4",
  storageBucket: "usos2-326e4.firebasestorage.app",
  messagingSenderId: "190232682270",
  appId: "1:190232682270:web:fa1a743de6d4d48341f30f",
  measurementId: "G-GN0YLKE66W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);

export { auth,firestore };