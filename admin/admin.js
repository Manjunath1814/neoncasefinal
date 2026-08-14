/* =========================================================
   NEONCASE ADMIN DASHBOARD
   STEP 2 — UI ONLY
========================================================= */


/* =========================================================
   CURRENT DATE
========================================================= */

const currentDate =
    document.getElementById("currentDate");


function showCurrentDate() {

    if (!currentDate) {
        return;
    }


    const today =
        new Date();


    const options = {
        day: "numeric",
        month: "short",
        year: "numeric"
    };


    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );

}


showCurrentDate();



/* =========================================================
   MOBILE SIDEBAR
========================================================= */

const menuButton =
    document.getElementById(
        "menuButton"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


function openSidebar() {

    if (!sidebar) {
        return;
    }


    sidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "show"
    );

}


function closeSidebar() {

    if (!sidebar) {
        return;
    }


    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}



/* =========================================================
   NAVIGATION
========================================================= */

const navItems =
    document.querySelectorAll(".nav-item");


navItems.forEach((item) => {

    item.addEventListener("click", () => {

        const page =
            item.dataset.page;


        /* Make clicked menu active */

        navItems.forEach((nav) => {
            nav.classList.remove("active");
        });

        item.classList.add("active");


        /* =========================================
           IPHONE MODELS
        ========================================= */

        if (page === "models") {

            const dashboardContent =
                document.querySelector(
                    ".dashboard-content"
                );

            const modelsPage =
                document.getElementById(
                    "modelsPage"
                );


            /* Hide dashboard */

            if (dashboardContent) {
                dashboardContent.hidden = true;
            }


            /* Show iPhone Models */

            if (modelsPage) {
                modelsPage.hidden = false;
            }


            /* Change top heading */

            const eyebrow =
                document.querySelector(
                    ".topbar .eyebrow"
                );

            const title =
                document.querySelector(
                    ".topbar h1"
                );


            if (eyebrow) {
                eyebrow.textContent =
                    "PRODUCT CATALOG";
            }


            if (title) {
                title.textContent =
                    "iPhone Models";
            }


            /* Load models */

            if (
                typeof loadPhoneModels ===
                "function"
            ) {

                loadPhoneModels();

            }


            closeSidebar();

            return;

        }


        /* =========================================
           DASHBOARD
        ========================================= */

        if (page === "dashboard") {

            const dashboardContent =
                document.querySelector(
                    ".dashboard-content"
                );

            const modelsPage =
                document.getElementById(
                    "modelsPage"
                );


            /* Show dashboard */

            if (dashboardContent) {
                dashboardContent.hidden = false;
            }


            /* Hide models */

            if (modelsPage) {
                modelsPage.hidden = true;
            }


            /* Restore heading */

            const eyebrow =
                document.querySelector(
                    ".topbar .eyebrow"
                );

            const title =
                document.querySelector(
                    ".topbar h1"
                );


            if (eyebrow) {
                eyebrow.textContent =
                    "OVERVIEW";
            }


            if (title) {
                title.textContent =
                    "Dashboard";
            }


            closeSidebar();

            return;

        }


        /* Other pages later */

        console.log(
            `${page} section will be built later.`
        );


        closeSidebar();

    });

});


/* =========================================================
   QUICK ACTION BUTTONS
========================================================= */

const quickButtons =
    document.querySelectorAll(
        "[data-page]"
    );


quickButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;


            if (
                page === "dashboard"
            ) {
                return;
            }


            /*
             * For now these pages don't exist.
             * We'll connect them later.
             */

            console.log(
                `Opening ${page} in a future step.`
            );

        }
    );

});



/* =========================================================
   DEMO DASHBOARD DATA
========================================================= */

/*
 * We intentionally keep these at ZERO.
 *
 * Later Firebase will replace these values.
 */

const dashboardData = {

    totalOrders: 0,

    pendingOrders: 0,

    processingOrders: 0,

    deliveredOrders: 0

};



/* =========================================================
   UPDATE DASHBOARD NUMBERS
========================================================= */

function updateDashboardNumbers() {

    const total =
        document.getElementById(
            "totalOrders"
        );


    const pending =
        document.getElementById(
            "pendingOrders"
        );


    const processing =
        document.getElementById(
            "processingOrders"
        );


    const delivered =
        document.getElementById(
            "deliveredOrders"
        );


    const sidebarCount =
        document.getElementById(
            "sidebarOrderCount"
        );


    if (total) {

        total.textContent =
            dashboardData.totalOrders;

    }


    if (pending) {

        pending.textContent =
            dashboardData.pendingOrders;

    }


    if (processing) {

        processing.textContent =
            dashboardData.processingOrders;

    }


    if (delivered) {

        delivered.textContent =
            dashboardData.deliveredOrders;

    }


    if (sidebarCount) {

        sidebarCount.textContent =
            dashboardData.pendingOrders;

    }

}


