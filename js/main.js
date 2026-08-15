import {
    animate,
    onScroll,
    stagger
} from "https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm";


/* =========================================
   FIXKART MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       MOBILE NAVIGATION
    ========================================= */

    const navToggle = document.querySelector(".nav-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (navToggle && mainNav) {

        navToggle.addEventListener("click", () => {

            const isOpen =
                navToggle.getAttribute("aria-expanded") === "true";

            navToggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            mainNav.classList.toggle("nav-open");

        });

    }


    /* =========================================
       HERO ANIMATION
    ========================================= */

    const heroContent =
        document.querySelector(".hero-content");

    if (heroContent) {

        animate(heroContent, {
            opacity: [0, 1],
            x: [-60, 0],
            duration: 900,
            ease: "out(4)"
        });

    }


    /* =========================================
       HERO STAT CARDS
    ========================================= */

    const statCards =
        document.querySelectorAll(".hero-stat-card");

    if (statCards.length) {

        animate(statCards, {
            opacity: [0, 1],
            y: [40, 0],
            delay: stagger(150),
            duration: 800,
            ease: "out(4)"
        });

    }


    /* =========================================
       CIRCULAR BADGE
    ========================================= */

    const circularBadge =
        document.querySelector(".circular-badge");

    if (circularBadge) {

        animate(circularBadge, {
            rotate: "1turn",
            duration: 12000,
            loop: true,
            ease: "linear"
        });

    }


    /* =========================================
       SCROLL ANIMATIONS
    ========================================= */

    const scrollElements = document.querySelectorAll(
        ".category-tile, " +
        ".product-card, " +
        ".service-card, " +
        ".pro-card, " +
        ".trust-item, " +
        ".step-card"
    );


    scrollElements.forEach((element) => {

        animate(element, {

            opacity: [0, 1],

            y: [60, 0],

            duration: 800,

            ease: "out(4)",

            autoplay: onScroll({
                target: element,
                enter: "bottom top",
                leave: "top bottom"
            })

        });

    });


    /* =========================================
       PRODUCT CARDS
    ========================================= */

    const productCards =
        document.querySelectorAll(".product-card");

    productCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            animate(card, {
                y: -8,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animate(card, {
                y: 0,
                duration: 300,
                ease: "out(3)"
            });

        });

    });


    /* =========================================
       SERVICE CARDS
    ========================================= */

    const serviceCards =
        document.querySelectorAll(".service-card");

    serviceCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            animate(card, {
                y: -8,
                scale: 1.02,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animate(card, {
                y: 0,
                scale: 1,
                duration: 300,
                ease: "out(3)"
            });

        });

    });


    /* =========================================
       PROFESSIONAL CARDS
    ========================================= */

    const professionalCards =
        document.querySelectorAll(".pro-card");

    professionalCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            animate(card, {
                y: -8,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animate(card, {
                y: 0,
                duration: 300,
                ease: "out(3)"
            });

        });

    });


    /* =========================================
       ROTATING HERO TEXT
    ========================================= */

    const rotatingText =
        document.querySelector(".rotating-text");

    if (rotatingText) {

        animate(rotatingText, {

            opacity: [0, 1],

            scale: [0.8, 1],

            duration: 700,

            ease: "out(4)"

        });

    }


    /* =========================================
       TRUST ITEMS
    ========================================= */

    const trustItems =
        document.querySelectorAll(".trust-item");

    trustItems.forEach((item, index) => {

        animate(item, {

            opacity: [0, 1],

            x: [-40, 0],

            duration: 700,

            delay: index * 120,

            ease: "out(4)",

            autoplay: onScroll({
                target: item,
                enter: "bottom top",
                leave: "top bottom"
            })

        });

    });


    /* =========================================
       HOW IT WORKS
    ========================================= */

    const steps =
        document.querySelectorAll(".step-card");

    steps.forEach((step, index) => {

        animate(step, {

            opacity: [0, 1],

            y: [50, 0],

            duration: 700,

            delay: index * 150,

            ease: "out(4)",

            autoplay: onScroll({
                target: step,
                enter: "bottom top",
                leave: "top bottom"
            })

        });

    });


    /* =========================================
       CTA ANIMATION
    ========================================= */

    const ctaBand =
        document.querySelector(".cta-band");

    if (ctaBand) {

        animate(ctaBand, {

            opacity: [0, 1],

            scale: [0.95, 1],

            duration: 900,

            ease: "out(4)",

            autoplay: onScroll({
                target: ctaBand,
                enter: "bottom top",
                leave: "top bottom"
            })

        });

    }


    /* =========================================
       LOCATION DETECTION
    ========================================= */

    const detectLocation =
        document.getElementById("detect-location");

    const locationInput =
        document.getElementById("location-input");

    if (detectLocation && locationInput) {

        detectLocation.addEventListener("click", () => {

            if (!navigator.geolocation) {

                locationInput.value =
                    "Location not supported";

                return;

            }

            locationInput.value =
                "Detecting location...";

            navigator.geolocation.getCurrentPosition(

                (position) => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;

                    locationInput.value =
                        `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

                },

                () => {

                    locationInput.value =
                        "Unable to detect location";

                }

            );

        });

    }

});