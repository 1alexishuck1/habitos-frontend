import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBtiyhV52fjmG2w_LpOjwzHDSYveweK8xI",
    authDomain: "habitos-app-ah.firebaseapp.com",
    projectId: "habitos-app-ah",
    storageBucket: "habitos-app-ah.firebasestorage.app",
    messagingSenderId: "758351107342",
    appId: "1:758351107342:web:5f64be50c65706bf9c335f"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
