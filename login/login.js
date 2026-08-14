/* =========================================================
   NEONCASE — GOOGLE LOGIN
========================================================= */

import { firebaseConfig }
    from "../firebase-config.js";


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

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const provider =
    new GoogleAuthProvider();



/* =========================================================
   FIREBASE LOGIN PERSISTENCE
========================================================= */

await setPersistence(
    auth,
    browserLocalPersistence
);



/* =========================================================
   HTML ELEMENTS
========================================================= */

const googleButton =
    document.getElementById(
        "googleLogin"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );



/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            return;

        }


        console.log(
            "Existing Firebase user:",
            user.email
        );


        loginMessage.textContent =
            `Welcome back, ${
                user.displayName || "Customer"
            }`;


        /*
         * If the customer is already logged in,
         * we can take them directly to the order page.
         */

        setTimeout(() => {

            window.location.href =
                "../order/index.html";

        }, 700);

    }
);



/* =========================================================
   GOOGLE SIGN-IN
========================================================= */

googleButton.addEventListener(
    "click",
    async () => {

        try {

            googleButton.disabled =
                true;


            loginMessage.textContent =
                "Opening Google...";


            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;


            console.log(
                "Google login successful"
            );


            console.log(
                "Name:",
                user.displayName
            );


            console.log(
                "Email:",
                user.email
            );


            loginMessage.textContent =
                "Login successful. Opening your order...";


            /*
             * Firebase has authenticated
             * the customer and local persistence
             * is enabled.
             */


            setTimeout(() => {

                window.location.href =
                    "../order/index.html";

            }, 500);


        }

        catch (error) {

            console.error(
                "GOOGLE LOGIN ERROR:",
                error
            );


            console.error(
                "ERROR CODE:",
                error.code
            );


            googleButton.disabled =
                false;


            /*
             * User closed the Google popup
             */

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                loginMessage.textContent =
                    "Google sign-in was cancelled.";

                return;

            }


            /*
             * Domain isn't authorized
             */

            if (
                error.code ===
                "auth/unauthorized-domain"
            ) {

                loginMessage.textContent =
                    "This website domain is not authorized in Firebase.";

                return;

            }


            /*
             * General error
             */

            loginMessage.textContent =
                error.code ||
                "Unable to sign in. Please try again.";

        }

    }
);
