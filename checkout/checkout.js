import { firebaseConfig }
    from "../firebase-config.js";


import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


/* FIREBASE */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* ELEMENTS */

const customerEmail =
    document.getElementById(
        "customerEmail"
    );

const selectedModelElement =
    document.getElementById(
        "selectedModel"
    );

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


/* SELECTED MODEL */

let selectedModel = null;


try {

    const savedModel =
        sessionStorage.getItem(
            "neoncaseSelectedModel"
        );


    if (savedModel) {

        selectedModel =
            JSON.parse(
                savedModel
            );


        selectedModelElement.textContent =
            selectedModel.name;

    }

    else {

        selectedModelElement.textContent =
            "No model selected";

    }

}
catch (error) {

    console.error(
        "Model loading error:",
        error
    );

}


/* AUTH CHECK */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.replace(
                "../log/index.html"
            );

            return;

        }


        customerEmail.textContent =
            user.email;

    }
);


/* FORM SUBMIT */

checkoutForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        formMessage.textContent = "";


        if (!selectedModel) {

            formMessage.textContent =
                "Please go back and select your iPhone model.";

            return;

        }


        if (!auth.currentUser) {

            window.location.replace(
                "../log/index.html"
            );

            return;

        }


        const fullName =
            document
                .getElementById("fullName")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const address1 =
            document
                .getElementById("address1")
                .value
                .trim();


        const address2 =
            document
                .getElementById("address2")
                .value
                .trim();


        const state =
            document
                .getElementById("state")
                .value
                .trim();


        const district =
            document
                .getElementById("district")
                .value
                .trim();


        const pincode =
            document
                .getElementById("pincode")
                .value
                .trim();


        /* PHONE VALIDATION */

        if (!/^[0-9]{10}$/.test(phone)) {

            formMessage.textContent =
                "Please enter a valid 10-digit phone number.";

            return;

        }


        /* PINCODE VALIDATION */

        if (!/^[0-9]{6}$/.test(pincode)) {

            formMessage.textContent =
                "Please enter a valid 6-digit pincode.";

            return;

        }


        /* SAVE TEMPORARILY */

        const checkoutData = {

            fullName,

            phone,

            address1,

            address2,

            state,

            district,

            pincode,

            email:
                auth.currentUser.email,

            modelId:
                selectedModel.id,

            modelName:
                selectedModel.name,

            price:
                699

        };


        sessionStorage.setItem(
            "neoncaseCheckoutData",
            JSON.stringify(
                checkoutData
            )
        );


        /* BUTTON */

        continueButton.disabled =
            true;

        continueButton.innerHTML =
            "CONTINUE TO PAYMENT";


        /*
         * PAYMENT PAGE WILL BE CREATED
         * AFTER THE ADMIN PANEL.
         */

        setTimeout(() => {

            window.location.href =
                "../payment/index.html";

        }, 400);

    }
);
