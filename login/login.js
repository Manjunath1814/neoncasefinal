import { firebaseConfig } from "../firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


try {

    const app =
        initializeApp(firebaseConfig);

    const auth =
        getAuth(app);

    const provider =
        new GoogleAuthProvider();


    googleLogin.addEventListener("click", async () => {

        console.log("Google button clicked");

        loginMessage.textContent =
            "Opening Google login...";

        googleLogin.disabled = true;

        try {

            await signInWithRedirect(
                auth,
                provider
            );

        } catch (error) {

            console.error(
                "GOOGLE LOGIN ERROR:",
                error
            );

            loginMessage.textContent =
                error.code +
                " — " +
                error.message;

            googleLogin.disabled = false;

        }

    });


    getRedirectResult(auth)

        .then((result) => {

            if (!result) {
                return;
            }

            console.log(
                "LOGIN SUCCESS:",
                result.user
            );

            loginMessage.textContent =
                "Login successful!";

        })

        .catch((error) => {

            console.error(
                "REDIRECT ERROR:",
                error
            );

            loginMessage.textContent =
                error.code +
                " — " +
                error.message;

        });


} catch (error) {

    console.error(
        "FIREBASE INITIALIZATION ERROR:",
        error
    );

    loginMessage.textContent =
        "Firebase error: " +
        error.message;

}
