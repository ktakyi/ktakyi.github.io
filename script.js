"use strict";

const currentYear = document.getElementById("current-year");
const menuButton = document.getElementById("menu-button");
const navigationLinks = document.getElementById("nav-links");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

if (menuButton && navigationLinks) {
    menuButton.addEventListener("click", () => {
        const menuIsOpen = navigationLinks.classList.toggle("open");

        menuButton.setAttribute(
            "aria-expanded",
            String(menuIsOpen)
        );
    });

    navigationLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
}
