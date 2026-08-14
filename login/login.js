/* =========================================================
   NEONCASE LOGIN
========================================================= */

/* =========================================================
   NEONCASE — FIREBASE GOOGLE LOGIN
========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBleFUWJq9xiSRZCMzxZG9VmWDayBmcGTg",

    authDomain:
        "neoncase.firebaseapp.com",

    projectId:
        "neoncase",

    storageBucket:
        "neoncase.firebasestorage.app",

    messagingSenderId:
        "1004163074284",

    appId:
        "1:1004163074284:web:4997dca90a0f06346bbdc9",

    measurementId:
        "G-NPMZHKJLYH"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const provider =
    new GoogleAuthProvider();


/* =========================================================
   ELEMENTS
========================================================= */

const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================================================
   GOOGLE LOGIN
========================================================= */

googleLogin.addEventListener(
    "click",
    async function () {

        try {

            googleLogin.disabled = true;

            loginMessage.textContent =
                "Connecting to Google...";

            await signInWithRedirect(
                auth,
                provider
            );

        }

        catch (error) {

            console.error(
                "Google Login Error:",
                error
            );

            googleLogin.disabled = false;

            loginMessage.textContent =
                "Unable to sign in. Please try again.";

        }

    }
);


/* =========================================================
   CHECK LOGIN RESULT
========================================================= */

getRedirectResult(auth)

    .then((result) => {

        if (!result) {

            return;

        }


        const user =
            result.user;


        console.log(
            "Logged in user:",
            user
        );


        /*
         * TEMPORARY:
         * For now we only confirm login.
         *
         * Later this will become:
         *
         * login → order/index.html
         */

        loginMessage.textContent =
            `Welcome, ${user.displayName || "Customer"}!`;


        /*
         * NEXT STEP:
         *
         * window.location.href =
         * "../order/index.html";
         */

    })


    .catch((error) => {

        console.error(
            "Login Result Error:",
            error
        );

        loginMessage.textContent =
            "Google sign-in could not be completed.";

    });
