document.addEventListener("DOMContentLoaded", function () {

    const body = document.body;
    const pullHandle = document.getElementById("pullHandle");
    const pullCordWrapper = document.getElementById("pullCordWrapper");
    const pullMessage = document.getElementById("pullMessage");

    if (!pullHandle || !pullCordWrapper) {
        console.error(
            "Lamp elements were not found. Check the IDs in login.html."
        );
        return;
    }

    let isDragging = false;
    let startY = 0;
    let currentDistance = 0;

    const maximumPullDistance = 85;
    const activationDistance = 50;


    function turnLampOn() {

        body.classList.add("light-on");

        if (pullMessage) {
            pullMessage.textContent = "Login form is ready";
        }

        setTimeout(function () {

            const nameInput = document.getElementById("name");

            if (nameInput) {
                nameInput.focus();
            }

        }, 700);
    }


    function turnLampOff() {

        body.classList.remove("light-on");

        if (pullMessage) {
            pullMessage.textContent = "Pull the cord";
        }
    }


    function toggleLamp() {

        if (body.classList.contains("light-on")) {
            turnLampOff();
        } else {
            turnLampOn();
        }
    }


    function startPull(event) {

        isDragging = true;
        startY = event.clientY;
        currentDistance = 0;

        pullCordWrapper.classList.remove(
            "release-animation"
        );

        pullCordWrapper.classList.add("pulling");

        try {
            pullHandle.setPointerCapture(event.pointerId);
        } catch (error) {
            console.log("Pointer capture could not be started.");
        }
    }


    function movePull(event) {

        if (!isDragging) {
            return;
        }

        currentDistance = event.clientY - startY;

        currentDistance = Math.max(
            0,
            Math.min(
                currentDistance,
                maximumPullDistance
            )
        );

        const pullScale = currentDistance / 170;

        pullCordWrapper.style.setProperty(
            "--pull-distance",
            `${currentDistance}px`
        );

        pullCordWrapper.style.setProperty(
            "--pull-scale",
            pullScale
        );
    }


    function endPull(event) {

        if (!isDragging) {
            return;
        }

        isDragging = false;

        try {
            pullHandle.releasePointerCapture(event.pointerId);
        } catch (error) {
            console.log("Pointer was already released.");
        }

        pullCordWrapper.classList.remove("pulling");

        pullCordWrapper.style.setProperty(
            "--release-distance",
            `${currentDistance}px`
        );

        pullCordWrapper.classList.add(
            "release-animation"
        );

        if (currentDistance >= activationDistance) {
            toggleLamp();
        }

        currentDistance = 0;

        pullCordWrapper.style.removeProperty(
            "--pull-distance"
        );

        pullCordWrapper.style.removeProperty(
            "--pull-scale"
        );

        setTimeout(function () {

            pullCordWrapper.classList.remove(
                "release-animation"
            );

        }, 650);
    }


    pullHandle.addEventListener(
        "pointerdown",
        startPull
    );

    pullHandle.addEventListener(
        "pointermove",
        movePull
    );

    pullHandle.addEventListener(
        "pointerup",
        endPull
    );

    pullHandle.addEventListener(
        "pointercancel",
        endPull
    );


    pullHandle.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                pullCordWrapper.classList.add(
                    "release-animation"
                );

                toggleLamp();

                setTimeout(function () {

                    pullCordWrapper.classList.remove(
                        "release-animation"
                    );

                }, 650);
            }
        }
    );


    const flashMessage = document.querySelector(
        ".flash-message"
    );

    if (flashMessage) {

        turnLampOn();

    }


    const loginForm = document.getElementById(
        "loginForm"
    );

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                const nameInput =
                    document.getElementById("name");

                const phoneInput =
                    document.getElementById("phone");

                const emailInput =
                    document.getElementById("email");

                const name = nameInput
                    ? nameInput.value.trim()
                    : "";

                const phone = phoneInput
                    ? phoneInput.value.trim()
                    : "";

                const email = emailInput
                    ? emailInput.value.trim()
                    : "";


                if (!name || !phone || !email) {

                    event.preventDefault();

                    showClientMessage(
                        "Please fill in all fields.",
                        "error"
                    );

                    turnLampOn();

                    return;
                }


                const namePattern = /^[A-Za-z ]+$/;

                if (!namePattern.test(name)) {

                    event.preventDefault();

                    showClientMessage(
                        "Name should contain only letters and spaces.",
                        "error"
                    );

                    nameInput.focus();

                    return;
                }


                const phonePattern = /^[0-9]{10}$/;

                if (!phonePattern.test(phone)) {

                    event.preventDefault();

                    showClientMessage(
                        "Phone number must contain exactly 10 digits.",
                        "error"
                    );

                    phoneInput.focus();

                    return;
                }


                const emailPattern =
                    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

                if (!emailPattern.test(email)) {

                    event.preventDefault();

                    showClientMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    emailInput.focus();

                    return;
                }


                const submitButton =
                    loginForm.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerHTML = `
                        <span>Opening dashboard...</span>
                        <i class="fa-solid fa-spinner fa-spin"></i>
                    `;
                }
            }
        );
    }


    function showClientMessage(message, type) {

        let container = document.querySelector(
            ".client-message-container"
        );

        if (!container) {

            container = document.createElement("div");

            container.className =
                "client-message-container";

            const loginHeader =
                document.querySelector(
                    ".login-header"
                );

            if (loginHeader) {

                loginHeader.insertAdjacentElement(
                    "afterend",
                    container
                );

            } else if (loginForm) {

                loginForm.insertAdjacentElement(
                    "beforebegin",
                    container
                );
            }
        }

        const iconClass =
            type === "success"
                ? "fa-circle-check"
                : "fa-circle-exclamation";

        container.innerHTML = `
            <div class="flash-message ${type}">
                <i class="fa-solid ${iconClass}"></i>
                <span>${escapeHtml(message)}</span>
            </div>
        `;
    }


    function escapeHtml(value) {

        const temporaryElement =
            document.createElement("div");

        temporaryElement.textContent = value;

        return temporaryElement.innerHTML;
    }

});