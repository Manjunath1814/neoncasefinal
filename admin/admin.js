/* =========================================================
   NEONCASE ADMIN PANEL
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let models = [];

let orders = [];

let editingModelId = null;

let selectedOrderId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const accessScreen =
    document.getElementById("accessScreen");

const adminApp =
    document.getElementById("adminApp");

const adminEmail =
    document.getElementById("adminEmail");

const logoutButton =
    document.getElementById("logoutButton");

const modelModal =
    document.getElementById("modelModal");

const orderModal =
    document.getElementById("orderModal");

const modelForm =
    document.getElementById("modelForm");


/* =========================================================
   START AUTH CHECK
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        showAccessMessage(
            "Please sign in with your administrator account."
        );

        return;
    }


    try {

        /*
         * Check whether this user's UID exists
         * inside the Firestore "admins" collection.
         */

        const adminRef = doc(
            db,
            "admins",
            user.uid
        );

        const adminSnapshot =
            await getDoc(adminRef);


        if (!adminSnapshot.exists()) {

            showAccessMessage(
                "This Google account is not authorized to access the admin panel."
            );

            return;
        }


        const adminData =
            adminSnapshot.data();


        if (adminData.active === false) {

            showAccessMessage(
                "This administrator account is disabled."
            );

            return;
        }


        /* =========================================
           ADMIN VERIFIED
        ========================================== */

        accessScreen.hidden = true;

        adminApp.hidden = false;

        adminEmail.textContent =
            user.email || "Administrator";


        await initializeAdmin();

    }

    catch (error) {

        console.error(
            "ADMIN AUTH ERROR:",
            error
        );

        showAccessMessage(
            "Unable to verify administrator access."
        );

    }

});


/* =========================================================
   ACCESS MESSAGE
========================================================= */

function showAccessMessage(message) {

    accessScreen.innerHTML = `

        <div class="access-box">

            <div class="access-logo">
                neoncase<span>.in</span>
            </div>

            <p>
                ${escapeHTML(message)}
            </p>

            <br>

            <button
                id="goLoginButton"
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


    const button =
        document.getElementById(
            "goLoginButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../log/index.html";

            }
        );

    }

}


/* =========================================================
   INITIALIZE ADMIN
========================================================= */

async function initializeAdmin() {

    try {

        await Promise.all([
            loadModels(),
            loadOrders()
        ]);

        updateDashboard();

    }

    catch (error) {

        console.error(
            "ADMIN INITIALIZATION ERROR:",
            error
        );

    }

}


/* =========================================================
   SECTION NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                switchSection(
                    button.dataset.section
                );

            }
        );

    });


document
    .querySelectorAll("[data-open-section]")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                switchSection(
                    button.dataset.openSection
                );

            }
        );

    });


function switchSection(section) {

    const sections = {

        dashboard:
            "dashboardSection",

        orders:
            "ordersSection",

        models:
            "modelsSection"

    };


    if (!sections[section]) {
        return;
    }


    /* Close every section */

    Object.values(sections)
        .forEach((id) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.hidden = true;

            }

        });


    /* Open requested section */

    document.getElementById(
        sections[section]
    ).hidden = false;


    /* Navigation active state */

    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });


    /* Page title */

    const titles = {

        dashboard: {
            eyebrow: "OVERVIEW",
            title: "Dashboard"
        },

        orders: {
            eyebrow: "ORDERS",
            title: "Orders"
        },

        models: {
            eyebrow: "PRODUCT CATALOG",
            title: "iPhone Models"
        }

    };


    document.getElementById(
        "pageEyebrow"
    ).textContent =
        titles[section].eyebrow;


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[section].title;

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


        snapshot.forEach((item) => {

            models.push({

                id: item.id,

                ...item.data()

            });

        });


        models.sort((a, b) => {

            return Number(a.order || 9999) -
                   Number(b.order || 9999);

        });


        renderModels();

        updateModelCounts();

    }

    catch (error) {

        console.error(
            "LOAD MODELS ERROR:",
            error
        );


        const container =
            document.getElementById(
                "modelsGrid"
            );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">
                    Unable to load iPhone models.
                </div>

            `;

        }

    }

}


