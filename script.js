/* ===== VOYAGE — Scroll Animation Engine ===== */

gsap.registerPlugin(ScrollTrigger);

// ===== STAR FIELD GENERATION =====
function generateStars(layerId, count, sizeRange) {
    const layer = document.getElementById(layerId);
    const shadows = [];
    const w = window.innerWidth;
    const h = window.innerHeight * 4;

    for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
        const opacity = Math.random() * 0.6 + 0.3;
        shadows.push(`${x}px ${y}px ${size}px rgba(255,255,255,${opacity})`);
    }

    layer.style.width = '1px';
    layer.style.height = '1px';
    layer.style.boxShadow = shadows.join(',');
}

generateStars('stars-back', 500, [0.5, 1]);
generateStars('stars-mid', 250, [1, 2]);
generateStars('stars-front', 100, [1.5, 3]);

// ===== STAR PARALLAX ON SCROLL =====
gsap.to('#stars-back', {
    y: -300,
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.5 }
});
gsap.to('#stars-mid', {
    y: -600,
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.5 }
});
gsap.to('#stars-front', {
    y: -1000,
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.5 }
});

// ===== SCROLL PROGRESS BAR =====
window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
});

// ===== DISTANCE TRACKER =====
const distanceMilestones = [
    { trigger: '#hero', distance: 0, unit: 'km' },
    { trigger: '#moon-section', distance: 384400, unit: 'km' },
    { trigger: '#mars-section', distance: 225000000, unit: 'km' },
    { trigger: '#asteroid-belt', distance: 478000000, unit: 'km' },
    { trigger: '#jupiter-section', distance: 778000000, unit: 'km' },
    { trigger: '#saturn-section', distance: 1400000000, unit: 'km' },
    { trigger: '#deep-space', distance: 4500000000, unit: 'km' },
    { trigger: '#nebula-section', distance: 1344, unit: 'light-years' },
    { trigger: '#edge-section', distance: 93000000000, unit: 'light-years' },
];

const trackerEl = document.getElementById('tracker-distance');

distanceMilestones.forEach(m => {
    ScrollTrigger.create({
        trigger: m.trigger,
        start: 'top 60%',
        onEnter: () => {
            trackerEl.textContent = m.distance.toLocaleString() + ' ' + m.unit;
        },
        onEnterBack: () => {
            trackerEl.textContent = m.distance.toLocaleString() + ' ' + m.unit;
        }
    });
});

// ===== SHOOTING STARS =====
function spawnShootingStar() {
    const star = document.createElement('div');
    star.classList.add('shooting-star');
    star.style.top = Math.random() * 40 + '%';
    star.style.left = Math.random() * 70 + '%';
    const len = Math.random() * 80 + 60;
    star.style.setProperty('--star-len', len + 'px');
    star.style.width = len + 'px';
    document.getElementById('shooting-stars').appendChild(star);
    setTimeout(() => star.remove(), 1000);
}

setInterval(() => {
    if (Math.random() > 0.4) spawnShootingStar();
}, 4000);
setTimeout(spawnShootingStar, 2000);

// ===== ASTEROID BELT PARTICLES =====
(function createAsteroids() {
    const container = document.getElementById('asteroid-particles');
    for (let i = 0; i < 40; i++) {
        const rock = document.createElement('div');
        rock.classList.add('asteroid');
        const size = Math.random() * 8 + 3;
        rock.style.width = size + 'px';
        rock.style.height = size + 'px';
        rock.style.top = Math.random() * 100 + '%';
        rock.style.animationDuration = (Math.random() * 8 + 4) + 's';
        rock.style.animationDelay = (Math.random() * 6) + 's';
        rock.style.opacity = Math.random() * 0.5 + 0.2;
        container.appendChild(rock);
    }
})();

// ===== NEBULA SPARKLES =====
(function createSparkles() {
    const container = document.getElementById('nebula-sparkles');
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.classList.add('sparkle');
        s.style.top = Math.random() * 100 + '%';
        s.style.left = Math.random() * 100 + '%';
        s.style.setProperty('--dur', (Math.random() * 3 + 1.5) + 's');
        s.style.animationDelay = (Math.random() * 3) + 's';
        s.style.width = (Math.random() * 3 + 1) + 'px';
        s.style.height = s.style.width;
        container.appendChild(s);
    }
})();

