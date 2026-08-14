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
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            navItems.forEach(
                (nav) => {

                    nav.classList.remove(
                        "active"
                    );

                }
            );


            item.classList.add(
                "active"
            );


            const page =
                item.dataset.page;


            /*
             * Step 2 only.
             *
             * Other pages will be built later.
             */

            if (
                page !== "dashboard"
            ) {

                console.log(
                    `${page} section will be built in the next step.`
                );

            }


            closeSidebar();

        }
    );

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
