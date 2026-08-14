/* =========================================================
   NEONCASE ADMIN — STEP 2
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
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
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
   VARIABLES
========================================================= */

let models = [];

let orders = [];

let editingModelId = null;

let selectedOrderId = null;



/* =========================================================
   ELEMENTS
========================================================= */

const accessScreen =
    document.getElementById(
        "accessScreen"
    );


const adminApp =
    document.getElementById(
        "adminApp"
    );


const accessMessage =
    document.getElementById(
        "accessMessage"
    );


const adminEmail =
    document.getElementById(
        "adminEmail"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const modelModal =
    document.getElementById(
        "modelModal"
    );


const orderModal =
    document.getElementById(
        "orderModal"
    );


const modelForm =
    document.getElementById(
        "modelForm"
    );



/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showLoginScreen();

            return;

        }


        try {

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


            if (
                !adminSnapshot.exists()
            ) {

                showDenied(
                    "This Google account is not authorized as an administrator."
                );

                return;

            }


            const adminData =
                adminSnapshot.data();


            if (
                adminData.active === false
            ) {

                showDenied(
                    "This administrator account is disabled."
                );

                return;

            }


            /* ADMIN VERIFIED */

            accessScreen.hidden =
                true;


            adminApp.hidden =
                false;


            adminEmail.textContent =
                user.email ||
                "Administrator";


            await loadEverything();

        }

        catch (error) {

            console.error(
                "ADMIN AUTH ERROR:",
                error
            );


            showDenied(
                "Unable to verify administrator access."
            );

        }

    }
);



/* =========================================================
   LOGIN SCREEN
========================================================= */

function showLoginScreen() {

    accessScreen.hidden =
        false;


    accessScreen.innerHTML = `

        <div class="access-card">

            <div class="access-logo">
                NEON<span>CASE</span>
            </div>

            <div class="access-label">
                ADMINISTRATOR
            </div>

            <p style="margin-top:28px;">
                Please sign in with your
                administrator Google account.
            </p>

            <button
                id="goLogin"
                class="primary-button"
                style="
                    width:100%;
                    margin-top:22px;
                "
            >
                GO TO ADMIN LOGIN
            </button>

        </div>

    `;


    document
        .getElementById("goLogin")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

}



/* =========================================================
   ACCESS DENIED
========================================================= */

