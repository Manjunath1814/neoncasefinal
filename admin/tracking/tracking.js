/* =====================================================
   NEONCASE ADMIN — REALTIME TRACKING
===================================================== */

import {
    db
} from "../firebase-config.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   ELEMENTS
===================================================== */

const trackingList =
    document.getElementById(
        "trackingList"
    );

const searchInput =
    document.getElementById(
        "trackingSearch"
    );

const connectionDot =
    document.getElementById(
        "connectionDot"
    );

const connectionText =
    document.getElementById(
        "connectionText"
    );


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


function openSidebar() {

    sidebar?.classList.add(
        "open"
    );

    sidebarOverlay?.classList.add(
        "show"
    );

}


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "show"
    );

}


menuButton?.addEventListener(
    "click",
    openSidebar
);

sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
);


/* =====================================================
   REALTIME ORDERS
===================================================== */

let allOrders = [];


const ordersQuery =
    query(
        collection(
            db,
            "orders"
        ),
        orderBy(
            "createdAt",
            "desc"
        )
    );


onSnapshot(

    ordersQuery,

    (snapshot) => {

        allOrders =
            snapshot.docs.map(
                (document) => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );


        setConnection(
            true
        );


        renderOrders(
            allOrders
        );

    },

    (error) => {

        console.error(
            "Firestore tracking error:",
            error
        );


        setConnection(
            false
        );


        trackingList.innerHTML = `

            <div class="empty">

                Unable to load orders.

            </div>

        `;

    }

);


/* =====================================================
   CONNECTION STATUS
===================================================== */

function setConnection(
    connected
) {

    if (!connectionDot ||
        !connectionText) {

        return;

    }


    if (connected) {

        connectionDot.className =
            "connection-dot connected";

        connectionText.textContent =
            "Connected to Firestore";

    }

    else {

        connectionDot.className =
            "connection-dot error";

        connectionText.textContent =
            "Firestore connection error";

    }

}


/* =====================================================
   SEARCH
===================================================== */

searchInput?.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderOrders(
                allOrders
            );

            return;

        }


        const filtered =
            allOrders.filter(
                (order) => {

                    const id =
                        String(
                            order.orderId ||
                            order.id ||
                            ""
                        ).toLowerCase();


                    const name =
                        String(
                            order.name ||
                            order.customerName ||
                            ""
                        ).toLowerCase();


                    const phone =
                        String(
                            order.phone ||
                            ""
                        ).toLowerCase();


                    return (

                        id.includes(search)

                        ||

                        name.includes(search)

                        ||

                        phone.includes(search)

                    );

                }
            );


        renderOrders(
            filtered
        );

    }
);


/* =====================================================
   RENDER
===================================================== */

function renderOrders(
    orders
) {

    if (!trackingList) {
        return;
    }


    if (!orders.length) {

        trackingList.innerHTML = `

            <div class="empty">

                No orders found.

            </div>

        `;

        return;

    }


    trackingList.innerHTML =
        orders.map(
            createTrackingRow
        ).join("");

}


/* =====================================================
   CREATE TRACKING ROW
===================================================== */

function createTrackingRow(
    order
) {

    const status =
        normalizeStatus(
            order.status
        );


    const customer =
        order.customerName ||
        order.name ||
        "Customer";


    const phone =
        order.phone ||
        "No phone";


    const model =
        order.model ||
        order.productModel ||
        "iPhone";


    const orderId =
        order.orderId ||
        order.id;


    const currentStep =
        getStep(
            status
        );


    const steps = [
        "approved",
        "processing",
        "shipped",
        "delivered"
    ];


    const timeline =
        steps.map(
            (step, index) => {

                const stepNumber =
                    index + 1;


                const completed =
                    currentStep >
                    stepNumber;


                const current =
                    currentStep ===
                    stepNumber;


                return `

                    <div
                        class="timeline-step
                        ${
                            completed
                                ? "completed"
                                : ""
                        }
                        ${
                            current
                                ? "current"
                                : ""
                        }"
                    >

                        <div
                            class="timeline-dot"
                        ></div>

                        ${
                            index <
                            steps.length - 1
                                ? `
                                    <div
                                        class="timeline-line
                                        ${
                                            currentStep >
                                            stepNumber
                                                ? "completed"
                                                : ""
                                        }"
                                    ></div>
                                `
                                : ""
                        }

                    </div>

                `;

            }
        ).join("");


    return `

        <article
            class="tracking-row"
        >

            <div
                class="tracking-id"
            >

                #${escapeHTML(
                    orderId
                )}

            </div>


            <div
                class="customer"
            >

                <strong>
                    ${escapeHTML(
                        customer
                    )}
                </strong>

                <small>
                    ${escapeHTML(
                        phone
                    )}
                </small>

            </div>


            <div
                class="model"
            >

                <strong>
                    ${escapeHTML(
                        model
                    )}
                </strong>

                <small>
                    NeonCase
                </small>

            </div>


            <div>

                <div
                    class="timeline"
                >

                    ${timeline}

                </div>


                <div
                    class="current-status"
                >

                    ${escapeHTML(
                        formatStatus(
                            status
                        )
                    )}

                </div>

            </div>


            <button
                class="track-button"
                type="button"
                onclick="
                    openOrder(
                        '${escapeAttribute(
                            orderId
                        )}'
                    )
                "
            >

                VIEW

            </button>

        </article>

    `;

}


/* =====================================================
   STATUS
===================================================== */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "pending"
        )
        .toLowerCase()
        .trim();


    if (
        value === "approved"
    ) {

        return "approved";

    }


    if (
        value === "processing"
    ) {

        return "processing";

    }


    if (
        value === "shipped"
    ) {

        return "shipped";

    }


    if (
        value === "delivered"
    ) {

        return "delivered";

    }


    return "pending";

}


function getStep(
    status
) {

    const steps = {

        pending: 0,

        approved: 1,

        processing: 2,

        shipped: 3,

        delivered: 4

    };


    return (
        steps[status] ??
        0
    );

}


function formatStatus(
    status
) {

    const names = {

        pending:
            "Pending approval",

        approved:
            "Approved",

        processing:
            "Processing",

        shipped:
            "Shipped",

        delivered:
            "Delivered"

    };


    return (
        names[status] ||
        "Pending"
    );

}


/* =====================================================
   VIEW ORDER
===================================================== */

function openOrder(
    orderId
) {

    const order =
        allOrders.find(
            (item) =>
                (
                    item.orderId ||
                    item.id
                ) === orderId
        );


    if (!order) {

        console.log(
            "Order not found:",
            orderId
        );

        return;

    }


    console.log(
        "Selected order:",
        order
    );


    /*
     * Later we will open a full
     * tracking/order detail page.
     */

}


/* =====================================================
   SECURITY HELPERS
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


function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "\\",
        "\\\\"
    )
    .replaceAll(
        "'",
        "\\'"
    );

}


console.log(
    "NeonCase realtime tracking loaded."
);
