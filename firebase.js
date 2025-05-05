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
  apiKey: "AIzaSyBD64PYetcAeT5yP-_08FwtPM2PlsukmEQ",
  authDomain: "usos-eb512.firebaseapp.com",
  projectId: "usos-eb512",
  storageBucket: "usos-eb512.firebasestorage.app",
  messagingSenderId: "591435018675",
  appId: "1:591435018675:web:4c94a9a7a6c7be96ca5bc6",
  measurementId: "G-9DP72BDMVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);

export { auth,firestore };