/* =========================================================
   NEONCASE — TRACKING
========================================================= */

import { firebaseConfig }
    from "../firebase-config.js";


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


/* =========================================================
   FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );


const accessDenied =
    document.getElementById(
        "accessDenied"
    );


const trackingContent =
    document.getElementById(
        "trackingContent"
    );


const account =
    document.getElementById(
        "account"
    );


const goToOrder =
    document.getElementById(
        "goToOrder"
    );


/* =========================================================
   AUTH CHECK
========================================================= */

onAuthStateChanged(
    auth,
    (user) => {


        /* ================================================
           NOT LOGGED IN
        ================================================ */

        if (!user) {

            loadingScreen.hidden =
                true;


            trackingContent.hidden =
                true;


            accessDenied.hidden =
                false;


            account.textContent =
                "Not signed in";


            return;

        }



        /* ================================================
           LOGGED IN
        ================================================ */

        account.textContent =
            user.email;


        loadingScreen.hidden =
            true;


        accessDenied.hidden =
            true;


        trackingContent.hidden =
            false;


        loadTrackingPage(
            user
        );

    }
);


/* =========================================================
   GO TO ORDER PAGE
========================================================= */

goToOrder.addEventListener(
    "click",
    () => {

        window.location.href =
            "../order/index.html";

    }
);


/* =========================================================
   TEMPORARY TRACKING DATA
========================================================= */

function loadTrackingPage(
    user
) {

    /*
     * TEMPORARY DATA
     *
     * Later this will come from Firestore.
     */

    const checkoutData =
        sessionStorage.getItem(
            "neoncaseCheckoutData"
        );


    if (checkoutData) {

        try {

            const data =
                JSON.parse(
                    checkoutData
                );


            document
                .getElementById(
                    "modelName"
                )
                .textContent =
                    data.modelName ||
                    "NeonCase";


            document
                .getElementById(
                    "customerName"
                )
                .textContent =
                    data.fullName ||
                    user.displayName ||
                    "Customer";


            document
                .getElementById(
                    "deliveryAddress"
                )
                .textContent =
                    `${data.address1 || ""}, ${
                        data.district || ""
                    }, ${
                        data.state || ""
                    } - ${
                        data.pincode || ""
                    }`;

        }

        catch (error) {

            console.error(
                "Tracking data error:",
                error
            );

        }

    }


    /*
     * Temporary order number.
     *
     * Later Firestore will provide
     * the permanent order ID.
     */

    const savedOrderId =
        sessionStorage.getItem(
            "neoncaseOrderId"
        );


    document
        .getElementById(
            "orderId"
        )
        .textContent =
            savedOrderId ||
            "#NEONCASE";


    document
        .getElementById(
            "confirmedDate"
        )
        .textContent =
            "Your order has been received.";


}
