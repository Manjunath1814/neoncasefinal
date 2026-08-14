/* =========================================================
   NEONCASE ADMIN
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
    query,
    orderBy,
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
   VARIABLES
========================================================= */

let models = [];

let orders = [];

let editingModelId = null;

let selectedOrderId = null;



/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showAccessDenied(
                "Please sign in with your admin Google account."
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


            const adminSnapshot =
                await getDoc(
                    adminRef
                );


            if (
                !adminSnapshot.exists()
            ) {

                showAccessDenied(
                    "This Google account is not authorized as an administrator."
                );

                return;

            }


            const adminData =
                adminSnapshot.data();


            if (
                adminData.active === false
            ) {

                showAccessDenied(
                    "This administrator account has been disabled."
                );

                return;

            }


            /* ACCESS GRANTED */

            accessScreen.hidden =
                true;


            adminApp.hidden =
                false;


            adminEmail.textContent =
                user.email;


            await initializeAdmin();


        }

        catch (error) {

            console.error(
                "Admin authentication error:",
                error
            );


            showAccessDenied(
                "Unable to verify administrator access."
            );

        }

    }
);



/* =========================================================
   ACCESS DENIED
========================================================= */

function showAccessDenied(
    message
) {

    accessScreen.innerHTML = `

        <div class="access-box">

            <div class="access-logo">
                neoncase<span>.in</span>
            </div>

            <p>
                ${message}
            </p>

            <br>

            <button
                onclick="window.location.href='../log/index.html'"
                style="
                    height:42px;
                    padding:0 18px;
                    border:none;
                    border-radius:6px;
                    background:#1766d4;
                    color:white;
                    cursor:pointer;
                    font-size:9px;
                    font-weight:800;
                "
            >
                GO TO LOGIN
            </button>

        </div>

    `;

}



/* =========================================================
   INITIALIZE
========================================================= */

async function initializeAdmin() {

    await loadModels();

    await loadOrders();

    updateDashboard();

}



/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        (button) => {

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
    .querySelectorAll(
        "[data-open-section]"
    )
    .forEach(
        (button) => {

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



function switchSection(
    section
) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            (item) => {

                item.classList.toggle(
                    "active",
                    item.dataset.section === section
                );

            }
        );


    const sections = {

        dashboard:
            "dashboardSection",

        orders:
            "ordersSection",

        models:
            "modelsSection"

    };


    Object.values(
        sections
    ).forEach(
        (id) => {

            document.getElementById(
                id
            ).hidden = true;

        }
    );


    document.getElementById(
        sections[section]
    ).hidden = false;


    const titles = {

        dashboard:
            ["OVERVIEW", "Dashboard"],

        orders:
            ["ORDERS", "Orders"],

        models:
            ["PRODUCT CATALOG", "iPhone Models"]

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
   LOAD MODELS
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
            (item) => {

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
            "Models loading error:",
            error
        );

        document.getElementById(
            "modelsGrid"
        ).innerHTML = `

            <div class="empty-state">

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

            <div class="empty-state">

                No iPhone models yet.

                Click ADD MODEL to create one.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    list.forEach(
        (model) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "model-card";


            card.innerHTML = `

                <div class="model-card-top">

                    <div>

                        <h3>
                            ${escapeHTML(model.name)}
                        </h3>

                        <div class="model-order">
                            Display order:
                            ${model.order || "-"}
                        </div>

                    </div>

                </div>


                <div class="model-card-bottom">

                    <label class="model-toggle">

                        <span>
                            ${model.active === false
                                ? "OFF"
                                : "ON"}
                        </span>

                        <span class="mini-toggle">

                            <input
                                type="checkbox"
                                ${model.active !== false
                                    ? "checked"
                                    : ""}
                                data-toggle-model="${model.id}"
                            >

                            <span class="mini-slider"></span>

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
                            class="icon-button delete"
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


    /* TOGGLES */

    container
        .querySelectorAll(
            "[data-toggle-model]"
        )
        .forEach(
            (input) => {

                input.addEventListener(
                    "change",
                    () => {

                        toggleModel(
                            input.dataset.toggleModel,
                            input.checked
                        );

                    }
                );

            }
        );


    /* EDIT */

    container
        .querySelectorAll(
            "[data-edit-model]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModel(
                            button.dataset.editModel
                        );

                    }
                );

            }
        );


    /* DELETE */

    container
        .querySelectorAll(
            "[data-delete-model]"
        )
        .forEach(
            (button) => {

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

            editingModelId =
                null;


            document
                .getElementById(
                    "modalTitle"
                )
                .textContent =
                    "Add iPhone Model";


            modelForm.reset();


            document
                .getElementById(
                    "modelActiveInput"
                )
                .checked =
                    true;


            modelModal.hidden =
                false;

        }
    );



/* =========================================================
   EDIT MODEL
========================================================= */

function openEditModel(
    id
) {

    const model =
        models.find(
            (item) =>
                item.id === id
        );


    if (!model) return;


    editingModelId =
        id;


    document
        .getElementById(
            "modalTitle"
        )
        .textContent =
            "Edit iPhone Model";


    document
        .getElementById(
            "modelNameInput"
        )
        .value =
            model.name || "";


    document
        .getElementById(
            "modelOrderInput"
        )
        .value =
            model.order || 1;


    document
        .getElementById(
            "modelActiveInput"
        )
        .checked =
            model.active !== false;


    modelModal.hidden =
        false;

}



/* =========================================================
   SAVE MODEL
========================================================= */

modelForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "modelNameInput"
                )
                .value
                .trim();


        const order =
            Number(
                document
                    .getElementById(
                        "modelOrderInput"
                    )
                    .value
            );


        const active =
            document
                .getElementById(
                    "modelActiveInput"
                )
                .checked;


        if (!name) return;


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

        }

        catch (error) {

            console.error(
                "Model save error:",
                error
            );

            alert(
                "Unable to save model."
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
            "Model toggle error:",
            error
        );

        alert(
            "Unable to update model."
        );

    }

}



/* =========================================================
   DELETE MODEL
========================================================= */

async function deleteModel(
    id
) {

    const model =
        models.find(
            (item) =>
                item.id === id
        );


    if (!model) return;


    const confirmed =
        confirm(
            `Delete ${model.name}?`
        );


    if (!confirmed) return;


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
        "closeModal"
    )
    .addEventListener(
        "click",
        closeModelModal
    );


document
    .getElementById(
        "cancelModal"
    )
    .addEventListener(
        "click",
        closeModelModal
    );



/* =========================================================
   LOAD ORDERS
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
            (item) => {

                orders.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        orders.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds || 0;

                const bTime =
                    b.createdAt?.seconds || 0;

                return bTime - aTime;

            }
        );


        renderOrders();

        renderRecentOrders();

        updateDashboard();

    }

    catch (error) {

        console.error(
            "Orders loading error:",
            error
        );

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

            <div class="empty-state">

                No orders found.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    list.forEach(
        (order) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "order-row";


            const status =
                order.orderStatus ||
                "pending";


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
                            order.phone || ""
                        )}
                    </small>

                </div>


                <div>

                    ${escapeHTML(
                        order.modelName ||
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
            (button) => {

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


    const recent =
        orders.slice(
            0,
            5
        );


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">
                No orders yet.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    recent.forEach(
        (order) => {

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

function openOrder(
    id
) {

    const order =
        orders.find(
            (item) =>
                item.id === id
        );


    if (!order) return;


    selectedOrderId =
        id;


    document
        .getElementById(
            "orderModalTitle"
        )
        .textContent =
            `#${order.orderId || order.id}`;


    document
        .getElementById(
            "orderStatusSelect"
        )
        .value =
            order.orderStatus ||
            "pending";


    const address = [

        order.address1,

        order.address2,

        order.district,

        order.state,

        order.pincode

    ]
        .filter(Boolean)
        .join(", ");


    document
        .getElementById(
            "orderDetails"
        )
        .innerHTML = `

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
                    Model
                </span>

                <strong>
                    ${escapeHTML(
                        order.modelName ||
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
                        order.price ||
                        699
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


    orderModal.hidden =
        false;

}



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

            if (!selectedOrderId) return;


            const status =
                document
                    .getElementById(
                        "orderStatusSelect"
                    )
                    .value;


            try {

                await updateDoc(
                    doc(
                        db,
                        "orders",
                        selectedOrderId
                    ),
                    {

                        orderStatus:
                            status,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                orderModal.hidden =
                    true;


                await loadOrders();

                updateDashboard();

            }

            catch (error) {

                console.error(
                    "Order update error:",
                    error
                );

                alert(
                    "Unable to update order."
                );

            }

        }
    );



/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

document
    .getElementById(
        "closeOrderModal"
    )
    .addEventListener(
        "click",
        () => {

            orderModal.hidden =
                true;

        }
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
        document
            .getElementById(
                "orderSearch"
            )
            .value
            .toLowerCase()
            .trim();


    const status =
        document
            .getElementById(
                "orderFilter"
            )
            .value;


    const filtered =
        orders.filter(
            (order) => {

                const text = [

                    order.orderId,

                    order.customerName,

                    order.phone,

                    order.email,

                    order.modelName

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
                    (
                        order.orderStatus ||
                        "pending"
                    ) === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderOrders(
        filtered
    );

}



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
                document
                    .getElementById(
                        "modelSearch"
                    )
                    .value
                    .toLowerCase()
                    .trim();


            const filtered =
                models.filter(
                    (model) =>
                        model.name
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
            (order) =>
                (order.orderStatus ||
                "pending") ===
                "pending"
        ).length;


    const processing =
        orders.filter(
            (order) =>
                (order.orderStatus ||
                "") ===
                "processing"
        ).length;


    const delivered =
        orders.filter(
            (order) =>
                (order.orderStatus ||
                "") ===
                "delivered"
        ).length;


    document
        .getElementById(
            "totalOrders"
        )
        .textContent =
            total;


    document
        .getElementById(
            "pendingOrders"
        )
        .textContent =
            pending;


    document
        .getElementById(
            "processingOrders"
        )
        .textContent =
            processing;


    document
        .getElementById(
            "deliveredOrders"
        )
        .textContent =
            delivered;


    document
        .getElementById(
            "pendingBadge"
        )
        .textContent =
            pending;


    updateModelCounts();

}



/* =========================================================
   MODEL COUNTS
========================================================= */

function updateModelCounts() {

    const active =
        models.filter(
            (model) =>
                model.active !== false
        ).length;


    const inactive =
        models.filter(
            (model) =>
                model.active === false
        ).length;


    document
        .getElementById(
            "activeModelCount"
        )
        .textContent =
            active;


    document
        .getElementById(
            "inactiveModelCount"
        )
        .textContent =
            inactive;

}



/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await signOut(
            auth
        );

        window.location.href =
            "../log/index.html";

    }
);



/* =========================================================
   ESCAPE HTML
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
