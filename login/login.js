import { firebaseConfig } from "../firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


/* CHECK EXISTING LOGIN */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Already logged in:",
            user.email
        );

        loginMessage.textContent =
            "You are already signed in.";

        /*
        Later we will redirect here:

        window.location.replace(
            "../order/index.html"
        );
        */

    }

});


/* GOOGLE LOGIN */

googleLogin.addEventListener(
    "click",
    async () => {

        try {

            googleLogin.disabled = true;

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
                "LOGIN SUCCESS:",
                user.email
            );


            loginMessage.textContent =
                `Welcome, ${user.displayName || "Customer"}!`;


            /*
             * DO NOT REDIRECT YET.
             *
             * First we confirm login works.
             */


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


            googleLogin.disabled = false;


            loginMessage.textContent =
                error.code +
                " — " +
                error.message;

        }

    }
);
