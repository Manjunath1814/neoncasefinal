/* =====================================================
   NEONCASE ADMIN — CUSTOMER HISTORY
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

const customersTable =
    document.getElementById(
        "customersTable"
    );

const searchInput =
    document.getElementById(
        "customerSearch"
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
   DATA
===================================================== */

let allOrders = [];

let customers = [];


/* =====================================================
   FIRESTORE REALTIME LISTENER
===================================================== */

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


        customers =
            buildCustomers(
                allOrders
            );


        setConnection(
            true
        );


        updateStatistics();

        filterCustomers();

    },

    (error) => {

        console.error(
            "Customer History Firestore error:",
            error
        );


        setConnection(
            false
        );


        customersTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="loading-cell"
                >

                    Unable to load customers.

                </td>

            </tr>

        `;

    }

);


/* =====================================================
   BUILD CUSTOMERS FROM ORDERS
===================================================== */

function buildCustomers(
    orders
) {

    const customerMap =
        new Map();


    orders.forEach(
        (order) => {

            const email =
                String(
                    order.email ||
                    order.customerEmail ||
                    ""
                )
                .trim()
                .toLowerCase();


            const phone =
                String(
                    order.phone ||
                    ""
                )
                .trim();


            /*
             * Prefer email as the unique identifier.
             * If no email exists, use phone.
             */

            const key =
                email ||
                phone;


            if (!key) {
                return;
            }


            if (
                !customerMap.has(
                    key
                )
            ) {

                customerMap.set(
                    key,
                    {

                        key,

                        name:
                            order.customerName ||
                            order.name ||
                            "Customer",

                        email:
                            order.email ||
                            order.customerEmail ||
                            "",

                        phone,

                        orders: []

                    }
                );

            }


            customerMap
                .get(key)
                .orders
                .push(order);

        }
    );


    return Array.from(
        customerMap.values()
    );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const customerCount =
        document.getElementById(
            "customerCount"
        );

    const orderCount =
        document.getElementById(
            "orderCount"
        );

    const revenueCount =
        document.getElementById(
            "revenueCount"
        );

    const repeatCount =
        document.getElementById(
            "repeatCount"
        );


    const revenue =
        allOrders.reduce(
            (
                total,
                order
            ) => {

                const amount =
                    Number(
                        order.amount ||
                        order.totalAmount ||
                        order.price ||
                        0
                    );


                return (
                    total +
                    (
                        Number.isFinite(
                            amount
                        )
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    const repeatCustomers =
        customers.filter(
            customer =>
                customer.orders.length > 1
        ).length;


    customerCount.textContent =
        customers.length;


    orderCount.textContent =
        allOrders.length;


    revenueCount.textContent =
        formatMoney(
            revenue
        );


    repeatCount.textContent =
        repeatCustomers;

}


/* =====================================================
   SEARCH
===================================================== */

searchInput?.addEventListener(
    "input",
    filterCustomers
);


function filterCustomers() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!search) {

        renderCustomers(
            customers
        );

        return;

    }


    const filtered =
        customers.filter(
            (customer) => {

                return (

                    customer.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer.phone
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    renderCustomers(
        filtered
    );

}


/* =====================================================
   RENDER CUSTOMERS
===================================================== */

function renderCustomers(
    list
) {

    document.getElementById(
        "visibleCustomers"
    ).textContent =
        list.length;


    if (!list.length) {

        customersTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="loading-cell"
                >

                    No customers found.

                </td>

            </tr>

        `;

        return;

    }


    customersTable.innerHTML =
        list.map(
            createCustomerRow
        ).join("");

}


/* =====================================================
   CUSTOMER ROW
===================================================== */

function createCustomerRow(
    customer
) {

    const orders =
        customer.orders;


    const latestOrder =
        orders[0];


    const totalSpent =
        orders.reduce(
            (
                total,
                order
            ) => {

                const amount =
                    Number(
                        order.amount ||
                        order.totalAmount ||
                        order.price ||
                        0
                    );


                return (
                    total +
                    (
                        Number.isFinite(
                            amount
                        )
                            ? amount
                            : 0
                    )
                );

            },
            0
        );


    const latestStatus =
        normalizeStatus(
            latestOrder?.status
        );


    const initial =
        (
            customer.name
                .charAt(0) ||
            "C"
        )
        .toUpperCase();


    const latestDate =
        formatDate(
            latestOrder?.createdAt
        );


    const customerKey =
        encodeURIComponent(
            customer.key
        );


    return `

        <tr>

            <td>

                <div
                    class="customer-cell"
                >

                    <div
                        class="customer-avatar"
                    >
                        ${escapeHTML(
                            initial
                        )}
                    </div>

                    <div
                        class="customer-name"
                    >

                        <strong>
                            ${escapeHTML(
                                customer.name
                            )}
                        </strong>

                        <small>
                            ${orders.length}
                            ${
                                orders.length === 1
                                    ? "order"
                                    : "orders"
                            }
                        </small>

                    </div>

                </div>

            </td>


            <td>

                <div class="contact">

                    <strong>
                        ${escapeHTML(
                            customer.phone ||
                            "—"
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            customer.email ||
                            "No email"
                        )}
                    </small>

                </div>

            </td>


            <td>

                <span
                    class="order-count"
                >
                    ${orders.length}
                </span>

            </td>


            <td>

                <span
                    class="money"
                >
                    ${formatMoney(
                        totalSpent
                    )}
                </span>

            </td>


            <td>

                <div
                    class="last-order"
                >

                    <strong>
                        ${
                            latestOrder?.model ||
                            latestOrder?.productModel ||
                            "NeonCase"
                        }
                    </strong>

                    <small>
                        ${latestDate}
                    </small>

                </div>

            </td>


            <td>

                <span
                    class="status ${latestStatus}"
                >
                    ${formatStatus(
                        latestStatus
                    )}
                </span>

            </td>


            <td>

                <button
                    class="view-button"
                    type="button"
                    onclick="
                        viewCustomer(
                            '${customerKey}'
                        )
                    "
                >
                    VIEW
                </button>

            </td>

        </tr>

    `;

}