/* =========================================================
   RENDER MODELS
========================================================= */

function renderModels(list = models) {

    const container =
        document.getElementById(
            "modelsGrid"
        );


    if (!container) {
        return;
    }


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                No iPhone models found.

                <br><br>

                Click ADD MODEL to create one.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    list.forEach((model) => {

        const card =
            document.createElement("div");


        card.className =
            "model-card";


        const isActive =
            model.active !== false;


        card.innerHTML = `

            <div class="model-card-top">

                <div>

                    <h3>
                        ${escapeHTML(
                            model.name || "Unnamed Model"
                        )}
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
                        ${isActive ? "ON" : "OFF"}
                    </span>

                    <span class="mini-toggle">

                        <input
                            type="checkbox"
                            ${
                                isActive
                                ? "checked"
                                : ""
                            }
                            data-toggle-model="${model.id}"
                        >

                        <span class="mini-slider"></span>

                    </span>

                </label>


                <div class="model-actions">

                    <button
                        type="button"
                        class="icon-button"
                        data-edit-model="${model.id}"
                    >
                        ✎
                    </button>


                    <button
                        type="button"
                        class="icon-button delete"
                        data-delete-model="${model.id}"
                    >
                        ×
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });


    /* =========================================
       TOGGLE
    ========================================== */

    container
        .querySelectorAll(
            "[data-toggle-model]"
        )
        .forEach((input) => {

            input.addEventListener(
                "change",
                async () => {

                    await toggleModel(
                        input.dataset.toggleModel,
                        input.checked
                    );

                }
            );

        });


    /* =========================================
       EDIT
    ========================================== */

    container
        .querySelectorAll(
            "[data-edit-model]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openEditModel(
                        button.dataset.editModel
                    );

                }
            );

        });


    /* =========================================
       DELETE
    ========================================== */

    container
        .querySelectorAll(
            "[data-delete-model]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                async () => {

                    await deleteModel(
                        button.dataset.deleteModel
                    );

                }
            );

        });

}


/* =========================================================
   OPEN ADD MODEL
========================================================= */

const addModelButton =
    document.getElementById(
        "addModelButton"
    );


if (addModelButton) {

    addModelButton.addEventListener(
        "click",
        () => {

            /* IMPORTANT:
               Close order modal first.
            */

            closeOrderModal();


            editingModelId = null;


            document.getElementById(
                "modalTitle"
            ).textContent =
                "Add iPhone Model";


            modelForm.reset();


            document.getElementById(
                "modelActiveInput"
            ).checked = true;


            modelModal.hidden = false;

        }
    );

}


/* =========================================================
   OPEN EDIT MODEL
========================================================= */

function openEditModel(id) {

    /* Close order modal first */

    closeOrderModal();


    const model =
        models.find(
            item => item.id === id
        );


    if (!model) {

        alert(
            "Model could not be found."
        );

        return;
    }


    editingModelId = id;


    document.getElementById(
        "modalTitle"
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


    modelModal.hidden = false;

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
                    "Please enter a model name."
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


            try {

                if (editingModelId) {

                    await updateDoc(
                        doc(
                            db,
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

                    await addDoc(
                        collection(
                            db,
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


                await loadModels();


                updateDashboard();


                alert(
                    "Model saved successfully."
                );

            }

            catch (error) {

                console.error(
                    "SAVE MODEL ERROR:",
                    error
                );


                alert(
                    "Unable to save the model. Check Firestore permissions."
                );

            }

        }
    );

}


/* =========================================================
   TOGGLE MODEL
========================================================= */

async function toggleModel(id, active) {

    try {

        await updateDoc(
            doc(
                db,
                "phoneModels",
                id
            ),
            {

                active: active,

                updatedAt:
                    serverTimestamp()

            }
        );


        await loadModels();


        updateDashboard();

    }

    catch (error) {

        console.error(
            "TOGGLE MODEL ERROR:",
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

async function deleteModel(id) {

    const model =
        models.find(
            item => item.id === id
        );


    if (!model) {
        return;
    }


    const confirmed =
        window.confirm(
            `Are you sure you want to delete ${model.name}?`
        );


    if (!confirmed) {
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

    if (!modelModal) {
        return;
    }


    modelModal.hidden = true;


    editingModelId = null;


    if (modelForm) {

        modelForm.reset();

    }

}


/* =========================================================
   MODEL MODAL BUTTONS
========================================================= */

const closeModalButton =
    document.getElementById(
        "closeModal"
    );


if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            closeModelModal();

        }
    );

}


const cancelModalButton =
    document.getElementById(
        "cancelModal"
    );


if (cancelModalButton) {

    cancelModalButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            closeModelModal();

        }
    );

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


        snapshot.forEach((item) => {

            orders.push({

                id: item.id,

                ...item.data()

            });

        });


        orders.sort((a, b) => {

            const aTime =
                getTimestampValue(
                    a.createdAt
                );


            const bTime =
                getTimestampValue(
                    b.createdAt
                );


            return bTime - aTime;

        });


        renderOrders();

        renderRecentOrders();

        updateDashboard();

    }

    catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        const container =
            document.getElementById(
                "ordersList"
            );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    Unable to load orders.

                </div>

            `;

        }

    }

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders(list = orders) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) {
        return;
    }


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                No orders found.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    list.forEach((order) => {

        const row =
            document.createElement("div");


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
                    class="status ${getSafeStatus(status)}"
                >

                    ${escapeHTML(
                        status.toUpperCase()
                    )}

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


        container.appendChild(row);

    });


    /* =========================================
       VIEW ORDER BUTTONS
    ========================================== */

    container
        .querySelectorAll(
            "[data-view-order]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    openOrder(
                        button.dataset.viewOrder
                    );

                }
            );

        });

}


