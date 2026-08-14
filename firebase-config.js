import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

export {
    app,
    db
};
