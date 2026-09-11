document.addEventListener('DOMContentLoaded', () => {

    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // 1. CUSTOM CURSOR (DOT & RING) - Only for fine pointer devices (Mouse/Trackpad)
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = -100;
    let mouseY = -100;

    if (isFinePointer && cursorDot && cursorRing) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;

            cursorRing.animate({
                left: `${mouseX}px`,
                top: `${mouseY}px`
            }, { duration: 150, fill: "forwards" });
        });

        // Hover effect on clickable elements
        const clickables = document.querySelectorAll('a, button, .interactive-card, .nav-dot, .mobile-nav-item, .clean-btn');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.style.width = '48px';
                cursorRing.style.height = '48px';
                cursorRing.style.borderColor = 'var(--text-main)';
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.style.width = '34px';
                cursorRing.style.height = '34px';
                cursorRing.style.borderColor = 'var(--accent-secondary)';
            });
        });
    }

    // 2. CONSTELLATION NETWORK BACKGROUND (BATTERY-FRIENDLY & RESPONSIVE)
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];
        
        // Debounced resize handler - prevents jitter when mobile address bar hides/shows
        let lastWidth = window.innerWidth;
        let lastHeight = window.innerHeight;
        let resizeTimer = null;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                
                // Only re-init if significant dimension change (e.g. orientation change or window resize)
                if (Math.abs(currentWidth - lastWidth) > 50 || Math.abs(currentHeight - lastHeight) > 120) {
                    lastWidth = width = canvas.width = currentWidth;
                    lastHeight = height = canvas.height = currentHeight;
                    initParticles();
                } else {
                    width = canvas.width = currentWidth;
                    height = canvas.height = currentHeight;
                }
            }, 200);
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.4 + 0.6;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const isSmallScreen = width < 768;
            // Balance particle density for fast rendering on mobile GPUs
            const divisor = isSmallScreen ? 16000 : 7000;
            const maxParticles = isSmallScreen ? 32 : 75;
            const count = Math.min(Math.floor((width * height) / divisor), maxParticles);

            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            
            const maxDistance = width < 768 ? 95 : 120;
            const particleCount = particles.length;

            for (let i = 0; i < particleCount; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connecting lines between particles
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 * (1 - distance / maxDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse pointer if active (desktop only)
                if (isFinePointer && mouseX > 0 && mouseY > 0) {
                    const dx = particles[i].x - mouseX;
                    const dy = particles[i].y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(189, 0, 255, ${0.35 * (1 - distance / 130)})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    // 3. NAVIGATION & ACTIVE SECTION OBSERVER (CROSS-PLATFORM & RELIABLE)
    const sections = document.querySelectorAll('.snap-section');
    const navDots = document.querySelectorAll('.nav-dot');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const progressText = document.getElementById('scroll-progress');
    const totalSections = sections.length;

    function updateActiveState(targetId, index) {
        // Update top counter indicator (e.g. 01 / 05)
        if (progressText && index >= 0) {
            const currentNumber = String(index + 1).padStart(2, '0');
            const totalNumber = String(totalSections).padStart(2, '0');
            progressText.innerText = `${currentNumber} / ${totalNumber}`;
        }

        // Update Desktop side nav dots
        navDots.forEach(dot => {
            if (dot.getAttribute('data-target') === targetId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update Mobile bottom nav dock items
        mobileNavItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Modern IntersectionObserver for bulletproof active section detection on all devices
    const snapContainer = document.getElementById('snap-container');
    const observerOptions = {
        root: window.innerWidth > 820 ? snapContainer : null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                const index = Array.from(sections).indexOf(entry.target);
                updateActiveState(targetId, index);
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // Smooth scroll navigation click handler
    function setupNavClick(elements) {
        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = elem.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    // Instant feedback
                    const index = Array.from(sections).indexOf(targetSection);
                    updateActiveState(targetId, index);
                }
            });
        });
    }

    setupNavClick(navDots);
    setupNavClick(mobileNavItems);

    // Smooth scroll for logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
                updateActiveState('hero', 0);
            }
        });
    }

});