/* =========================================================
   OPEN ORDER MODAL
========================================================= */

function openOrder(id) {

    /*
     * VERY IMPORTANT:
     * Close model modal before opening order modal.
     */

    closeModelModal();


    const order =
        orders.find(
            item => item.id === id
        );


    if (!order) {

        alert(
            "Order could not be found."
        );

        return;
    }


    selectedOrderId = id;


    const title =
        document.getElementById(
            "orderModalTitle"
        );


    if (title) {

        title.textContent =
            `#${order.orderId || order.id}`;

    }


    const statusSelect =
        document.getElementById(
            "orderStatusSelect"
        );


    if (statusSelect) {

        statusSelect.value =
            order.orderStatus ||
            "pending";

    }


    const addressParts = [

        order.address1,

        order.address2,

        order.district,

        order.state,

        order.pincode

    ];


    const address =
        addressParts
            .filter(
                value =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
            )
            .join(", ");


    const details =
        document.getElementById(
            "orderDetails"
        );


    if (!details) {
        return;
    }


    /*
     * We directly put the order information here.
     * There is NO secondary Firebase request.
     * Therefore it cannot remain stuck at "Loading..."
     */

    details.innerHTML = `

        <div class="detail-row">

            <span>
                Customer
            </span>

            <strong>
                ${escapeHTML(
                    order.customerName ||
                    "Not provided"
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
                    "Not provided"
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
                    "Not provided"
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
                    "Not provided"
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
                    "Not provided"
                )}
            </strong>

        </div>

    `;


    /*
     * Only NOW open the order modal.
     */

    orderModal.hidden = false;

}