function showDenied(message) {

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

            <p style="margin-top:25px;">
                ${escapeHTML(message)}
            </p>

            <button
                id="backLogin"
                class="primary-button"
                style="
                    width:100%;
                    margin-top:22px;
                "
            >
                BACK TO LOGIN
            </button>

        </div>

    `;


    document
        .getElementById("backLogin")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

}



/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadEverything() {

    await loadModels();

    await loadOrders();

    updateDashboard();

}



/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-item[data-section]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    switchSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


document
    .querySelectorAll("[data-open-section]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    switchSection(
                        button.dataset.openSection
                    );

                }
            );

        }
    );


function switchSection(section) {

    const sections = {

        dashboard:
            "dashboardSection",

        orders:
            "ordersSection",

        models:
            "modelsSection"

    };


    if (
        !sections[section]
    ) {
        return;
    }


    Object.values(sections)
        .forEach(
            id => {

                document.getElementById(
                    id
                ).hidden = true;

            }
        );


    document.getElementById(
        sections[section]
    ).hidden = false;


    document
        .querySelectorAll(
            ".nav-item[data-section]"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section === section
                );

            }
        );


    const titles = {

        dashboard: [
            "OVERVIEW",
            "Dashboard"
        ],

        orders: [
            "CUSTOMER ORDERS",
            "Orders"
        ],

        models: [
            "PRODUCT CATALOG",
            "iPhone Models"
        ]

    };


    document.getElementById(
        "pageEyebrow"
    ).textContent =
        titles[section][0];


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[section][1];

}



/* =========================================================
   MODELS — LOAD
========================================================= */

async function loadModels() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "phoneModels"
                )
            );


        models = [];


        snapshot.forEach(
            item => {

                models.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        models.sort(
            (a,b) =>
                Number(a.order || 9999) -
                Number(b.order || 9999)
        );


        renderModels();

        updateModelCounts();

    }

    catch (error) {

        console.error(
            "LOAD MODELS ERROR:",
            error
        );


        document.getElementById(
            "modelsGrid"
        ).innerHTML = `

            <div class="empty-dashboard">
                Unable to load models.
            </div>

        `;

    }

}



/* =========================================================
   MODELS — RENDER
========================================================= */

function renderModels(
    list = models
) {

    const container =
        document.getElementById(
            "modelsGrid"
        );


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-dashboard">

                No models found.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    list.forEach(
        model => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "model-card";


            const active =
                model.active !== false;


            card.innerHTML = `

                <div class="model-card-top">

                    <h3>
                        ${escapeHTML(
                            model.name ||
                            "Unnamed Model"
                        )}
                    </h3>

                    <div class="model-order">

                        Display order:
                        ${Number(
                            model.order || 1
                        )}

                    </div>

                </div>


                <div class="model-card-bottom">

                    <label class="model-toggle">

                        <span>
                            ${active
                                ? "ON"
                                : "OFF"}
                        </span>

                        <span class="mini-toggle">

                            <input
                                type="checkbox"
                                ${
                                    active
                                    ? "checked"
                                    : ""
                                }
                                data-model-toggle="${model.id}"
                            >

                            <span
                                class="mini-slider"
                            ></span>

                        </span>

                    </label>


                    <div class="model-actions">

                        <button
                            type="button"
                            class="icon-button"
                            data-model-edit="${model.id}"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="icon-button delete"
                            data-model-delete="${model.id}"
                        >
                            ×
                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    /* Toggle */

    container
        .querySelectorAll(
            "[data-model-toggle]"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "change",
                    async () => {

                        await setModelActive(
                            input.dataset.modelToggle,
                            input.checked
                        );

                    }
                );

            }
        );


    /* Edit */

    container
        .querySelectorAll(
            "[data-model-edit]"
        )
        .forEach(
            button => {

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


    /* Delete */

    container
        .querySelectorAll(
            "[data-model-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await removeModel(
                            button.dataset.modelDelete
                        );

                    }
                );

            }
        );

}



/* =========================================================
   ADD MODEL
========================================================= */

document
    .getElementById(
        "addModelButton"
    )
    .addEventListener(
        "click",
        () => {

            closeOrderModal();


            editingModelId =
                null;


            document.getElementById(
                "modelModalTitle"
            ).textContent =
                "Add iPhone Model";


            document.getElementById(
                "modelNameInput"
            ).value = "";


            document.getElementById(
                "modelOrderInput"
            ).value =
                getNextModelOrder();


            document.getElementById(
                "modelActiveInput"
            ).checked =
                true;


            modelModal.hidden =
                false;

        }
    );



/* =========================================================
   NEXT MODEL ORDER
========================================================= */

function getNextModelOrder() {

    if (!models.length) {
        return 1;
    }


    const numbers =
        models.map(
            model =>
                Number(
                    model.order || 0
                )
        );


    return Math.max(
        ...numbers,
        0
    ) + 1;

}



/* =========================================================
   EDIT MODEL
========================================================= */

function openEditModel(id) {

    closeOrderModal();


    const model =
        models.find(
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
        "modelNameInput"
    ).value =
        model.name || "";


    document.getElementById(
        "modelOrderInput"
    ).value =
        model.order || 1;


    document.getElementById(
        "modelActiveInput"
    ).checked =
        model.active !== false;


    modelModal.hidden =
        false;

}



/* =========================================================
   SAVE MODEL
========================================================= */

modelForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "modelNameInput"
            ).value.trim();


        const order =
            Number(
                document.getElementById(
                    "modelOrderInput"
                ).value
            );


        const active =
            document.getElementById(
                "modelActiveInput"
            ).checked;


        if (!name) {

            alert(
                "Please enter the model name."
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
            document.getElementById(
                "saveModelButton"
            );


        try {

            saveButton.disabled =
                true;


            saveButton.textContent =
                "SAVING...";


            if (editingModelId) {

                await updateDoc(
                    doc(
                        db,
                        "phoneModels",
                        editingModelId
                    ),
                    {

                        name,

                        order,

                        active,

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }

            else {

                await addDoc(
                    collection(
                        db,
                        "phoneModels"
                    ),
                    {

                        name,

                        order,

                        active,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }


            closeModelModal();


            await loadModels();


            updateDashboard();


        }

        catch (error) {

            console.error(
                "SAVE MODEL ERROR:",
                error
            );


            alert(
                "Could not save model. Check your Firestore rules."
            );

        }

        finally {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "SAVE MODEL";

        }

    }
);



/* =========================================================
   MODEL ON/OFF
========================================================= */

async function setModelActive(
    id,
    active
) {

    try {

        await updateDoc(
            doc(
                db,
                "phoneModels",
                id
            ),
            {

                active,

                updatedAt:
                    serverTimestamp()

            }
        );


        await loadModels();


        updateDashboard();

    }

    catch (error) {

        console.error(
            "MODEL TOGGLE ERROR:",
            error
        );


        alert(
            "Unable to change model availability."
        );


        await loadModels();

    }

}



/* =========================================================
   DELETE MODEL
========================================================= */

async function removeModel(id) {

    const model =
        models.find(
            item =>
                item.id === id
        );


    if (!model) {
        return;
    }


    const confirmDelete =
        window.confirm(
            `Delete ${model.name}?`
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "phoneModels",
                id
            )
        );


        await loadModels();


        updateDashboard();

    }

    catch (error) {

        console.error(
            "DELETE MODEL ERROR:",
            error
        );


        alert(
            "Unable to delete this model."
        );

    }

}



/* =========================================================
   CLOSE MODEL MODAL
========================================================= */

function closeModelModal() {

    modelModal.hidden =
        true;


    editingModelId =
        null;

}


document
    .getElementById(
        "closeModelModal"
    )
    .addEventListener(
        "click",
        closeModelModal
    );


document
    .getElementById(
        "cancelModelButton"
    )
    .addEventListener(
        "click",
        closeModelModal
    );



/* =========================================================
   ORDERS — LOAD
========================================================= */

async function loadOrders() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        orders = [];


        snapshot.forEach(
            item => {

                orders.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        orders.sort(
            (a,b) => {

                return getTime(
                    b.createdAt
                ) -
                getTime(
                    a.createdAt
                );

            }
        );


        renderOrders();

        renderRecentOrders();

        updateDashboard();

    }

    catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        document.getElementById(
            "ordersList"
        ).innerHTML = `

            <div class="empty-dashboard">

                Unable to load orders.

            </div>

        `;

    }

}



/* =========================================================
   ORDERS — RENDER
========================================================= */

function renderOrders(
    list = orders
) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-dashboard">

                No orders found.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    list.forEach(
        order => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "order-row";


            const status =
                safeStatus(
                    order.orderStatus ||
                    "pending"
                );


            row.innerHTML = `

                <div>

                    <strong>
                        #${escapeHTML(
                            order.orderId ||
                            order.id
                        )}
                    </strong>

                </div>


                <div>

                    <strong>
                        ${escapeHTML(
                            order.customerName ||
                            "Customer"
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            order.phone ||
                            ""
                        )}
                    </small>

                </div>


                <div>

                    ${escapeHTML(
                        order.modelName ||
                        order.model ||
                        "NeonCase"
                    )}

                </div>


                <div>

                    ₹${Number(
                        order.price || 699
                    )}

                </div>


                <div>

                    <span
                        class="status ${status}"
                    >
                        ${status.toUpperCase()}
                    </span>

                </div>


                <div>

                    <button
                        type="button"
                        class="view-button"
                        data-view-order="${order.id}"
                    >
                        VIEW
                    </button>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    container
        .querySelectorAll(
            "[data-view-order]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openOrder(
                            button.dataset.viewOrder
                        );

                    }
                );

            }
        );

}



/* =========================================================
   RECENT ORDERS
========================================================= */

function renderRecentOrders() {

    const container =
        document.getElementById(
            "recentOrders"
        );


    if (!orders.length) {

        container.innerHTML = `

            <div class="empty-dashboard">
                No orders yet.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    orders
        .slice(0,5)
        .forEach(
            order => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "recent-order";


                item.innerHTML = `

                    <strong>
                        #${escapeHTML(
                            order.orderId ||
                            order.id
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            order.customerName ||
                            "Customer"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            order.modelName ||
                            order.model ||
                            "NeonCase"
                        )}
                    </span>

                    <span>
                        ₹${Number(
                            order.price || 699
                        )}
                    </span>

                `;


                container.appendChild(
                    item
                );

            }
        );

}



