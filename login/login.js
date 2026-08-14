/* =========================================================
   NEONCASE LOGIN
========================================================= */

const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


googleLogin.addEventListener("click", function () {

    loginMessage.textContent =
        "Google login will be connected after Firebase is configured.";

});
