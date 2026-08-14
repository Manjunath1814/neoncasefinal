/* =====================================================
   NEONCASE — GOOGLE LOGIN
===================================================== */

import {
    app
} from "../firebase-config.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";



/* =====================================================
   FIREBASE AUTH
===================================================== */

const auth =
    getAuth(app);


const provider =
    new GoogleAuthProvider();



/* =====================================================
   HTML ELEMENTS
===================================================== */

const googleButton =
    document.getElementById(
        "googleLogin"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );



/* =====================================================
   CHECK ELEMENTS
===================================================== */

if (!googleButton) {

    console.error(
        "Google login button not found."
    );

}


if (!loginMessage) {

    console.error(
        "Login message element not found."
    );

}



/* =====================================================
   GOOGLE LOGIN
===================================================== */

googleButton.addEventListener(
    "click",
    async () => {

        /* Disable button */

        googleButton.disabled = true;


        loginMessage.textContent =
            "Opening Google...";


        try {

            /* =========================================
               REMEMBER LOGIN
            ========================================== */

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            /* =========================================
               GOOGLE SIGN IN
            ========================================== */

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;


            console.log(
                "Google login successful."
            );


            console.log(
                "Name:",
                user.displayName
            );


            console.log(
                "Email:",
                user.email
            );


            /* =========================================
               SUCCESS MESSAGE
            ========================================== */

            loginMessage.textContent =
                "Login successful. Opening your order...";


            /* =========================================
               GO TO ORDER PAGE
            ========================================== */

            setTimeout(
                () => {

                    window.location.href =
                        "../order/";

                },
                700
            );


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



            /* =========================================
               USER CANCELLED POPUP
            ========================================== */

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                loginMessage.textContent =
                    "Google sign-in was cancelled.";

                return;
            }



            /* =========================================
               UNAUTHORIZED DOMAIN
            ========================================== */

            if (
                error.code ===
                "auth/unauthorized-domain"
            ) {

                loginMessage.textContent =
                    "This website domain is not authorized in Firebase.";

                return;
            }



            /* =========================================
               POPUP BLOCKED
            ========================================== */

            if (
                error.code ===
                "auth/popup-blocked"
            ) {

                loginMessage.textContent =
                    "Google popup was blocked. Please allow popups and try again.";

                return;
            }



            /* =========================================
               ACCOUNT EXISTS
            ========================================== */

            if (
                error.code ===
                "auth/account-exists-with-different-credential"
            ) {

                loginMessage.textContent =
                    "This email is already registered with another sign-in method.";

                return;
            }



            /* =========================================
               GENERAL ERROR
            ========================================== */

            loginMessage.textContent =
                "Unable to sign in. Please try again.";

        }

    }
);