// ===== SHOW TRACKER AFTER HERO =====
gsap.to('#tracker', {
    opacity: 1, y: 0, duration: 0.8,
    scrollTrigger: { trigger: '#moon-section', start: 'top 80%', toggleActions: 'play none none reverse' }
});

// ===== SHOW MARQUEE =====
gsap.to('.marquee-strip', {
    opacity: 1, duration: 0.6,
    scrollTrigger: { trigger: '#moon-section', start: 'top 60%', toggleActions: 'play none none reverse' }
});

// ===== HERO PARALLAX FADE =====
gsap.to('.hero-content', {
    y: -200, opacity: 0,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 40%', scrub: 1 }
});
gsap.to('.earth-glow', {
    y: -300, opacity: 0, scale: 2.5,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
});

// ===== ANIMATE STAT COUNTERS =====
function animateCounters(triggerSection) {
    const counters = document.querySelectorAll(`${triggerSection} .stat-number`);
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        gsap.to(counter, {
            textContent: target,
            duration: 1.5,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: triggerSection,
                start: 'top 50%',
                toggleActions: 'play none none none'
            },
            onUpdate: function () {
                counter.textContent = Math.round(parseFloat(counter.textContent)).toLocaleString();
            }
        });
    });
}

// ===== PLANET ANIMATION FACTORY =====
function animatePlanet(sectionId, planetId, infoId) {
    // Planet scales in from small
    gsap.from(planetId, {
        scale: 0.05, opacity: 0, x: 150, rotation: -15,
        duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: sectionId, start: 'top 75%', end: 'top 20%', scrub: 1 }
    });

    // Planet subtle float while in view
    gsap.to(planetId, {
        y: -20,
        scrollTrigger: { trigger: sectionId, start: 'top 50%', end: 'bottom 50%', scrub: 2 }
    });

    // Info text reveals
    gsap.from(`${infoId} .planet-name`, {
        y: 50, opacity: 0,
        scrollTrigger: { trigger: sectionId, start: 'top 55%', toggleActions: 'play none none reverse' }
    });
    gsap.from(`${infoId} .planet-tagline`, {
        y: 40, opacity: 0, delay: 0.1,
        scrollTrigger: { trigger: sectionId, start: 'top 55%', toggleActions: 'play none none reverse' }
    });
    gsap.from(`${infoId} .planet-desc`, {
        y: 40, opacity: 0, delay: 0.2,
        scrollTrigger: { trigger: sectionId, start: 'top 50%', toggleActions: 'play none none reverse' }
    });
    gsap.from(`${infoId} .stat-item`, {
        y: 30, opacity: 0, stagger: 0.1, delay: 0.3,
        scrollTrigger: { trigger: sectionId, start: 'top 45%', toggleActions: 'play none none reverse' }
    });

    animateCounters(sectionId);
}

// Apply to all planets
animatePlanet('#moon-section', '#moon-planet', '#moon-info');
animatePlanet('#mars-section', '#mars-planet', '#mars-info');
animatePlanet('#jupiter-section', '#jupiter-planet', '#jupiter-info');
animatePlanet('#saturn-section', '#saturn-planet', '#saturn-info');

// ===== SATURN RING ROTATION ON SCROLL =====
gsap.to('.saturn-ring', {
    rotationX: 65, rotationZ: 8,
    scrollTrigger: { trigger: '#saturn-section', start: 'top bottom', end: 'bottom top', scrub: 2 }
});

// ===== TRANSITION SECTIONS =====
gsap.from('#asteroid-belt .transition-text', {
    y: 60, opacity: 0,
    scrollTrigger: { trigger: '#asteroid-belt', start: 'top 65%', toggleActions: 'play none none reverse' }
});

gsap.from('#deep-space .transition-text', {
    y: 60, opacity: 0,
    scrollTrigger: { trigger: '#deep-space', start: 'top 65%', toggleActions: 'play none none reverse' }
});

