document.addEventListener('DOMContentLoaded', () => {

    function initCustomJS() {
        // --- TEXT SPLITTING & HERO REVEAL ---
        const words = document.querySelectorAll('.hero-brutal h1 .word');
        const allChars = []; // Keep track of all spanned chars for GSAP

        words.forEach(word => {
            if (word.querySelector('.char')) return; // Avoid double splitting

            const text = word.innerText;
            word.innerHTML = '';

            // We use standard chars but add a data-char attribute so we know what they SHOULD be
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.classList.add('char');
                span.innerText = char;
                span.dataset.char = char; // Store original
                span.style.opacity = 0; // Hide initially for animation
                word.appendChild(span);
                allChars.push(span);
            });
        });

        // Hero Glitch Reveal Animation using GSAP
        if (allChars.length > 0) {
            const lettersAndSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', ';', ':', '<', '>', ','];

            gsap.to(allChars, {
                duration: 1.5,
                opacity: 1,
                stagger: 0.1, // Reveal one by one
                ease: 'power4.inOut',
                onUpdate() {
                    // During the tween, rapidly cycle text for the "glitch" effect
                    allChars.forEach(char => {
                        // Only glitch if the character is currently animating its opacity
                        if (gsap.getProperty(char, "opacity") > 0 && gsap.getProperty(char, "opacity") < 1) {
                            char.innerText = lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)].toUpperCase();
                        } else if (gsap.getProperty(char, "opacity") === 1) {
                            // Snap back to original when fully opaque
                            char.innerText = char.dataset.char;
                        }
                    });
                }
            });
        }

        // --- MAGNET & CURSOR ---
        const cursor = document.getElementById('cursor');
        const magneticElements = document.querySelectorAll('.magnetic, .btn, a'); // Globals for magnet effect

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function animateCursor() {
            if (cursor) {
                cursorX = lerp(cursorX, mouseX, 0.15);
                cursorY = lerp(cursorY, mouseY, 0.15);
                cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        if (magneticElements.length > 0 && cursor) {
            magneticElements.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const dist = 0.5; // Magnetic strength

                    const moveX = (e.clientX - centerX) * dist;
                    const moveY = (e.clientY - centerY) * dist;

                    el.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    cursor.classList.add('magnet');
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'translate(0, 0)';
                    cursor.classList.remove('magnet');
                });
            });
        }

        // --- NAVBAR STATE & 3D TILT ---
        const nav = document.querySelector('.brutal-nav');
        let isScrolled = false;

        window.addEventListener('scroll', () => {
            if (nav) {
                if (window.scrollY > 50) {
                    if (!isScrolled) {
                        nav.classList.add('scrolled');
                        isScrolled = true;
                    }
                } else {
                    if (isScrolled) {
                        nav.classList.remove('scrolled');
                        nav.style.transform = '';
                        isScrolled = false;
                    }
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isScrolled || !nav) return;
            const cx = window.innerWidth / 2;
            const cy = 100; // Pivot near top

            // Subtle tilt
            const rx = (e.clientY - cy) * 0.02;
            const ry = (e.clientX - cx) * 0.02;

            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

            nav.style.transform = `translateX(-50%) perspective(1000px) rotateX(${-clamp(rx, -10, 10)}deg) rotateY(${clamp(ry, -10, 10)}deg)`;
        });

        // --- SCROLL VELOCITY SKEW ---
        const content = document.getElementById('scroll-content');
        if (content) {
            let skew = 0;
            let lastScrollTop = 0;

            function scrollLoop() {
                // Check if element still in DOM (Swup unmount protection)
                if (!document.body.contains(content)) return;

                const scrollTop = window.scrollY;
                const velocity = scrollTop - lastScrollTop;
                lastScrollTop = scrollTop;

                const maxSkew = 5.0;
                const speed = Math.min(Math.max(velocity * 0.1, -maxSkew), maxSkew);

                skew = lerp(skew, speed, 0.1);

                if (Math.abs(skew) > 0.01) {
                    content.style.transform = `skewY(${skew}deg)`;
                } else {
                    content.style.transform = `skewY(0deg)`;
                }
                requestAnimationFrame(scrollLoop);
            }
            scrollLoop();
        }

        // --- HACKER TEXT RE-INIT ---
        const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        document.querySelectorAll('[data-text]').forEach(link => {
            // Prevent stacking listeners
            link.removeEventListener('mouseenter', link._hackerEnter);
            link.removeEventListener('mouseleave', link._hackerLeave);

            link._hackerEnter = event => {
                let iter = 0;
                const original = event.target.dataset.text;
                clearInterval(event.target.interval);

                event.target.interval = setInterval(() => {
                    event.target.innerText = original.split("")
                        .map((l, i) => {
                            if (i < iter) return original[i];
                            return alpha[Math.floor(Math.random() * 26)]
                        })
                        .join("");

                    if (iter >= original.length) clearInterval(event.target.interval);
                    iter += 1 / 3;
                }, 30);
            };

            link._hackerLeave = e => {
                clearInterval(e.target.interval);
                e.target.innerText = e.target.dataset.text;
            };

            link.addEventListener('mouseenter', link._hackerEnter);
            link.addEventListener('mouseleave', link._hackerLeave);
        });

        // Retain GSAP legacy checks if any remain
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            // Kill old triggers mapped to previous DOM
            ScrollTrigger.getAll().forEach(t => t.kill());

            const revealElements = document.querySelectorAll('.gs-reveal');
            revealElements.forEach((elem) => {
                gsap.fromTo(elem,
                    { y: 50, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 1, ease: "power3.out",
                        scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" }
                    }
                );
            });
        }

    } // end initCustomJS

    // --- GLOBAL TOAST SYSTEM ---
    window.showToast = function (message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let icon = '';
        if (type === 'success') icon = '✓';
        else if (type === 'error') icon = '⚠';
        else icon = 'ℹ';

        toast.innerHTML = `<span style="margin-right:8px; font-weight:bold">${icon}</span> ${message}`;
        container.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 6000);
    };

    // Execute once initially
    initCustomJS();



});