/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrderModal() {

    if (!orderModal) {
        return;
    }


    orderModal.hidden = true;


    selectedOrderId = null;


    const details =
        document.getElementById(
            "orderDetails"
        );


    if (details) {

        details.innerHTML = "";

    }

}


/* =========================================================
   ORDER MODAL CLOSE BUTTON
========================================================= */

const closeOrderButton =
    document.getElementById(
        "closeOrderModal"
    );


if (closeOrderButton) {

    closeOrderButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            closeOrderModal();

        }
    );

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

const updateOrderButton =
    document.getElementById(
        "updateOrderButton"
    );


if (updateOrderButton) {

    updateOrderButton.addEventListener(
        "click",
        async () => {

            if (!selectedOrderId) {

                alert(
                    "No order selected."
                );

                return;
            }


            const statusSelect =
                document.getElementById(
                    "orderStatusSelect"
                );


            const newStatus =
                statusSelect.value;


            try {

                updateOrderButton.disabled =
                    true;


                updateOrderButton.textContent =
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


                /*
                 * Close modal completely.
                 */

                closeOrderModal();


                /*
                 * Reload orders.
                 */

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

                updateOrderButton.disabled =
                    false;

                updateOrderButton.textContent =
                    "UPDATE ORDER";

            }

        }
    );

}


/* =========================================================
   ORDER SEARCH
========================================================= */

const orderSearch =
    document.getElementById(
        "orderSearch"
    );


if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        filterOrders
    );

}


const orderFilter =
    document.getElementById(
        "orderFilter"
    );


if (orderFilter) {

    orderFilter.addEventListener(
        "change",
        filterOrders
    );

}


function filterOrders() {

    const search =
        (
            document.getElementById(
                "orderSearch"
            )?.value ||
            ""
        )
            .toLowerCase()
            .trim();


    const status =
        document.getElementById(
            "orderFilter"
        )?.value ||
        "all";


    const filtered =
        orders.filter((order) => {

            const searchableText = [

                order.orderId,

                order.id,

                order.customerName,

                order.phone,

                order.email,

                order.modelName,

                order.model,

                order.pincode

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const searchMatches =
                !search ||
                searchableText.includes(
                    search
                );


            const currentStatus =
                order.orderStatus ||
                "pending";


            const statusMatches =
                status === "all" ||
                currentStatus === status;


            return (
                searchMatches &&
                statusMatches
            );

        });


    renderOrders(filtered);

}


/* =========================================================
   RECENT ORDERS
========================================================= */

function renderRecentOrders() {

    const container =
        document.getElementById(
            "recentOrders"
        );


    if (!container) {
        return;
    }


    const recent =
        orders.slice(0, 5);


    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-state">
                No orders yet.
            </div>

        `;

        return;
    }


    container.innerHTML = "";


    recent.forEach((order) => {

        const item =
            document.createElement("div");


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


        container.appendChild(item);

    });

}


/* =========================================================
   MODEL SEARCH
========================================================= */

const modelSearch =
    document.getElementById(
        "modelSearch"
    );


if (modelSearch) {

    modelSearch.addEventListener(
        "input",
        () => {

            const search =
                modelSearch.value
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


            renderModels(filtered);

        }
    );

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

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

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

}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
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


if (orderModal) {

    orderModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                orderModal
            ) {

                closeOrderModal();

            }

        }
    );

}


/* =========================================================
   ESC KEY CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeModelModal();

            closeOrderModal();

        }

    }
);


/* =========================================================
   UTILITY
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            String(value);

    }

}


/* =========================================================
   FIREBASE TIMESTAMP
========================================================= */

function getTimestampValue(timestamp) {

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
   SAFE STATUS
========================================================= */

function getSafeStatus(status) {

    const allowed = [

        "pending",

        "approved",

        "processing",

        "shipped",

        "delivered",

        "cancelled"

    ];


    return allowed.includes(status)
        ? status
        : "pending";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