/* =========================================================
   OPEN ORDER
========================================================= */

function openOrder(id) {

    /*
     * Never allow both modals together.
     */

    closeModelModal();


    const order =
        orders.find(
            item =>
                item.id === id
        );


    if (!order) {

        alert(
            "Order not found."
        );

        return;

    }


    selectedOrderId =
        id;


    document.getElementById(
        "orderModalTitle"
    ).textContent =
        `#${order.orderId || order.id}`;


    document.getElementById(
        "orderStatusSelect"
    ).value =
        safeStatus(
            order.orderStatus ||
            "pending"
        );


    const address = [

        order.address1,

        order.address2,

        order.district,

        order.state,

        order.pincode

    ]
        .filter(
            value =>
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
        )
        .join(", ");


    document.getElementById(
        "orderDetails"
    ).innerHTML = `

        <div class="detail-row">

            <span>
                Customer
            </span>

            <strong>
                ${escapeHTML(
                    order.customerName ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Email
            </span>

            <strong>
                ${escapeHTML(
                    order.email ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Phone
            </span>

            <strong>
                ${escapeHTML(
                    order.phone ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                iPhone Model
            </span>

            <strong>
                ${escapeHTML(
                    order.modelName ||
                    order.model ||
                    "-"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Amount
            </span>

            <strong>
                ₹${Number(
                    order.price || 699
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Payment
            </span>

            <strong>
                ${escapeHTML(
                    order.paymentStatus ||
                    "Pending"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Address
            </span>

            <strong>
                ${escapeHTML(
                    address ||
                    "-"
                )}
            </strong>

        </div>

    `;


    /*
     * APPROVE BUTTON
     */

    const approveButton =
        document.getElementById(
            "approveOrderButton"
        );


    if (
        (
            order.orderStatus ||
            "pending"
        ) === "pending"
    ) {

        approveButton.style.display =
            "block";

    }

    else {

        approveButton.style.display =
            "none";

    }


    orderModal.hidden =
        false;

}



/* =========================================================
   APPROVE ORDER
========================================================= */

document
    .getElementById(
        "approveOrderButton"
    )
    .addEventListener(
        "click",
        async () => {

            if (!selectedOrderId) {

                return;

            }


            const button =
                document.getElementById(
                    "approveOrderButton"
                );


            try {

                button.disabled =
                    true;


                button.textContent =
                    "APPROVING...";


                await updateDoc(
                    doc(
                        db,
                        "orders",
                        selectedOrderId
                    ),
                    {

                        orderStatus:
                            "approved",

                        updatedAt:
                            serverTimestamp()

                    }
                );


                closeOrderModal();


                await loadOrders();


                updateDashboard();


                alert(
                    "Order approved successfully."
                );

            }

            catch (error) {

                console.error(
                    "APPROVE ORDER ERROR:",
                    error
                );


                alert(
                    "Unable to approve order."
                );

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "APPROVE ORDER";

            }

        }
    );



/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