gsap.from('.deep-space-counter', {
    scale: 0.5, opacity: 0,
    scrollTrigger: { trigger: '#deep-space', start: 'top 50%', toggleActions: 'play none none reverse' }
});

// ===== NEBULA =====
const nebulaBlobs = document.querySelectorAll('.nebula-blob');
nebulaBlobs.forEach((blob, i) => {
    gsap.to(blob, {
        opacity: 0.8,
        scale: 1.2,
        x: (i % 2 === 0 ? 50 : -50),
        y: -30,
        duration: 2,
        scrollTrigger: {
            trigger: '#nebula-section',
            start: 'top 80%',
            end: 'center center',
            scrub: 1,
        }
    });
});

gsap.from('#nebula-info .planet-name', {
    y: 60, opacity: 0,
    scrollTrigger: { trigger: '#nebula-section', start: 'top 50%', toggleActions: 'play none none reverse' }
});
gsap.from('#nebula-info .planet-tagline', {
    y: 50, opacity: 0, delay: 0.1,
    scrollTrigger: { trigger: '#nebula-section', start: 'top 50%', toggleActions: 'play none none reverse' }
});
gsap.from('#nebula-info .planet-desc', {
    y: 40, opacity: 0, delay: 0.2,
    scrollTrigger: { trigger: '#nebula-section', start: 'top 45%', toggleActions: 'play none none reverse' }
});

// ===== THE EDGE =====
gsap.from('.edge-pre', {
    y: 40, opacity: 0,
    scrollTrigger: { trigger: '#edge-section', start: 'top 60%', toggleActions: 'play none none reverse' }
});

// Animate final distance counter to 93
const finalNum = document.getElementById('final-distance');
gsap.to(finalNum, {
    textContent: 93,
    duration: 2.5,
    ease: 'power2.out',
    snap: { textContent: 1 },
    scrollTrigger: { trigger: '#edge-section', start: 'top 55%', toggleActions: 'play none none none' }
});

gsap.from('.edge-unit', {
    y: 30, opacity: 0, delay: 0.3,
    scrollTrigger: { trigger: '#edge-section', start: 'top 55%', toggleActions: 'play none none reverse' }
});
gsap.from('.edge-title', {
    y: 40, opacity: 0, delay: 0.5,
    scrollTrigger: { trigger: '#edge-section', start: 'top 50%', toggleActions: 'play none none reverse' }
});
gsap.from('.edge-desc', {
    y: 40, opacity: 0, delay: 0.6,
    scrollTrigger: { trigger: '#edge-section', start: 'top 45%', toggleActions: 'play none none reverse' }
});
gsap.from('.restart-btn', {
    y: 30, opacity: 0, delay: 0.8,
    scrollTrigger: { trigger: '#edge-section', start: 'top 40%', toggleActions: 'play none none reverse' }
});

// ===== RESTART BUTTON =====
document.getElementById('restart-btn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== BACKGROUND COLOR MORPH =====
const sections = [
    { trigger: '#hero', bg: '#050510' },
    { trigger: '#moon-section', bg: '#08081a' },
    { trigger: '#mars-section', bg: '#0a0812' },
    { trigger: '#asteroid-belt', bg: '#060610' },
    { trigger: '#jupiter-section', bg: '#0c0a08' },
    { trigger: '#saturn-section', bg: '#0a0908' },
    { trigger: '#deep-space', bg: '#030308' },
    { trigger: '#nebula-section', bg: '#0a0515' },
    { trigger: '#edge-section', bg: '#08060a' },
];

sections.forEach(s => {
    ScrollTrigger.create({
        trigger: s.trigger,
        start: 'top 60%',
        onEnter: () => gsap.to('body', { backgroundColor: s.bg, duration: 1.2, ease: 'power2.out' }),
        onEnterBack: () => gsap.to('body', { backgroundColor: s.bg, duration: 1.2, ease: 'power2.out' }),
    });
});

// ===== WINDOW RESIZE: REGENERATE STARS =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        generateStars('stars-back', 500, [0.5, 1]);
        generateStars('stars-mid', 250, [1, 2]);
        generateStars('stars-front', 100, [1.5, 3]);
    }, 300);
});
