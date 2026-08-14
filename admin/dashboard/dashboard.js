/* =====================================================
   NEONCASE ADMIN DASHBOARD
===================================================== */


/* =====================================================
   CURRENT DATE
===================================================== */

const currentDate =
    document.getElementById("currentDate");


if (currentDate) {

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


function openSidebar() {

    if (sidebar) {

        sidebar.classList.add("open");

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.add("show");

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove("open");

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove("show");

    }

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


/* =====================================================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
===================================================== */

document
    .querySelectorAll(".nav-item")
    .forEach((item) => {

        item.addEventListener(
            "click",
            closeSidebar
        );

    });


/* =====================================================
   DEMO DASHBOARD DATA
   FIREBASE WILL BE CONNECTED LATER
===================================================== */

const dashboardData = {

    totalOrders: 24,

    pendingOrders: 6,

    processingOrders: 8,

    deliveredOrders: 10

};


function updateDashboard() {

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

}


updateDashboard();


/* =====================================================
   DASHBOARD READY
===================================================== */

console.log(
    "NeonCase Admin Dashboard loaded."
);
