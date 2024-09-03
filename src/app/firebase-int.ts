// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDXT1Wb_fxbzQyeDNka5yd70jHNNTOjnYQ",
    authDomain: "game-33e6e.firebaseapp.com",
    databaseURL: "https://game-33e6e-default-rtdb.firebaseio.com",
    projectId: "game-33e6e",
    storageBucket: "game-33e6e.appspot.com",
    messagingSenderId: "491138425763",
    appId: "1:491138425763:web:ecfc894384f606da82f016",
    measurementId: "G-4RF5XRPBD1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue };