import { firebaseConfig }
    from "../firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


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
    async () => {

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

            console.error(error);

            googleLogin.disabled = false;

            loginMessage.textContent =
                "Unable to sign in. Please try again.";

        }

    }
);


/* =========================================================
   AFTER GOOGLE REDIRECT
========================================================= */

getRedirectResult(auth)

    .then((result) => {

        if (!result) {
            return;
        }

        const user = result.user;

        console.log(
            "Logged in:",
            user.displayName,
            user.email
        );


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
            "Redirect login error:",
            error
        );

        loginMessage.textContent =
            "Google sign-in could not be completed.";

    });
