/* =========================================================
   NEONCASE — SUCCESS PAGE
========================================================= */


/* GET CHECKOUT DATA */

const savedData =
    sessionStorage.getItem(
        "neoncaseCheckoutData"
    );


if (savedData) {

    try {

        const data =
            JSON.parse(savedData);


        /* MODEL */

        const modelElement =
            document.getElementById(
                "modelName"
            );


        if (
            data.modelName &&
            modelElement
        ) {

            modelElement.textContent =
                data.modelName;

        }


        /* CUSTOMER */

        const customerElement =
            document.getElementById(
                "customerName"
            );


        if (
            data.fullName &&
            customerElement
        ) {

            customerElement.textContent =
                data.fullName;

        }

    }

    catch (error) {

        console.error(
            "Success page data error:",
            error
        );

    }

}



/* GENERATE TEMPORARY ORDER ID */

const orderIdElement =
    document.getElementById(
        "orderId"
    );


const randomNumber =
    Math.floor(
        100000 +
        Math.random() * 900000
    );


if (orderIdElement) {

    orderIdElement.textContent =
        "#NC" + randomNumber;

}