updateDashboardNumbers();



/* =========================================================
   PREVENT EMPTY BUTTONS FROM SUBMITTING
========================================================= */

document
    .querySelectorAll(
        "button"
    )
    .forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                /*
                 * This dashboard doesn't contain
                 * any forms yet.
                 */

                if (
                    button.type !==
                    "submit"
                ) {

                    event.stopPropagation();

                }

            }
        );

    });
/* =========================================================
   IPHONE MODELS
   FIRESTORE CONNECTION
   ADD TO BOTTOM OF EXISTING admin.js
========================================================= */


/*
 * Firebase imports
 *
 * Your firebaseConfig remains in:
 * ../firebase-config.js
 */

import { firebaseConfig } from "../firebase-config.js";

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const modelsFirebaseApp =
    getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);


const modelsDB =
    getFirestore(
        modelsFirebaseApp
    );


/* =========================================================
   VARIABLES
========================================================= */

let phoneModels = [];

let editingModelId = null;


/* =========================================================
   ELEMENTS
========================================================= */

const modelsPage =
    document.getElementById(
        "modelsPage"
    );


const modelsList =
    document.getElementById(
        "modelsList"
    );


const modelModal =
    document.getElementById(
        "modelModal"
    );


const modelForm =
    document.getElementById(
        "modelForm"
    );


const modelSearch =
    document.getElementById(
        "modelSearch"
    );


/* =========================================================
   OPEN MODELS FROM SIDEBAR
========================================================= */




/* =========================================================
   OPEN MODELS PAGE
========================================================= */

function openModelsPage() {

    /*
     * Hide only the dashboard content.
     * The sidebar stays untouched.
     */

    const dashboardContent =
        document.querySelector(
            ".dashboard-content"
        );


    if (dashboardContent) {

        dashboardContent.hidden = true;

    }


    /*
     * Show Models page.
     */

    if (modelsPage) {

        modelsPage.hidden = false;

    }


    /*
     * Update desktop header.
     */

    const eyebrow =
        document.querySelector(
            ".topbar .eyebrow"
        );


    const title =
        document.querySelector(
            ".topbar h1"
        );


    if (eyebrow) {

        eyebrow.textContent =
            "PRODUCT CATALOG";

    }


    if (title) {

        title.textContent =
            "iPhone Models";

    }


    /*
     * Load Firestore models.
     */

    loadPhoneModels();

}


/* =========================================================
   RETURN TO DASHBOARD
========================================================= */

document
    .querySelectorAll(
        '.nav-item[data-page="dashboard"]'
    )
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const dashboardContent =
                    document.querySelector(
                        ".dashboard-content"
                    );


                if (dashboardContent) {

                    dashboardContent.hidden =
                        false;

                }


                if (modelsPage) {

                    modelsPage.hidden =
                        true;

                }


                const eyebrow =
                    document.querySelector(
                        ".topbar .eyebrow"
                    );


                const title =
                    document.querySelector(
                        ".topbar h1"
                    );


                if (eyebrow) {

                    eyebrow.textContent =
                        "OVERVIEW";

                }


                if (title) {

                    title.textContent =
                        "Dashboard";

                }

            }
        );

    });


/* =========================================================
   LOAD MODELS FROM FIRESTORE
========================================================= */

