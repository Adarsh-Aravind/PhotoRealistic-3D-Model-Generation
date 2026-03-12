document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject the SVG Overlay if it doesn't already exist in the HTML
    let overlay = document.querySelector('.liquid-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'liquid-overlay';
        overlay.innerHTML = `
            <svg class="liquid-overlay-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path class="liquid-overlay-path" fill="#00ff44" d="M 0 0 L 0 100 Q 50 100 100 100 L 100 0 Z" />
            </svg>
        `;
        document.body.appendChild(overlay);
    }

    const path = overlay.querySelector('.liquid-overlay-path');

    // 2. Play Inbound Animation (Reveal Page)
    // The path starts covering the screen. We animate the *bottom* up to reveal.
    if (typeof gsap !== 'undefined') {
        gsap.to(path, {
            duration: 0.4,
            attr: { d: "M 0 0 L 0 50 Q 50 0 100 50 L 100 0 Z" },
            ease: "power2.in",
            onComplete: () => {
                gsap.to(path, {
                    duration: 0.4,
                    attr: { d: "M 0 0 L 0 0 Q 50 0 100 0 L 100 0 Z" },
                    ease: "power2.out",
                    onComplete: () => {
                        overlay.style.pointerEvents = 'none'; // allow clicks once revealed
                    }
                });
            }
        });
    } else {
        overlay.style.pointerEvents = 'none';
        path.setAttribute("d", "M 0 0 L 0 0 Q 50 0 100 0 L 100 0 Z");
    }

    // 3. Intercept Links for Outbound Animation
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // If it's a valid internal navigation string that doesn't trigger a new tab or anchor
            if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#') && link.target !== '_blank') {
                e.preventDefault();

                overlay.style.pointerEvents = 'all'; // block clicks

                if (typeof gsap !== 'undefined') {
                    // Reset path for upward sweep, anchored at the bottom
                    gsap.set(path, { attr: { d: "M 0 100 L 0 100 Q 50 100 100 100 L 100 100 Z" } });

                    // Animate to cover the screen
                    gsap.to(path, {
                        duration: 0.4,
                        attr: { d: "M 0 100 L 0 50 Q 50 0 100 50 L 100 100 Z" },
                        ease: "power2.in",
                        onComplete: () => {
                            gsap.to(path, {
                                duration: 0.4,
                                attr: { d: "M 0 100 L 0 0 Q 50 0 100 0 L 100 100 Z" },
                                ease: "power2.out",
                                onComplete: () => {
                                    window.location.href = href;
                                }
                            });
                        }
                    });
                } else {
                    window.location.href = href;
                }
            }
        });
    });
});