document
    .getElementById(
        "updateOrderButton"
    )
    .addEventListener(
        "click",
        async () => {

            if (!selectedOrderId) {

                return;

            }


            const newStatus =
                document.getElementById(
                    "orderStatusSelect"
                ).value;


            try {

                const button =
                    document.getElementById(
                        "updateOrderButton"
                    );


                button.disabled =
                    true;


                button.textContent =
                    "UPDATING...";


                await updateDoc(
                    doc(
                        db,
                        "orders",
                        selectedOrderId
                    ),
                    {

                        orderStatus:
                            newStatus,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                closeOrderModal();


                await loadOrders();


                updateDashboard();


                alert(
                    "Order status updated."
                );

            }

            catch (error) {

                console.error(
                    "UPDATE ORDER ERROR:",
                    error
                );


                alert(
                    "Unable to update order."
                );

            }

            finally {

                const button =
                    document.getElementById(
                        "updateOrderButton"
                    );


                button.disabled =
                    false;


                button.textContent =
                    "UPDATE STATUS";

            }

        }
    );



/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrderModal() {

    if (!orderModal) {
        return;
    }


    orderModal.hidden =
        true;


    selectedOrderId =
        null;


    const details =
        document.getElementById(
            "orderDetails"
        );


    if (details) {

        details.innerHTML =
            "";

    }

}


document
    .getElementById(
        "closeOrderModal"
    )
    .addEventListener(
        "click",
        closeOrderModal
    );



/* =========================================================
   SEARCH ORDERS
========================================================= */

document
    .getElementById(
        "orderSearch"
    )
    .addEventListener(
        "input",
        filterOrders
    );


document
    .getElementById(
        "orderFilter"
    )
    .addEventListener(
        "change",
        filterOrders
    );


function filterOrders() {

    const search =
        document.getElementById(
            "orderSearch"
        ).value
            .toLowerCase()
            .trim();


    const filter =
        document.getElementById(
            "orderFilter"
        ).value;


    const filtered =
        orders.filter(
            order => {

                const text = [

                    order.orderId,

                    order.id,

                    order.customerName,

                    order.email,

                    order.phone,

                    order.modelName,

                    order.model

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                const currentStatus =
                    order.orderStatus ||
                    "pending";


                const matchesFilter =
                    filter === "all" ||
                    currentStatus === filter;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    renderOrders(
        filtered
    );

}



/* =========================================================
   SEARCH MODELS
========================================================= */

document
    .getElementById(
        "modelSearch"
    )
    .addEventListener(
        "input",
        () => {

            const search =
                document.getElementById(
                    "modelSearch"
                ).value
                    .toLowerCase()
                    .trim();


            const filtered =
                models.filter(
                    model =>
                        String(
                            model.name || ""
                        )
                            .toLowerCase()
                            .includes(search)
                );


            renderModels(
                filtered
            );

        }
    );



/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                (
                    order.orderStatus ||
                    "pending"
                ) === "pending"
        ).length;


    const processing =
        orders.filter(
            order =>
                (
                    order.orderStatus ||
                    ""
                ) === "processing"
        ).length;


    const delivered =
        orders.filter(
            order =>
                (
                    order.orderStatus ||
                    ""
                ) === "delivered"
        ).length;


    setText(
        "totalOrders",
        total
    );


    setText(
        "pendingOrders",
        pending
    );


    setText(
        "processingOrders",
        processing
    );


    setText(
        "deliveredOrders",
        delivered
    );


    setText(
        "pendingBadge",
        pending
    );


    updateModelCounts();

}



/* =========================================================
   MODEL COUNTS
========================================================= */

function updateModelCounts() {

    const active =
        models.filter(
            model =>
                model.active !== false
        ).length;


    const inactive =
        models.filter(
            model =>
                model.active === false
        ).length;


    setText(
        "activeModelCount",
        active
    );


    setText(
        "inactiveModelCount",
        inactive
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
                "LOGOUT ERROR:",
                error
            );


            alert(
                "Unable to sign out."
            );

        }

    }
);



/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

modelModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modelModal
        ) {

            closeModelModal();

        }

    }
);


orderModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            orderModal
        ) {

            closeOrderModal();

        }

    }
);



/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeModelModal();

            closeOrderModal();

        }

    }
);



/* =========================================================
   UTILITY — TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            String(value);

    }

}



/* =========================================================
   UTILITY — TIMESTAMP
========================================================= */

function getTime(
    timestamp
) {

    if (!timestamp) {
        return 0;
    }


    if (
        typeof timestamp.seconds ===
        "number"
    ) {

        return timestamp.seconds;

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    return 0;

}



/* =========================================================
   UTILITY — SAFE STATUS
========================================================= */

function safeStatus(
    status
) {

    const allowed = [

        "pending",

        "approved",

        "processing",

        "shipped",

        "delivered",

        "cancelled"

    ];


    if (
        allowed.includes(status)
    ) {

        return status;

    }


    return "pending";

}



/* =========================================================
   UTILITY — ESCAPE HTML
========================================================= */

function escapeHTML(
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
