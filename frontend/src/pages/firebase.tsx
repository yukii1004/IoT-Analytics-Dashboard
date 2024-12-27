import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = { 
    apiKey: "AIzaSyB6DMbyzYfZ9mTmRw_8ilEsxcH69k36h9A", 
    authDomain: "iot-dashboard-d70c0.firebaseapp.com", 
    projectId: "iot-dashboard-d70c0", 
    storageBucket: "iot-dashboard-d70c0.appspot.com", 
    messagingSenderId: "385216457630", 
    appId: "1:385216457630:web:ea1f43bc0181f91b81848f", 
    measurementId: "G-YTB3F5VL3G" }; 

const app = initializeApp(firebaseConfig); 
export const auth = getAuth(); 
export const db = getFirestore(app); 
export default app;