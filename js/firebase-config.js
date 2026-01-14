import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, where, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCQx98zmqLpkr20GQjhXeUhJVC6UDKygNA",
  authDomain: "f1-merch-hub.firebaseapp.com",
  projectId: "f1-merch-hub",
  storageBucket: "f1-merch-hub.firebasestorage.app",
  messagingSenderId: "434932386418",
  appId: "1:434932386418:web:aa15e722537606972950eb",
  measurementId: "G-TR46LDQ8T2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, addDoc, doc, getDoc, getDocs, query, orderBy, limit, deleteDoc, updateDoc, where, setDoc };