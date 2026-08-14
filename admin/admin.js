/* =========================================================
   NEONCASE ADMIN PANEL
   STEP 1
========================================================= */

import { firebaseConfig }
    from "../firebase-config.js";


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* =========================================================
   ELEMENTS
========================================================= */

const accessScreen =
    document.getElementById(
        "accessScreen"
    );


const accessMessage =
    document.getElementById(
        "accessMessage"
    );


const adminApp =
    document.getElementById(
        "adminApp"
    );


const adminEmail =
    document.getElementById(
        "adminEmail"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const firebaseStatus =
    document.getElementById(
        "firebaseStatus"
    );


const authStatus =
    document.getElementById(
        "authStatus"
    );


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        /*
         * CASE 1:
         * Nobody is logged in.
         */

        if (!user) {

            showLoginRequired();

            return;

        }


        /*
         * CASE 2:
         * User is logged in.
         *
         * Now check whether the UID exists
         * in Firestore:
         *
         * admins
         *    └── USER_UID
         */

        try {

            await verifyAdmin(
                user
            );

        }

        catch (error) {

            console.error(
                "Admin verification error:",
                error
            );


            showError(
                "Unable to verify administrator access."
            );

        }

    }
);


/* =========================================================
   VERIFY ADMIN
========================================================= */

async function verifyAdmin(
    user
) {

    /*
     * Firestore path:
     *
     * admins / USER_UID
     */

    const adminRef =
        doc(
            db,
            "admins",
            user.uid
        );


    const adminSnapshot =
        await getDoc(
            adminRef
        );


    /*
     * UID does not exist
     */

    if (
        !adminSnapshot.exists()
    ) {

        showAccessDenied();

        return;

    }


    const adminData =
        adminSnapshot.data();


    /*
     * Admin has been manually disabled
     */

    if (
        adminData.active === false
    ) {

        showAccessDenied(
            "This administrator account is disabled."
        );

        return;

    }


    /*
     * SUCCESS
     */

    openAdminPanel(
        user
    );

}


/* =========================================================
   OPEN ADMIN PANEL
========================================================= */

function openAdminPanel(
    user
) {

    /*
     * Hide access screen.
     */

    accessScreen.hidden =
        true;


    /*
     * Show admin app.
     */

    adminApp.hidden =
        false;


    /*
     * Display admin email.
     */

    adminEmail.textContent =
        user.email ||
        "Administrator";


    /*
     * Update authentication status.
     */

    authStatus.textContent =
        "Active";


    authStatus.className =
        "status-pill online";


    /*
     * Firebase connection is confirmed
     * because Firestore admin verification
     * successfully completed.
     */

    firebaseStatus.textContent =
        "Connected";


    firebaseStatus.className =
        "status-pill online";

}


/* =========================================================
   LOGIN REQUIRED
========================================================= */

function showLoginRequired() {

    accessScreen.hidden =
        false;


    accessMessage.textContent =
        "Please sign in with your administrator Google account.";


    accessScreen.innerHTML = `

        <div class="access-card">

            <div class="access-logo">
                NEON<span>CASE</span>
            </div>

            <div class="access-label">
                ADMINISTRATOR
            </div>

            <div class="access-message-area">

                <p>
                    Please sign in with your
                    administrator account.
                </p>

                <button
                    type="button"
                    id="loginButton"
                    class="login-button"
                >
                    GO TO ADMIN LOGIN
                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "loginButton"
        )
        .addEventListener(
            "click",
            () => {

                /*
                 * Your existing Google login page.
                 */

                window.location.href =
                    "../log/index.html";

            }
        );

}


/* =========================================================
   ACCESS DENIED
========================================================= */

function showAccessDenied(
    customMessage
) {

    accessScreen.hidden =
        false;


    accessScreen.innerHTML = `

        <div class="access-card">

            <div class="access-logo">
                NEON<span>CASE</span>
            </div>

            <div class="access-label">
                ACCESS DENIED
            </div>

            <div class="access-message-area">

                <div class="denied-icon">
                    ×
                </div>

                <p>
                    ${
                        customMessage ||
                        "This Google account is not authorized to access the NeonCase Admin Panel."
                    }
                </p>

                <button
                    type="button"
                    id="backLoginButton"
                    class="login-button"
                >
                    BACK TO LOGIN
                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "backLoginButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

}


/* =========================================================
   GENERAL ERROR
========================================================= */

function showError(
    message
) {

    accessScreen.hidden =
        false;


    accessScreen.innerHTML = `

        <div class="access-card">

            <div class="access-logo">
                NEON<span>CASE</span>
            </div>

            <div class="access-label">
                ERROR
            </div>

            <div class="access-message-area">

                <p>
                    ${message}
                </p>

                <button
                    type="button"
                    id="errorLoginButton"
                    class="login-button"
                >
                    BACK TO LOGIN
                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "errorLoginButton"
        )
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "../log/index.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to sign out. Please try again."
            );

        }

    }
);
