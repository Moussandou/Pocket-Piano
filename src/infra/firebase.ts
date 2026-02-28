
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBBPQVQT_3vzM_UFVXwfPAN4C2cX8acuuM",
    authDomain: "pocket-piano-moussandou-1337.firebaseapp.com",
    projectId: "pocket-piano-moussandou-1337",
    storageBucket: "pocket-piano-moussandou-1337.firebasestorage.app",
    messagingSenderId: "921797701924",
    appId: "1:921797701924:web:aa07c3d4763710969883b1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