async function loadPhoneModels() {

    if (!modelsList) {
        return;
    }


    modelsList.innerHTML = `

        <div class="models-loading">

            Loading iPhone models...

        </div>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    modelsDB,
                    "phoneModels"
                )
            );


        phoneModels = [];


        snapshot.forEach(
            (item) => {

                phoneModels.push({

                    id: item.id,

                    ...item.data()

                });

            }
        );


        /*
         * Sort by display order.
         */

        phoneModels.sort(
            (a, b) => {

                return (
                    Number(a.order || 9999) -
                    Number(b.order || 9999)
                );

            }
        );


        renderPhoneModels(
            phoneModels
        );

    }

    catch (error) {

        console.error(
            "FIRESTORE MODEL ERROR:",
            error
        );


        modelsList.innerHTML = `

            <div class="models-empty">

                Unable to load models.
                <br>
                Please check your Firebase
                configuration and Firestore rules.

            </div>

        `;

    }

}


/* =========================================================
   RENDER MODELS
========================================================= */

function renderPhoneModels(
    list
) {

    if (!modelsList) {
        return;
    }


    const count =
        document.getElementById(
            "modelCount"
        );


    if (count) {

        count.textContent =
            list.length;

    }


    if (!list.length) {

        modelsList.innerHTML = `

            <div class="models-empty">

                No iPhone models found.
                <br>
                Click "ADD MODEL" to create one.

            </div>

        `;

        return;

    }


    modelsList.innerHTML = "";


    list.forEach(
        (model, index) => {

            const active =
                model.active !== false;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "model-row";


            row.innerHTML = `

                <div class="model-number">

                    ${index + 1}

                </div>


                <div class="model-info">

                    <div class="model-name">

                        ${escapeModelText(
                            model.name ||
                            "Unnamed Model"
                        )}

                    </div>


                    <div class="model-display-order">

                        Display order:
                        ${Number(
                            model.order || 1
                        )}

                    </div>

                </div>


                <div class="model-availability">

                    <span
                        class="
                            availability-dot
                            ${
                                active
                                    ? "active"
                                    : "inactive"
                            }
                        "
                    ></span>


                    <span
                        class="
                            availability-text
                            ${
                                active
                                    ? "active"
                                    : "inactive"
                            }
                        "
                    >

                        ${
                            active
                                ? "AVAILABLE"
                                : "UNAVAILABLE"
                        }

                    </span>

                </div>


                <label
                    class="model-switch"
                    title="Toggle availability"
                >

                    <input
                        type="checkbox"
                        ${
                            active
                                ? "checked"
                                : ""
                        }
                        data-model-toggle="${model.id}"
                    >

                    <span class="model-slider"></span>

                </label>


                <div class="model-actions">

                    <button
                        type="button"
                        class="model-action-button"
                        data-model-edit="${model.id}"
                    >

                        EDIT

                    </button>


                    <button
                        type="button"
                        class="
                            model-action-button
                            delete
                        "
                        data-model-delete="${model.id}"
                    >

                        DELETE

                    </button>

                </div>

            `;


            modelsList.appendChild(
                row
            );

        }
    );


    /*
     * Toggle buttons
     */

    modelsList
        .querySelectorAll(
            "[data-model-toggle]"
        )
        .forEach(
            (input) => {

                input.addEventListener(
                    "change",
                    async () => {

                        await togglePhoneModel(
                            input.dataset.modelToggle,
                            input.checked
                        );

                    }
                );

            }
        );


    /*
     * Edit buttons
     */

    modelsList
        .querySelectorAll(
            "[data-model-edit]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModel(
                            button.dataset.modelEdit
                        );

                    }
                );

            }
        );


    /*
     * Delete buttons
     */

    modelsList
        .querySelectorAll(
            "[data-model-delete]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deletePhoneModel(
                            button.dataset.modelDelete
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ADD MODEL BUTTON
========================================================= */

const addModelButton =
    document.getElementById(
        "addModelButton"
    );


if (addModelButton) {

    addModelButton.addEventListener(
        "click",
        () => {

            editingModelId =
                null;


            document.getElementById(
                "modelModalTitle"
            ).textContent =
                "Add iPhone Model";


            modelForm.reset();


            document.getElementById(
                "modelActive"
            ).checked =
                true;


            modelModal.hidden =
                false;


            setTimeout(
                () => {

                    document
                        .getElementById(
                            "modelName"
                        )
                        ?.focus();

                },
                100
            );

        }
    );

}


/* =========================================================
   EDIT MODEL
========================================================= */

function openEditModel(
    id
) {

    const model =
        phoneModels.find(
            item =>
                item.id === id
        );


    if (!model) {

        alert(
            "Model not found."
        );

        return;

    }


    editingModelId =
        id;


    document.getElementById(
        "modelModalTitle"
    ).textContent =
        "Edit iPhone Model";


    document.getElementById(
        "modelName"
    ).value =
        model.name || "";


    document.getElementById(
        "modelOrder"
    ).value =
        model.order || 1;


    document.getElementById(
        "modelActive"
    ).checked =
        model.active !== false;


    modelModal.hidden =
        false;

}


/* =========================================================
   SAVE MODEL
========================================================= */

if (modelForm) {

    modelForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "modelName"
                    )
                    .value
                    .trim();


            const order =
                Number(
                    document
                        .getElementById(
                            "modelOrder"
                        )
                        .value
                );


            const active =
                document
                    .getElementById(
                        "modelActive"
                    )
                    .checked;


            if (!name) {

                alert(
                    "Please enter an iPhone model."
                );

                return;

            }


            if (
                !Number.isFinite(order) ||
                order < 1
            ) {

                alert(
                    "Please enter a valid display order."
                );

                return;

            }


            const saveButton =
                modelForm.querySelector(
                    ".save-model-button"
                );


            try {

                if (saveButton) {

                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "SAVING...";

                }


                if (editingModelId) {

                    /*
                     * EDIT EXISTING MODEL
                     */

                    await updateDoc(
                        doc(
                            modelsDB,
                            "phoneModels",
                            editingModelId
                        ),
                        {

                            name: name,

                            order: order,

                            active: active,

                            updatedAt:
                                serverTimestamp()

                        }
                    );

                }

                else {

                    /*
                     * CREATE NEW MODEL
                     */

                    await addDoc(
                        collection(
                            modelsDB,
                            "phoneModels"
                        ),
                        {

                            name: name,

                            order: order,

                            active: active,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }
                    );

                }


                closeModelModal();


                await loadPhoneModels();


                alert(
                    editingModelId
                        ? "Model updated successfully."
                        : "Model added successfully."
                );


                editingModelId =
                    null;

            }

            catch (error) {

                console.error(
                    "SAVE MODEL ERROR:",
                    error
                );


                alert(
                    "Could not save the model. Check your Firestore rules."
                );

            }

            finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "SAVE MODEL";

                }

            }

        }
    );

}


/* =========================================================
   TOGGLE MODEL
========================================================= */

async function togglePhoneModel(
    id,
    active
) {

    try {

        await updateDoc(
            doc(
                modelsDB,
                "phoneModels",
                id
            ),
            {

                active: active,

                updatedAt:
                    serverTimestamp()

            }
        );


        await loadPhoneModels();

    }

    catch (error) {

        console.error(
            "TOGGLE MODEL ERROR:",
            error
        );


        alert(
            "Could not update model availability."
        );


        await loadPhoneModels();

    }

}


/* =========================================================
   DELETE MODEL
========================================================= */

async function deletePhoneModel(
    id
) {

    const model =
        phoneModels.find(
            item =>
                item.id === id
        );


    if (!model) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete ${model.name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                modelsDB,
                "phoneModels",
                id
            )
        );


        await loadPhoneModels();


        alert(
            "Model deleted successfully."
        );

    }

    catch (error) {

        console.error(
            "DELETE MODEL ERROR:",
            error
        );


        alert(
            "Could not delete this model."
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

if (modelSearch) {

    modelSearch.addEventListener(
        "input",
        () => {

            const search =
                modelSearch.value
                    .trim()
                    .toLowerCase();


            const filtered =
                phoneModels.filter(
                    model => {

                        return String(
                            model.name || ""
                        )
                            .toLowerCase()
                            .includes(
                                search
                            );

                    }
                );


            renderPhoneModels(
                filtered
            );

        }
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModelModal() {

    if (!modelModal) {
        return;
    }


    modelModal.hidden =
        true;


    editingModelId =
        null;


    if (modelForm) {

        modelForm.reset();

    }

}


/* =========================================================
   CLOSE BUTTON
========================================================= */

const closeModelModalButton =
    document.getElementById(
        "closeModelModal"
    );


if (closeModelModalButton) {

    closeModelModalButton.addEventListener(
        "click",
        closeModelModal
    );

}


const cancelModel =
    document.getElementById(
        "cancelModel"
    );


if (cancelModel) {

    cancelModel.addEventListener(
        "click",
        closeModelModal
    );

}


/* =========================================================
   CLICK BACKDROP TO CLOSE
========================================================= */

if (modelModal) {

    modelModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modelModal
            ) {

                closeModelModal();

            }

        }
    );

}


/* =========================================================
   ESC TO CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            modelModal &&
            !modelModal.hidden
        ) {

            closeModelModal();

        }

    }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeModelText(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   FUTURE FIREBASE CONNECTION
========================================================= */

/*

   In the next steps this section will be replaced with:

   Firebase
      ↓
   Firestore
      ↓
   orders collection
      ↓
   Dashboard numbers

   Example:

   Total Orders
   Pending
   Processing
   Delivered

   No design changes will be required.

*/


console.log(
    "NeonCase Admin Dashboard loaded successfully."
);
