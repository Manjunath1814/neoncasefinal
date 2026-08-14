/* =========================================================
   NEONCASE ADMIN
   admin/admin.js
========================================================= */

import { firebaseConfig } from "../firebase-config.js";

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
   STATE
========================================================= */

let orders = [];

let models = [];

let customers = [];

let selectedOrderId = null;

let editingModelId = null;


/* =========================================================
   DOM
========================================================= */

const accessScreen =
    document.getElementById("accessScreen");

const adminApp =
    document.getElementById("adminApp");

const adminEmail =
    document.getElementById("adminEmail");

const modelModal =
    document.getElementById("modelModal");

const orderModal =
    document.getElementById("orderModal");


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showAccessError(
                "Please sign in with your administrator account."
            );

            return;
        }


        try {

            const adminRef =
                doc(
                    db,
                    "admins",
                    user.uid
                );


            const adminSnap =
                await getDoc(adminRef);


            if (!adminSnap.exists()) {

                showAccessError(
                    "This Google account is not authorized."
                );

                return;
            }


            const adminData =
                adminSnap.data();


            if (
                adminData.active === false
            ) {

                showAccessError(
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
                user.email || "-";


            const settingsEmail =
                document.getElementById(
                    "settingsEmail"
                );


            if (settingsEmail) {

                settingsEmail.textContent =
                    user.email || "-";

            }


            await initializeAdmin();

        }

        catch (error) {

            console.error(
                "Admin verification error:",
                error
            );


            showAccessError(
                "Unable to verify administrator access."
            );

        }

    }
);


/* =========================================================
   ACCESS ERROR
========================================================= */

function showAccessError(message) {

    accessScreen.innerHTML = `

        <div class="access-card">

            <div class="brand">
                NEON<span>CASE</span>
            </div>

            <div class="admin-word">
                ADMIN PANEL
            </div>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                id="loginAgain"
                class="blue-button"
                style="margin-top:20px;"
            >
                GO TO LOGIN
            </button>

        </div>

    `;


    document
        .getElementById("loginAgain")
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeAdmin() {

    await Promise.all([
        loadOrders(),
        loadModels()
    ]);

    buildCustomers();

    updateDashboard();

}


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-button")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.page
                    );

                }
            );

        }
    );


document
    .querySelectorAll("[data-go]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.go
                    );

                }
            );

        }
    );


function openPage(page) {

    const pageMap = {

        dashboard:
            "dashboardPage",

        orders:
            "ordersPage",

        models:
            "modelsPage",

        customers:
            "customersPage",

        tracking:
            "trackingPage",

        settings:
            "settingsPage"

    };


    if (!pageMap[page]) {
        return;
    }


    Object.values(pageMap)
        .forEach(
            id => {

                document.getElementById(
                    id
                ).hidden = true;

            }
        );


    document.getElementById(
        pageMap[page]
    ).hidden = false;


    document
        .querySelectorAll(".nav-button")
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page === page
                );

            }
        );


    const titles = {

        dashboard: [
            "OVERVIEW",
            "Dashboard"
        ],

        orders: [
            "ORDER MANAGEMENT",
            "Orders"
        ],

        models: [
            "PRODUCT CATALOG",
            "iPhone Models"
        ],

        customers: [
            "CUSTOMER DATABASE",
            "Customers"
        ],

        tracking: [
            "ORDER TRACKING",
            "Tracking"
        ],

        settings: [
            "STORE SETTINGS",
            "Settings"
        ]

    };


    document.getElementById(
        "pageEyebrow"
    ).textContent =
        titles[page][0];


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[page][1];

}


/* =========================================================
   ORDERS
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
            (a, b) =>
                timestampValue(
                    b.createdAt
                ) -
                timestampValue(
                    a.createdAt
                )
        );


        renderOrders();

        renderRecentOrders();

    }

    catch (error) {

        console.error(
            "Orders error:",
            error
        );


        document.getElementById(
            "ordersList"
        ).innerHTML = `

            <div class="empty">
                Unable to load orders.
            </div>

        `;

    }

}


/* =========================================================
   RENDER ORDERS
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

            <div class="empty">
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
                    order.orderStatus
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
                        "-"
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
                        class="view-button"
                        data-order-id="${order.id}"
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
            "[data-order-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openOrder(
                            button.dataset.orderId
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


    const recent =
        orders.slice(
            0,
            5
        );


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty">
                No orders yet.
            </div>

        `;

        return;
    }


    container.innerHTML = "";


    recent.forEach(
        order => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "recent-row";


            row.innerHTML = `

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
                        "-"
                    )}
                </span>

                <strong>
                    ₹${Number(
                        order.price || 699
                    )}
                </strong>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   OPEN ORDER
========================================================= */