/* =====================================================
   VIEW CUSTOMER
===================================================== */

window.viewCustomer =
    function (
        encodedKey
    ) {

        const key =
            decodeURIComponent(
                encodedKey
            );


        const customer =
            customers.find(
                item =>
                    item.key === key
            );


        if (!customer) {
            return;
        }


        const orders =
            customer.orders;


        const totalSpent =
            orders.reduce(
                (
                    total,
                    order
                ) => {

                    const amount =
                        Number(
                            order.amount ||
                            order.totalAmount ||
                            order.price ||
                            0
                        );


                    return (
                        total +
                        (
                            Number.isFinite(
                                amount
                            )
                                ? amount
                                : 0
                        )
                    );

                },
                0
            );


        const initial =
            (
                customer.name
                    .charAt(0) ||
                "C"
            )
            .toUpperCase();


        document.getElementById(
            "modalAvatar"
        ).textContent =
            initial;


        document.getElementById(
            "modalName"
        ).textContent =
            customer.name;


        document.getElementById(
            "modalEmail"
        ).textContent =
            customer.email ||
            "No email";


        document.getElementById(
            "modalPhone"
        ).textContent =
            customer.phone ||
            "—";


        document.getElementById(
            "modalOrders"
        ).textContent =
            orders.length;


        document.getElementById(
            "modalSpent"
        ).textContent =
            formatMoney(
                totalSpent
            );


        document.getElementById(
            "modalLastOrder"
        ).textContent =
            formatDate(
                orders[0]?.createdAt
            );


        const historyList =
            document.getElementById(
                "historyList"
            );


        historyList.innerHTML =
            orders.map(
                (order) => {

                    const status =
                        normalizeStatus(
                            order.status
                        );


                    return `

                        <div
                            class="history-item"
                        >

                            <div>

                                <strong>
                                    #${
                                        order.orderId ||
                                        order.id
                                    }
                                </strong>

                                <small>
                                    ${
                                        order.model ||
                                        order.productModel ||
                                        "NeonCase"
                                    }

                                    ·

                                    ${
                                        formatDate(
                                            order.createdAt
                                        )
                                    }
                                </small>

                            </div>


                            <div>

                                <strong>
                                    ${formatMoney(
                                        Number(
                                            order.amount ||
                                            order.totalAmount ||
                                            order.price ||
                                            0
                                        )
                                    )}
                                </strong>

                                <span
                                    class="status ${status}"
                                >
                                    ${formatStatus(
                                        status
                                    )}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "customerModal"
        ).classList.add(
            "show"
        );

    };


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    document.getElementById(
        "customerModal"
    ).classList.remove(
        "show"
    );

}


document.getElementById(
    "closeModal"
)?.addEventListener(
    "click",
    closeModal
);


document.getElementById(
    "modalCloseButton"
)?.addEventListener(
    "click",
    closeModal
);


document.getElementById(
    "customerModal"
)?.addEventListener(
    "click",
    (event) => {

        if (
            event.target.id ===
            "customerModal"
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   CONNECTION
===================================================== */

function setConnection(
    connected
) {

    if (
        !connectionDot ||
        !connectionText
    ) {
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
        [
            "approved",
            "processing",
            "shipped",
            "delivered"
        ].includes(value)
    ) {

        return value;

    }


    return "pending";

}


function formatStatus(
    status
) {

    const names = {

        pending:
            "Pending",

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
   DATE
===================================================== */

function formatDate(
    timestamp
) {

    if (!timestamp) {
        return "—";
    }


    let date;


    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        date =
            timestamp.toDate();

    }

    else if (
        timestamp.seconds
    ) {

        date =
            new Date(
                timestamp.seconds *
                1000
            );

    }

    else {

        date =
            new Date(
                timestamp
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   MONEY
===================================================== */

function formatMoney(
    amount
) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );

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


menuButton?.addEventListener(
    "click",
    () => {

        sidebar?.classList.add(
            "open"
        );

        sidebarOverlay?.classList.add(
            "show"
        );

    }
);


sidebarOverlay?.addEventListener(
    "click",
    () => {

        sidebar?.classList.remove(
            "open"
        );

        sidebarOverlay?.classList.remove(
            "show"
        );

    }
);


console.log(
    "NeonCase Customer History loaded."
);
