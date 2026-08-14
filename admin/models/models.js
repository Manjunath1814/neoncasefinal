/* =====================================================
   NEONCASE ADMIN — iPHONE MODELS
===================================================== */

import {
    db
} from "../../firebase-config.js";


import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("MODELS JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    const addButton =
        document.getElementById("addModelButton");

    const modal =
        document.getElementById("modelModal");

    if (!addButton) {
        alert("ADD MODEL BUTTON NOT FOUND");
        return;
    }

    if (!modal) {
        alert("MODEL MODAL NOT FOUND");
        return;
    }

    addButton.addEventListener("click", () => {

        console.log("ADD MODEL CLICKED");

        modal.classList.add("show");

    });

});

/* =====================================================
   FIRESTORE COLLECTION
===================================================== */

const modelsCollection =
    collection(
        db,
        "iphoneModels"
    );



/* =====================================================
   ELEMENTS
===================================================== */

const modelsList =
    document.getElementById(
        "modelsList"
    );

const modelCount =
    document.getElementById(
        "modelCount"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const addModelButton =
    document.getElementById(
        "addModelButton"
    );


const modal =
    document.getElementById(
        "modelModal"
    );

const deleteModal =
    document.getElementById(
        "deleteModal"
    );


const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const modelName =
    document.getElementById(
        "modelName"
    );

const displayOrder =
    document.getElementById(
        "displayOrder"
    );

const availableToggle =
    document.getElementById(
        "availableToggle"
    );

const formError =
    document.getElementById(
        "formError"
    );

const saveButton =
    document.getElementById(
        "saveButton"
    );


let allModels = [];

let editingModelId = null;

let deletingModelId = null;



/* =====================================================
   REALTIME FIRESTORE
===================================================== */

onSnapshot(

    modelsCollection,

    (snapshot) => {

        allModels =
            snapshot.docs.map(
                (item) => ({

                    id:
                        item.id,

                    ...item.data()

                })
            );


        allModels.sort(
            (a, b) => {

                return (
                    Number(
                        a.displayOrder ||
                        999999
                    )
                    -
                    Number(
                        b.displayOrder ||
                        999999
                    )
                );

            }
        );


        renderModels();

    },

    (error) => {

        console.error(
            "Firestore models error:",
            error
        );


        modelsList.innerHTML = `

            <div class="empty">

                Unable to load iPhone models.

            </div>

        `;

    }

);



/* =====================================================
   RENDER
===================================================== */

function renderModels() {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const filtered =
        allModels.filter(
            (model) => {

                return String(
                    model.name || ""
                )
                .toLowerCase()
                .includes(search);

            }
        );


    modelCount.textContent =
        filtered.length;


    if (!filtered.length) {

        modelsList.innerHTML = `

            <div class="empty">

                ${
                    allModels.length
                        ? "No matching models found."
                        : "No iPhone models added yet."
                }

            </div>

        `;

        return;

    }


    modelsList.innerHTML =
        filtered
            .map(
                createModelRow
            )
            .join("");


    attachRowEvents();

}



/* =====================================================
   CREATE ROW
===================================================== */

function createModelRow(
    model
) {

    const available =
        model.available !== false;


    const order =
        Number(
            model.displayOrder ||
            0
        );


    return `

        <div
            class="model-row"
            data-id="${model.id}"
        >


            <div
                class="model-number"
            >
                ${order}
            </div>


            <div
                class="model-name"
            >

                <strong>
                    ${escapeHTML(
                        model.name ||
                        "Unnamed Model"
                    )}
                </strong>

                <small>
                    Display order: ${order}
                </small>

            </div>


            <div>

                <span
                    class="
                        available-badge
                        ${
                            available
                                ? ""
                                : "off"
                        }
                    "
                >

                    <span></span>

                    ${
                        available
                            ? "AVAILABLE"
                            : "HIDDEN"
                    }

                </span>

            </div>


            <div
                class="display-order"
            >
                ${order}
            </div>


            <div
                class="model-actions"
            >


                <!-- ON / OFF -->

                <label
                    class="switch"
                    title="${
                        available
                            ? "Turn off"
                            : "Turn on"
                    }"
                >

                    <input
                        type="checkbox"
                        class="availability-switch"
                        data-id="${model.id}"
                        ${
                            available
                                ? "checked"
                                : ""
                        }
                    >

                    <span
                        class="slider"
                    ></span>

                </label>


                <button
                    type="button"
                    class="edit-button"
                    data-edit="${model.id}"
                >
                    EDIT
                </button>


                <button
                    type="button"
                    class="delete-button"
                    data-delete="${model.id}"
                >
                    DELETE
                </button>


            </div>

        </div>

    `;

}



/* =====================================================
   ROW EVENTS
===================================================== */

function attachRowEvents() {


    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModal(
                            button.dataset.edit
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openDeleteModal(
                            button.dataset.delete
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".availability-switch"
        )
        .forEach(
            (toggle) => {

                toggle.addEventListener(
                    "change",
                    () => {

                        changeAvailability(
                            toggle.dataset.id,
                            toggle.checked
                        );

                    }
                );

            }
        );

}



/* =====================================================
   ADD MODEL
===================================================== */

addModelButton.addEventListener(
    "click",
    () => {

        openAddModal();

    }
);



function openAddModal() {

    editingModelId = null;

    modalTitle.textContent =
        "Add iPhone Model";

    modelName.value = "";

    displayOrder.value =
        getNextDisplayOrder();

    availableToggle.checked =
        true;

    formError.textContent =
        "";

    saveButton.textContent =
        "SAVE MODEL";

    modal.classList.add(
        "show"
    );

    setTimeout(
        () => modelName.focus(),
        100
    );

}



/* =====================================================
   EDIT MODEL
===================================================== */

function openEditModal(
    id
) {

    const model =
        allModels.find(
            item =>
                item.id === id
        );


    if (!model) {
        return;
    }


    editingModelId = id;


    modalTitle.textContent =
        "Edit iPhone Model";


    modelName.value =
        model.name || "";


    displayOrder.value =
        model.displayOrder || 1;


    availableToggle.checked =
        model.available !== false;


    formError.textContent =
        "";


    saveButton.textContent =
        "SAVE CHANGES";


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => modelName.focus(),
        100
    );

}



/* =====================================================
   SAVE
===================================================== */
async function saveModel() {

    const name =
        modelName.value.trim();

    const order =
        Number(displayOrder.value);

    const available =
        availableToggle.checked;

    formError.textContent = "";


    /* ================================
       VALIDATION
    ================================= */

    if (!name) {

        formError.textContent =
            "Please enter the iPhone model name.";

        modelName.focus();

        return;
    }


    if (
        !Number.isInteger(order) ||
        order < 1
    ) {

        formError.textContent =
            "Display order must be 1 or greater.";

        displayOrder.focus();

        return;
    }


    /* ================================
       DUPLICATE CHECK
    ================================= */

    const duplicate =
        allModels.find(model => {

            return (
                model.id !== editingModelId &&
                String(model.name || "")
                    .trim()
                    .toLowerCase() ===
                name.toLowerCase()
            );

        });


    if (duplicate) {

        formError.textContent =
            "This iPhone model already exists.";

        return;
    }


    /* ================================
       SAVE BUTTON
    ================================= */

    saveButton.disabled = true;

    saveButton.textContent = "SAVING...";


    try {

        if (editingModelId) {

            /* =========================
               EDIT EXISTING MODEL
            ========================== */

            const modelRef =
                doc(
                    db,
                    "iphoneModels",
                    editingModelId
                );


            await updateDoc(
                modelRef,
                {
                    name: name,
                    displayOrder: order,
                    available: available,
                    updatedAt:
                        serverTimestamp()
                }
            );

        } else {

            /* =========================
               ADD NEW MODEL
            ========================== */

            await addDoc(
                modelsCollection,
                {
                    name: name,
                    displayOrder: order,
                    available: available,
                    createdAt:
                        serverTimestamp(),
                    updatedAt:
                        serverTimestamp()
                }
            );

        }


        /* ================================
           IMPORTANT:
           CLOSE IMMEDIATELY AFTER SAVE
        ================================= */

        closeModal();


        /* ================================
           RESET FORM
        ================================= */

        resetModelForm();


    } catch (error) {

        console.error(
            "SAVE MODEL ERROR:",
            error
        );


        formError.textContent =
            "Model was not saved. " +
            (error.message || "Please try again.");

    }


    /* ================================
       ALWAYS RESTORE BUTTON
    ================================= */

    saveButton.disabled = false;

    saveButton.textContent =
        editingModelId
            ? "SAVE CHANGES"
            : "SAVE MODEL";

}
function resetModelForm() {

    editingModelId = null;

    modelName.value = "";

    displayOrder.value =
        getNextDisplayOrder();

    availableToggle.checked = true;

    formError.textContent = "";

    saveButton.disabled = false;

    saveButton.textContent =
        "SAVE MODEL";

    modalTitle.textContent =
        "Add iPhone Model";

}
/* =====================================================
   AVAILABILITY
===================================================== */

async function changeAvailability(
    id,
    available
) {

    try {

        const modelRef =
            doc(
                db,
                "iphoneModels",
                id
            );


        await updateDoc(
            modelRef,
            {

                available,

                updatedAt:
                    serverTimestamp()

            }
        );

    }

    catch (error) {

        console.error(
            "Availability update failed:",
            error
        );

        alert(
            "Could not update model availability."
        );

        renderModels();

    }

}



/* =====================================================
   DELETE
===================================================== */

function openDeleteModal(
    id
) {

    const model =
        allModels.find(
            item =>
                item.id === id
        );


    if (!model) {
        return;
    }


    deletingModelId =
        id;


    document.getElementById(
        "deleteModelName"
    ).textContent =
        model.name;


    deleteModal.classList.add(
        "show"
    );

}


document.getElementById(
    "deleteConfirm"
).addEventListener(
    "click",
    async () => {

        if (!deletingModelId) {
            return;
        }


        const id =
            deletingModelId;


        const button =
            document.getElementById(
                "deleteConfirm"
            );


        button.disabled =
            true;

        button.textContent =
            "DELETING...";


        try {

            await deleteDoc(
                doc(
                    db,
                    "iphoneModels",
                    id
                )
            );


            closeDeleteModal();

        }

        catch (error) {

            console.error(
                "Delete failed:",
                error
            );

            alert(
                "Could not delete this model."
            );

        }

        finally {

            button.disabled =
                false;

            button.textContent =
                "DELETE";

        }

    }
);



/* =====================================================
   MODAL CLOSE
===================================================== */

document.getElementById(
    "closeModal"
).addEventListener(
    "click",
    closeModal
);


document.getElementById(
    "cancelButton"
).addEventListener(
    "click",
    closeModal
);


function closeModal() {

    modal.classList.remove("show");

    resetModelForm();

}


document.getElementById(
    "deleteCancel"
).addEventListener(
    "click",
    closeDeleteModal
);


function closeDeleteModal() {

    deleteModal.classList.remove(
        "show"
    );

    deletingModelId =
        null;

}



modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modal
        ) {

            closeModal();

        }

    }
);


deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            deleteModal
        ) {

            closeDeleteModal();

        }

    }
);



/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    renderModels
);



/* =====================================================
   NEXT DISPLAY ORDER
===================================================== */

function getNextDisplayOrder() {

    if (!allModels.length) {
        return 1;
    }


    const highest =
        Math.max(
            ...allModels.map(
                model =>
                    Number(
                        model.displayOrder ||
                        0
                    )
            )
        );


    return highest + 1;

}



/* =====================================================
   MOBILE SIDEBAR
===================================================== */

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


menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );

        sidebarOverlay.classList.add(
            "show"
        );

    }
);


sidebarOverlay.addEventListener(
    "click",
    () => {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "show"
        );

    }
);



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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


console.log(
    "NeonCase iPhone Models loaded."
);
