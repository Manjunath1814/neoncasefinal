/* =========================================================
   NEONCASE — ORDER PAGE
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


import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* =========================================================
   ELEMENTS
========================================================= */

const userArea =
    document.getElementById("userArea");

const modelList =
    document.getElementById("modelList");

const modelSearch =
    document.getElementById("modelSearch");

const continueButton =
    document.getElementById("continueButton");

const orderMessage =
    document.getElementById("orderMessage");


let allModels = [];

let selectedModel = null;


/* =========================================================
   AUTHENTICATION CHECK
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        /*
         * NO GOOGLE LOGIN
         *
         * Send customer back to login page.
         */

        if (!user) {

            window.location.replace(
                "../login/index.html"
            );

            return;

        }


        /*
         * USER IS LOGGED IN
         */

        userArea.textContent =
            user.displayName ||
            user.email ||
            "Customer";


        /*
         * Now load phone models
         */

        await loadPhoneModels();

    }
);


/* =========================================================
   LOAD PHONE MODELS FROM FIRESTORE
========================================================= */

async function loadPhoneModels() {

    try {

        const modelsQuery =
            query(
                collection(db, "phoneModels"),
                where("active", "==", true),
                orderBy("order", "asc")
            );


        const snapshot =
            await getDocs(modelsQuery);


        allModels = [];


        snapshot.forEach((doc) => {

            allModels.push({

                id: doc.id,

                ...doc.data()

            });

        });


        renderModels(allModels);


    }

    catch (error) {

        console.error(
            "Phone model loading error:",
            error
        );


        modelList.innerHTML = `

            <div class="loading-models">

                Unable to load phone models.

                <br><br>

                Please refresh the page.

            </div>

        `;

    }

}


/* =========================================================
   DISPLAY MODELS
========================================================= */

function renderModels(models) {

    if (!models.length) {

        modelList.innerHTML = `

            <div class="loading-models">

                No iPhone models are currently available.

            </div>

        `;

        return;

    }


    modelList.innerHTML = "";


    models.forEach((model) => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "model-option";


        button.dataset.id =
            model.id;


        button.innerHTML = `

            <span>
                ${escapeHTML(model.name)}
            </span>

            <span class="model-check">
                ✓
            </span>

        `;


        button.addEventListener(
            "click",
            () => {

                selectModel(
                    model,
                    button
                );

            }
        );


        modelList.appendChild(button);

    });

}


/* =========================================================
   SELECT MODEL
========================================================= */

function selectModel(
    model,
    button
) {

    selectedModel =
        model;


    document
        .querySelectorAll(".model-option")
        .forEach((item) => {

            item.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    continueButton.disabled =
        false;


    orderMessage.textContent = "";

}


/* =========================================================
   SEARCH
========================================================= */

modelSearch.addEventListener(
    "input",
    () => {

        const search =
            modelSearch.value
                .trim()
                .toLowerCase();


        const filtered =
            allModels.filter(
                (model) =>
                    model.name
                        .toLowerCase()
                        .includes(search)
            );


        renderModels(filtered);

    }
);


/* =========================================================
   CONTINUE
========================================================= */

continueButton.addEventListener(
    "click",
    () => {

        if (!selectedModel) {

            return;

        }


        /*
         * NEXT STEP:
         *
         * We'll create the customer details page.
         *
         * For now we save the selected model
         * temporarily in the URL.
         */

        const modelId =
            encodeURIComponent(
                selectedModel.id
            );


        window.location.href =
            `../checkout/index.html?model=${modelId}`;

    }
);


/* =========================================================
   BASIC HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}