function openOrder(id) {

    /*
     * IMPORTANT:
     * Never allow two modals to stack.
     */

    closeModelModal();


    const order =
        orders.find(
            item => item.id === id
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
        "orderStatus"
    ).value =
        safeStatus(
            order.orderStatus
        );


    const address = [

        order.address1,

        order.address2,

        order.district,

        order.state,

        order.pincode

    ]
        .filter(Boolean)
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
                    address || "-"
                )}
            </strong>

        </div>

    `;


    orderModal.hidden = false;

}


/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrderModal() {

    orderModal.hidden =
        true;

    selectedOrderId =
        null;

}


/* =========================================================
   UPDATE ORDER
========================================================= */

document
    .getElementById(
        "updateOrder"
    )
    .addEventListener(
        "click",
        async () => {

            if (!selectedOrderId) {

                alert(
                    "No order selected."
                );

                return;
            }


            const newStatus =
                document.getElementById(
                    "orderStatus"
                ).value;


            try {

                const button =
                    document.getElementById(
                        "updateOrder"
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


                buildCustomers();


                updateDashboard();


                alert(
                    "Order updated successfully."
                );

            }

            catch (error) {

                console.error(
                    "Update order error:",
                    error
                );


                alert(
                    "Unable to update order."
                );

            }

            finally {

                const button =
                    document.getElementById(
                        "updateOrder"
                    );


                button.disabled =
                    false;


                button.textContent =
                    "UPDATE ORDER";

            }

        }
    );


document
    .getElementById(
        "closeOrderModal"
    )
    .addEventListener(
        "click",
        closeOrderModal
    );


/* =========================================================
   ORDER SEARCH
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

                const searchable = [

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
                    searchable.includes(
                        search
                    );


                const currentStatus =
                    safeStatus(
                        order.orderStatus
                    );


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
   MODELS
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
            (a, b) =>
                Number(a.order || 9999) -
                Number(b.order || 9999)
        );


        renderModels();

        updateModelCounts();

    }

    catch (error) {

        console.error(
            "Models error:",
            error
        );


        document.getElementById(
            "modelsGrid"
        ).innerHTML = `

            <div class="empty">
                Unable to load models.
            </div>

        `;

    }

}


/* =========================================================
   RENDER MODELS
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

            <div class="empty">

                No models found.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    list.forEach(
        model => {

            const active =
                model.active !== false;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "model-card";


            card.innerHTML = `

                <div>

                    <h3>
                        ${escapeHTML(
                            model.name
                        )}
                    </h3>

                    <div class="model-order">
                        Display order:
                        ${Number(
                            model.order || 0
                        )}
                    </div>

                </div>


                <div class="model-bottom">

                    <label class="model-toggle">

                        <span>
                            ${active ? "ON" : "OFF"}
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
                            class="icon-button"
                            data-edit-model="${model.id}"
                        >
                            ✎
                        </button>

                        <button
                            class="icon-button delete-button"
                            data-delete-model="${model.id}"
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


    container
        .querySelectorAll(
            "[data-model-toggle]"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "change",
                    () => {

                        toggleModel(
                            input.dataset.modelToggle,
                            input.checked
                        );

                    }
                );

            }
        );


    container
        .querySelectorAll(
            "[data-edit-model]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editModel(
                            button.dataset.editModel
                        );

                    }
                );

            }
        );


    container
        .querySelectorAll(
            "[data-delete-model]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteModel(
                            button.dataset.deleteModel
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
                "modelForm"
            ).reset();


            document.getElementById(
                "modelActive"
            ).checked =
                true;


            modelModal.hidden =
                false;

        }
    );


/* =========================================================
   EDIT MODEL
========================================================= */

function editModel(id) {

    closeOrderModal();


    const model =
        models.find(
            item => item.id === id
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

document
    .getElementById(
        "modelForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document.getElementById(
                    "modelName"
                ).value.trim();


            const order =
                Number(
                    document.getElementById(
                        "modelOrder"
                    ).value
                );


            const active =
                document.getElementById(
                    "modelActive"
                ).checked;


            if (!name) {

                alert(
                    "Enter a model name."
                );

                return;
            }


            if (
                !Number.isFinite(order) ||
                order < 1
            ) {

                alert(
                    "Enter a valid display order."
                );

                return;
            }


            try {

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


                alert(
                    "Model saved."
                );

            }

            catch (error) {

                console.error(
                    "Save model error:",
                    error
                );


                alert(
                    "Unable to save model. Check Firestore permissions."
                );

            }

        }
    );


/* =========================================================
   TOGGLE MODEL
========================================================= */

async function toggleModel(
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
            "Toggle model error:",
            error
        );


        alert(
            "Unable to change model status."
        );


        await loadModels();

    }

}


/* =========================================================
   DELETE MODEL
========================================================= */

async function deleteModel(id) {

    const model =
        models.find(
            item => item.id === id
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
            "Delete model error:",
            error
        );


        alert(
            "Unable to delete model."
        );

    }

}


