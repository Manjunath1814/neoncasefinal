/* =========================================================
   NEONCASE — GOOGLE LOGIN
   FIXED VERSION
========================================================= */

import { firebaseConfig } from "../firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

let app;
let auth;
let provider;

try {

    app = initializeApp(firebaseConfig);

    auth = getAuth(app);

    provider = new GoogleAuthProvider();

    console.log("Firebase initialized successfully.");

} catch (error) {

    console.error("FIREBASE INITIALIZATION ERROR:", error);

    const message = document.getElementById("loginMessage");

    if (message) {
        message.textContent =
            "Firebase could not be initialized. Check firebase-config.js";
    }

    throw error;
}


/* =========================================================
   HTML ELEMENTS
========================================================= */

const googleButton =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


/* =========================================================
   CHECK HTML
========================================================= */

if (!googleButton) {

    console.error(
        'ERROR: Button with id="googleLogin" was not found.'
    );

    if (loginMessage) {
        loginMessage.textContent =
            "Login button was not found.";
    }

} else {

    console.log("Google login button found.");

}


/* =========================================================
   FIREBASE LOGIN PERSISTENCE
========================================================= */

try {

    await setPersistence(
        auth,
        browserLocalPersistence
    );

    console.log("Firebase persistence enabled.");

} catch (error) {

    console.warn(
        "Persistence failed, continuing with login:",
        error
    );

    /*
       IMPORTANT:
       We DO NOT stop the login if persistence fails.
    */
}


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {
            console.log("No existing Firebase user.");
            return;
        }

        console.log(
            "Existing Firebase user:",
            user.email
        );

        if (loginMessage) {

            loginMessage.textContent =
                `Welcome back, ${
                    user.displayName || "Customer"
                }`;

        }

        setTimeout(() => {

            window.location.href =
                "../order/index.html";

        }, 700);

    }
);


/* =========================================================
   GOOGLE SIGN-IN
========================================================= */

if (googleButton) {

    googleButton.addEventListener(
        "click",
        async () => {

            console.log("Google button clicked.");

            try {

                googleButton.disabled = true;

                if (loginMessage) {
                    loginMessage.textContent =
                        "Opening Google...";
                }


                console.log(
                    "Starting Google sign-in..."
                );


                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );


                const user =
                    result.user;


                console.log(
                    "GOOGLE LOGIN SUCCESSFUL"
                );

                console.log(
                    "Name:",
                    user.displayName
                );

                console.log(
                    "Email:",
                    user.email
                );

                console.log(
                    "UID:",
                    user.uid
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        "Login successful. Opening your order...";

                }


                setTimeout(() => {

                    window.location.href =
                        "../order/index.html";

                }, 500);


            } catch (error) {

                console.error(
                    "=============================="
                );

                console.error(
                    "GOOGLE LOGIN ERROR"
                );

                console.error(
                    "ERROR CODE:",
                    error.code
                );

                console.error(
                    "ERROR MESSAGE:",
                    error.message
                );

                console.error(
                    "FULL ERROR:",
                    error
                );

                console.error(
                    "=============================="
                );


                googleButton.disabled = false;


                /* -----------------------------------------
                   USER CANCELLED POPUP
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/popup-closed-by-user"
                ) {

                    loginMessage.textContent =
                        "Google sign-in was cancelled.";

                    return;
                }


                /* -----------------------------------------
                   POPUP BLOCKED
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/popup-blocked"
                ) {

                    loginMessage.textContent =
                        "Google popup was blocked. Please allow popups and try again.";

                    return;
                }


                /* -----------------------------------------
                   UNAUTHORIZED DOMAIN
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/unauthorized-domain"
                ) {

                    loginMessage.textContent =
                        "This website domain is not authorized in Firebase.";

                    return;
                }


                /* -----------------------------------------
                   OPERATION NOT ALLOWED
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/operation-not-allowed"
                ) {

                    loginMessage.textContent =
                        "Google Sign-In is not enabled in Firebase.";

                    return;
                }


                /* -----------------------------------------
                   POPUP OPERATION NOT SUPPORTED
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/popup-operation-not-supported"
                ) {

                    loginMessage.textContent =
                        "Google popup login is not supported in this browser.";

                    return;
                }


                /* -----------------------------------------
                   NETWORK ERROR
                ----------------------------------------- */

                if (
                    error.code ===
                    "auth/network-request-failed"
                ) {

                    loginMessage.textContent =
                        "Network error. Please check your internet connection.";

                    return;
                }


                /* -----------------------------------------
                   GENERAL ERROR
                ----------------------------------------- */

                loginMessage.textContent =
                    error.code ||
                    error.message ||
                    "Unable to sign in. Please try again.";

            }

        }
    );

}
