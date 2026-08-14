import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBleFUWJq9xiSRZCMzxZG9VmWDayBmcGTg",
  authDomain: "neoncase.firebaseapp.com",
  projectId: "neoncase",
  storageBucket: "neoncase.firebasestorage.app",
  messagingSenderId: "1004163074284",
  appId: "1:1004163074284:web:4997dca90a0f06346bbdc9",
  measurementId: "G-NPMZHKJLYH"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