/* =========================================================
   CLOSE MODEL
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
        "cancelModel"
    )
    .addEventListener(
        "click",
        closeModelModal
    );


/* =========================================================
   MODEL SEARCH
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
   CUSTOMERS
========================================================= */

function buildCustomers() {

    const map =
        new Map();


    orders.forEach(
        order => {

            const email =
                order.email ||
                "unknown";


            if (!map.has(email)) {

                map.set(
                    email,
                    {

                        name:
                            order.customerName ||
                            "Customer",

                        email,

                        phone:
                            order.phone ||
                            "-",

                        orders: []

                    }
                );

            }


            map.get(email)
                .orders
                .push(order);

        }
    );


    customers =
        Array.from(
            map.values()
        );


    renderCustomers();

}


function renderCustomers(
    list = customers
) {

    const container =
        document.getElementById(
            "customersGrid"
        );


    if (!list.length) {

        container.innerHTML = `

            <div class="empty">
                No customers found.
            </div>

        `;

        return;
    }


    container.innerHTML = "";


    list.forEach(
        customer => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "customer-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        customer.name
                    )}
                </h3>

                <div class="customer-email">
                    ${escapeHTML(
                        customer.email
                    )}
                </div>

                <div class="customer-phone">
                    ${escapeHTML(
                        customer.phone
                    )}
                </div>


                <div class="customer-orders">

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        ${customer.orders.length}
                    </strong>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


document
    .getElementById(
        "customerSearch"
    )
    .addEventListener(
        "input",
        () => {

            const search =
                document.getElementById(
                    "customerSearch"
                ).value
                    .toLowerCase()
                    .trim();


            const filtered =
                customers.filter(
                    customer => {

                        const text = [

                            customer.name,

                            customer.email,

                            customer.phone

                        ]
                            .join(" ")
                            .toLowerCase();


                        return text.includes(
                            search
                        );

                    }
                );


            renderCustomers(
                filtered
            );

        }
    );


/* =========================================================
   TRACKING SEARCH
========================================================= */

document
    .getElementById(
        "trackingSearchButton"
    )
    .addEventListener(
        "click",
        searchTracking
    );


document
    .getElementById(
        "trackingSearch"
    )
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                searchTracking();

            }

        }
    );


function searchTracking() {

    const value =
        document.getElementById(
            "trackingSearch"
        ).value
            .trim()
            .toLowerCase();


    const result =
        document.getElementById(
            "trackingResult"
        );


    if (!value) {

        result.innerHTML = `

            <div class="tracking-empty">
                Enter an order ID.
            </div>

        `;

        return;
    }


    const order =
        orders.find(
            item =>
                String(
                    item.orderId ||
                    item.id
                )
                    .toLowerCase() === value
        );


    if (!order) {

        result.innerHTML = `

            <div class="tracking-empty">
                Order not found.
            </div>

        `;

        return;
    }


    renderTracking(
        order
    );

}


function renderTracking(order) {

    const result =
        document.getElementById(
            "trackingResult"
        );


    const status =
        safeStatus(
            order.orderStatus
        );


    const statuses = [

        "pending",

        "approved",

        "processing",

        "shipped",

        "delivered"

    ];


    const currentIndex =
        statuses.indexOf(
            status
        );


    const names = {

        pending:
            "Order Placed",

        approved:
            "Order Approved",

        processing:
            "Processing",

        shipped:
            "Shipped",

        delivered:
            "Delivered"

    };


    let steps = "";


    statuses.forEach(
        (item, index) => {

            let className = "";


            if (
                index < currentIndex
            ) {

                className =
                    "completed";

            }

            else if (
                index === currentIndex
            ) {

                className =
                    "current";

            }


            steps += `

                <div
                    class="track-step ${className}"
                >

                    <strong>
                        ${names[item]}
                    </strong>

                    <span>
                        ${
                            index <= currentIndex
                            ? "Completed"
                            : "Waiting"
                        }
                    </span>

                </div>

            `;

        }
    );


    result.innerHTML = `

        <div class="tracking-card">

            <h3>
                #${escapeHTML(
                    order.orderId ||
                    order.id
                )}
            </h3>

            <div class="tracking-model">

                ${escapeHTML(
                    order.modelName ||
                    order.model ||
                    "NeonCase"
                )}

            </div>


            <div class="tracking-line">

                ${steps}

            </div>

        </div>

    `;

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                safeStatus(
                    order.orderStatus
                ) === "pending"
        ).length;


    const processing =
        orders.filter(
            order =>
                safeStatus(
                    order.orderStatus
                ) === "processing"
        ).length;


    const delivered =
        orders.filter(
            order =>
                safeStatus(
                    order.orderStatus
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

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
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
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModelModal();

            closeOrderModal();

        }

    }
);


/* =========================================================
   UTILITIES
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function timestampValue(
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


    return allowed.includes(
        status
    )
        ? status
        : "pending";

}


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
