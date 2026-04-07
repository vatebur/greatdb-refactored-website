function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (target - start) * progress;

        element.textContent = Math.floor(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// Initialize counters when in viewport
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseFloat(entry.target.dataset.target);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(counter => {
    counterObserver.observe(counter);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        // Validate href to prevent XSS via querySelector
        if (href && /^#[\w-]+$/.test(href)) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Parallax effect for hero visual
const PARALLAX_MULTIPLIER = 20;
const PARALLAX_EASING = 0.05;
const PARALLAX_ROTATION = 2;

let mouseX = 0;
let mouseY = 0;
let cubeX = 0;
let cubeY = 0;
const cube = document.querySelector('.data-cube');

function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}

const handleMouseMove = throttle((e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, 16);

document.addEventListener('mousemove', handleMouseMove);

function animateCube() {
    if (document.hidden || !cube) {
        requestAnimationFrame(animateCube);
        return;
    }

    cubeX += (mouseX * PARALLAX_MULTIPLIER - cubeX) * PARALLAX_EASING;
    cubeY += (mouseY * PARALLAX_MULTIPLIER - cubeY) * PARALLAX_EASING;

    cube.style.transform = `translate(${cubeX}px, ${cubeY}px) rotateX(${cubeY * PARALLAX_ROTATION}deg) rotateY(${cubeX * PARALLAX_ROTATION}deg)`;

    requestAnimationFrame(animateCube);
}

if (cube) {
    animateCube();
}

// Card hover effects with 3D tilt
const TILT_DIVISOR = 10;
const TILT_PERSPECTIVE = 1000;
const TILT_LIFT = -8;

const cardContainer = document.querySelector('.products-grid, .cases-grid');
if (cardContainer) {
    cardContainer.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.product-card, .case-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / TILT_DIVISOR;
        const rotateY = (centerX - x) / TILT_DIVISOR;

        card.style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${TILT_LIFT}px)`;
    });

    cardContainer.addEventListener('mouseleave', (e) => {
        const card = e.target.closest('.product-card, .case-card');
        if (card) {
            card.style.transform = '';
        }
    });
}

// Intersection Observer for fade-in animations
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Apply fade-in to sections
document.querySelectorAll('.product-card, .case-card, .news-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    fadeObserver.observe(el);
});

// Data stream animation in hero
const STREAM_INTERVAL = 200;
const STREAM_CLEANUP_DELAY = 5000;
let streamIntervalId = null;

function createDataStream() {
    const container = document.querySelector('.data-streams');
    if (!container) return;

    const stream = document.createElement('div');
    stream.className = 'data-stream';
    stream.style.cssText = `
        position: absolute;
        width: 2px;
        height: 100px;
        background: linear-gradient(to bottom, transparent, var(--color-primary), transparent);
        left: ${Math.random() * 100}%;
        top: -100px;
        animation: streamFall ${3 + Math.random() * 2}s linear;
        opacity: ${0.3 + Math.random() * 0.4};
    `;

    container.appendChild(stream);

    setTimeout(() => {
        stream.remove();
    }, STREAM_CLEANUP_DELAY);
}

// Only create streams when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !streamIntervalId) {
            streamIntervalId = setInterval(createDataStream, STREAM_INTERVAL);
        } else if (!entry.isIntersecting && streamIntervalId) {
            clearInterval(streamIntervalId);
            streamIntervalId = null;
        }
    });
});

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// Navbar scroll effect
const SCROLL_THRESHOLD = 100;
const nav = document.querySelector('.nav');

const handleScroll = throttle(() => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > SCROLL_THRESHOLD) {
        nav.style.background = 'rgba(10, 14, 20, 0.95)';
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.background = 'rgba(10, 14, 20, 0.8)';
        nav.style.boxShadow = 'none';
    }
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

// Glitch effect on hover for titles
document.querySelectorAll('.hero-title, .section-title').forEach(title => {
    title.addEventListener('mouseenter', function() {
        this.style.animation = 'glitch 0.3s ease-in-out';
    });

    title.addEventListener('animationend', function() {
        this.style.animation = '';
    });
});

// Add glitch keyframes
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
`;
document.head.appendChild(glitchStyle);

// Typing effect for hero label
const TYPING_DELAY = 50;
const TYPING_START_DELAY = 500;

const heroLabel = document.querySelector('.hero-label span:last-child');
if (heroLabel) {
    const text = heroLabel.textContent;
    heroLabel.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            heroLabel.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, TYPING_DELAY);
        }
    }

    setTimeout(typeWriter, TYPING_START_DELAY);
}

// Add particle effect on card hover
const MAX_PARTICLES = 3;
const PARTICLE_SIZE = 4;
const PARTICLE_FADE_RATE = 0.02;

document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        for (let i = 0; i < MAX_PARTICLES; i++) {
            createParticle(e.clientX, e.clientY);
        }
    });
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: ${PARTICLE_SIZE}px;
        height: ${PARTICLE_SIZE}px;
        background: var(--color-primary);
        border-radius: 50%;
        pointer-events: none;
        left: ${x}px;
        top: ${y}px;
        z-index: 9999;
    `;

    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let posX = 0;
    let posY = 0;
    let opacity = 1;

    function animate() {
        posX += vx;
        posY += vy;
        opacity -= PARTICLE_FADE_RATE;

        particle.style.transform = `translate(${posX}px, ${posY}px)`;
        particle.style.opacity = opacity;

        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    }

    animate();
}

// Console easter egg (disable in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%c[GreatDB]', 'color: #00ffff; font-size: 20px; font-weight: bold;');
    console.log('%c新一代分布式数据库系统', 'color: #ff00ff; font-size: 14px;');
    console.log('%c想加入我们？发送简历至 hr@greatdb.com', 'color: #8b949e; font-size: 12px;');
}

// Performance optimization: Reduce animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.body.classList.add('reduced-motion');
    const reducedStyle = document.createElement('style');
    reducedStyle.textContent = `
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
        }
    `;
    document.head.appendChild(reducedStyle);
}

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%c✓ Website initialized', 'color: #00ff88; font-weight: bold;');
}

// Theme toggle
(function() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            btn.textContent = next === 'light' ? '🌙' : '☀️';
        });
    });
})();
