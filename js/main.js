import { updateCartBadge } from "./cart.js";
import { getSession } from "./auth.js";
import { initLocationControls } from "./location.js";

/* =========================================
   FIXKART MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================
       ANIMATION ENGINE (optional, from CDN)
    ========================================= */

    let animate = null;
    let onScroll = null;
    let stagger = null;

    try {
        const anime = await import(
            "https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm"
        );
        animate = anime.animate;
        onScroll = anime.onScroll;
        stagger = anime.stagger;
    } catch (error) {
        console.warn(
            "[FixKart] AnimeJS could not be loaded from CDN - animations disabled.",
            error
        );
    }

    const animateIf = (targets, params) => {
        if (animate && targets && targets.length !== 0) {
            animate(targets, params);
        }
    };


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
       CART BADGE
    ========================================= */

    updateCartBadge();


    /* =========================================
       AUTH-AWARE HEADER
    ========================================= */

    const session = getSession();
    const user = session?.user;
    const profileLink = document.querySelector(
        'a[aria-label="Profile"], a[title="Profile"]'
    );

    if (user && profileLink) {
        const initial = user.email?.charAt(0).toUpperCase() || "U";
        profileLink.textContent = initial;
        profileLink.title = user.email || "Profile";
    }


    /* =========================================
       HERO ANIMATION
    ========================================= */

    const heroContent =
        document.querySelector(".hero-content");

    if (heroContent) {

        animateIf(heroContent, {
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

        animateIf(statCards, {
            opacity: [0, 1],
            y: [40, 0],
            delay: stagger ? stagger(150) : 0,
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

        animateIf(circularBadge, {
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

        animateIf(element, {

            opacity: [0, 1],

            y: [60, 0],

            duration: 800,

            ease: "out(4)",

            autoplay: onScroll ? onScroll({
                target: element,
                enter: "bottom top",
                leave: "top bottom"
            }) : true

        });

    });


    /* =========================================
       PRODUCT CARDS
    ========================================= */

    const productCards =
        document.querySelectorAll(".product-card");

    productCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            animateIf(card, {
                y: -8,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animateIf(card, {
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

            animateIf(card, {
                y: -8,
                scale: 1.02,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animateIf(card, {
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

            animateIf(card, {
                y: -8,
                duration: 300,
                ease: "out(3)"
            });

        });

        card.addEventListener("mouseleave", () => {

            animateIf(card, {
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

        animateIf(rotatingText, {

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

        animateIf(item, {

            opacity: [0, 1],

            x: [-40, 0],

            duration: 700,

            delay: index * 120,

            ease: "out(4)",

            autoplay: onScroll ? onScroll({
                target: item,
                enter: "bottom top",
                leave: "top bottom"
            }) : true

        });

    });


    /* =========================================
       HOW IT WORKS
    ========================================= */

    const steps =
        document.querySelectorAll(".step-card");

    steps.forEach((step, index) => {

        animateIf(step, {

            opacity: [0, 1],

            y: [50, 0],

            duration: 700,

            delay: index * 150,

            ease: "out(4)",

            autoplay: onScroll ? onScroll({
                target: step,
                enter: "bottom top",
                leave: "top bottom"
            }) : true

        });

    });


    /* =========================================
       CTA ANIMATION
    ========================================= */

    const ctaBand =
        document.querySelector(".cta-band");

    if (ctaBand) {

        animateIf(ctaBand, {

            opacity: [0, 1],

            scale: [0.95, 1],

            duration: 900,

            ease: "out(4)",

            autoplay: onScroll ? onScroll({
                target: ctaBand,
                enter: "bottom top",
                leave: "top bottom"
            }) : true

        });

    }


    /* =========================================
       LOCATION DETECTION (Google Maps Platform)
    =========================================
       Uses the Google Maps Geocoding + Places APIs when a key is configured
       in js/config.js, otherwise falls back to browser geolocation (lat/lng).
    ========================================= */

    initLocationControls();

});
