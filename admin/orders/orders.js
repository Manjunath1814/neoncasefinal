/* =====================================================
   NEONCASE ADMIN — ORDERS
===================================================== */


/* =====================================================
   DEMO ORDERS
   FIRESTORE WILL BE CONNECTED AFTER UI IS APPROVED
===================================================== */

const orders = [

    {
        id: "NC1024",
        customer: "Rahul Kumar",
        phone: "+91 98765 43210",
        model: "iPhone 16 Pro",
        date: "14 Aug 2026",
        amount: 699,
        status: "pending",
        initial: "R"
    },

    {
        id: "NC1023",
        customer: "Arjun Kumar",
        phone: "+91 91234 56789",
        model: "iPhone 15",
        date: "13 Aug 2026",
        amount: 699,
        status: "approved",
        initial: "A"
    },

    {
        id: "NC1022",
        customer: "Ravi",
        phone: "+91 99887 77665",
        model: "iPhone 17 Pro Max",
        date: "12 Aug 2026",
        amount: 699,
        status: "processing",
        initial: "R"
    },

    {
        id: "NC1021",
        customer: "Sandeep",
        phone: "+91 90000 11223",
        model: "iPhone 14",
        date: "10 Aug 2026",
        amount: 699,
        status: "delivered",
        initial: "S"
    }

];


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
   SEARCH
===================================================== */

const orderSearch =
    document.getElementById(
        "orderSearch"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


function filterOrders() {

    const search =
        orderSearch.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filtered =
        orders.filter(
            (order) => {

                const matchesSearch =

                    order.id
                        .toLowerCase()
                        .includes(search)

                    ||

                    order.customer
                        .toLowerCase()
                        .includes(search)

                    ||

                    order.phone
                        .toLowerCase()
                        .includes(search)

                    ||

                    order.model
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =

                    selectedStatus === "all"

                    ||

                    order.status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    document.getElementById(
        "visibleOrders"
    ).textContent =
        filtered.length;


    renderOrders(
        filtered
    );

}


orderSearch?.addEventListener(
    "input",
    filterOrders
);


statusFilter?.addEventListener(
    "change",
    filterOrders
);


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(
    list
) {

    const table =
        document.getElementById(
            "ordersTable"
        );


    if (!table) {
        return;
    }


    if (!list.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-row"
                >

                    No orders found.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        list.map(
            (order) => `

                <tr>

                    <td>

                        <strong
                            class="order-number"
                        >
                            #${order.id}
                        </strong>

                    </td>


                    <td>

                        <div
                            class="customer-cell"
                        >

                            <div
                                class="customer-avatar"
                            >
                                ${order.initial}
                            </div>

                            <div>

                                <strong>
                                    ${order.customer}
                                </strong>

                                <small>
                                    ${order.phone}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>

                        <strong>
                            ${order.model}
                        </strong>

                        <small
                            class="muted"
                        >
                            NeonCase
                        </small>

                    </td>


                    <td>
                        ${order.date}
                    </td>


                    <td>

                        <strong>
                            ₹${order.amount}
                        </strong>

                    </td>


                    <td>

                        <span
                            class="status ${order.status}"
                        >
                            ${formatStatus(
                                order.status
                            )}
                        </span>

                    </td>


                    <td>

                        <button
                            class="view-button"
                            onclick="
                                viewOrder('${order.id}')
                            "
                        >
                            VIEW
                        </button>

                    </td>

                </tr>

            `
        )
        .join("");

}


/* =====================================================
   STATUS TEXT
===================================================== */

function formatStatus(
    status
) {

    const names = {

        pending: "Pending",

        approved: "Approved",

        processing: "Processing",

        shipped: "Shipped",

        delivered: "Delivered"

    };


    return (
        names[status] ||
        status
    );

}


/* =====================================================
   VIEW ORDER
===================================================== */

function viewOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) {
        return;
    }


    document.getElementById(
        "modalOrderNumber"
    ).textContent =
        `#${order.id}`;


    document.getElementById(
        "modalModel"
    ).textContent =
        order.model;


    document.getElementById(
        "modalCustomer"
    ).textContent =
        order.customer;


    document.getElementById(
        "modalPhone"
    ).textContent =
        order.phone;


    const status =
        document.getElementById(
            "modalStatus"
        );


    status.textContent =
        formatStatus(
            order.status
        );


    status.className =
        `status ${order.status}`;


    const approveButton =
        document.getElementById(
            "approveButton"
        );


    if (
        order.status ===
        "pending"
    ) {

        approveButton.style.display =
            "block";

        approveButton.textContent =
            "APPROVE ORDER";

        approveButton.onclick =
            () => approveOrder(
                order.id
            );

    }

    else {

        approveButton.style.display =
            "none";

    }


    document.getElementById(
        "orderModal"
    ).classList.add(
        "show"
    );

}


/* =====================================================
   APPROVE ORDER
===================================================== */

function approveOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) {
        return;
    }


    order.status =
        "approved";


    document.getElementById(
        "orderModal"
    ).classList.remove(
        "show"
    );


    renderOrders(
        orders
    );


    updateCounts();


    console.log(
        `Order ${orderId} approved.`
    );

}


/* =====================================================
   UPDATE COUNTS
===================================================== */

function updateCounts() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.status ===
                "pending"
        ).length;


    const processing =
        orders.filter(
            order =>
                order.status ===
                "processing"
        ).length;


    const delivered =
        orders.filter(
            order =>
                order.status ===
                "delivered"
        ).length;


    document.getElementById(
        "totalCount"
    ).textContent =
        total;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;


    document.getElementById(
        "processingCount"
    ).textContent =
        processing;


    document.getElementById(
        "deliveredCount"
    ).textContent =
        delivered;

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeOrderModal() {

    document.getElementById(
        "orderModal"
    ).classList.remove(
        "show"
    );

}


document.getElementById(
    "closeModal"
)?.addEventListener(
    "click",
    closeOrderModal
);


document.getElementById(
    "modalCloseButton"
)?.addEventListener(
    "click",
    closeOrderModal
);


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

document.getElementById(
    "orderModal"
)?.addEventListener(
    "click",
    (event) => {

        if (
            event.target.id ===
            "orderModal"
        ) {

            closeOrderModal();

        }

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

updateCounts();

console.log(
    "NeonCase Orders page loaded."
);
