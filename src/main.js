import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   MOBILE DETECTION & SCALING
   ============================================================ */
const isMobile = innerWidth < 768;
const isTablet = innerWidth >= 768 && innerWidth < 1024;
const m = isMobile ? 0.35 : isTablet ? 0.65 : 1;   // position multiplier
const geoDetail = isMobile ? 32 : 64;                // sphere segments
const texSize = isMobile ? 512 : 1024;                // texture resolution
const starCount = isMobile ? 8000 : isTablet ? 15000 : 25000;
const nebulaCount = isMobile ? 2000 : isTablet ? 4000 : 6000;
const asteroidCount = isMobile ? 120 : 300;

/* ============================================================
   SCENE, CAMERA, RENDERER
   ============================================================ */
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, isMobile ? 0.0005 : 0.00035);

const camera = new THREE.PerspectiveCamera(isMobile ? 75 : 65, innerWidth / innerHeight, 0.1, 6000);
camera.position.set(0, 2, 60);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

/* Post-processing: Bloom (lighter on mobile) */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    isMobile ? 0.6 : 0.9,
    isMobile ? 0.3 : 0.5,
    isMobile ? 0.88 : 0.82
);
composer.addPass(bloom);

/* ============================================================
   LIGHTING
   ============================================================ */
scene.add(new THREE.AmbientLight(0x223355, isMobile ? 0.8 : 0.6));

const sun = new THREE.DirectionalLight(0xfff5e0, 2.5);
sun.position.set(200, 100, 150);
scene.add(sun);

const camLight = new THREE.PointLight(0x7b68ee, 0.4, 250);
scene.add(camLight);

/* ============================================================
   PROCEDURAL TEXTURE HELPER
   ============================================================ */
function makeTex(size, fn) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    fn(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

/* ============================================================
   STARFIELD  (20 000 points you fly through)
   ============================================================ */
function createStars() {
    const N = starCount;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
        const th = Math.random() * Math.PI * 2;
        const r = 80 + Math.random() * 900;
        pos[i * 3] = Math.cos(th) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * r * 1.6;
        pos[i * 3 + 2] = 100 + Math.random() * -4500;    // spread along travel path

        const c = new THREE.Color();
        c.setHSL(0.55 + Math.random() * 0.15, 0.15 + Math.random() * 0.25, 0.65 + Math.random() * 0.35);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
        size: 1.8, vertexColors: true, transparent: true, opacity: 0.85,
        sizeAttenuation: true, depthWrite: false,
    });
    scene.add(new THREE.Points(geo, mat));
}
createStars();

/* ============================================================
   PLANETS
   ============================================================ */
const allPlanets = [];

/* — Moon — */
const moonTex = makeTex(texSize, (ctx, s) => {
    const g = ctx.createRadialGradient(s * .32, s * .32, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#d8d8d0'); g.addColorStop(1, '#606058');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = `rgba(${70 + Math.random() * 60},${70 + Math.random() * 60},${65 + Math.random() * 55},${Math.random() * .2})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 38 + 8;
        const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
        cg.addColorStop(0, 'rgba(40,40,35,.5)'); cg.addColorStop(.8, 'rgba(60,60,55,.15)'); cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
});
const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(9, geoDetail, geoDetail),
    new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.95, metalness: 0 })
);
moonMesh.position.set(38 * m, 6, -120);
scene.add(moonMesh); allPlanets.push(moonMesh);

/* — Mars — */
const marsTex = makeTex(texSize, (ctx, s) => {
    const g = ctx.createRadialGradient(s * .4, s * .35, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#e8835a'); g.addColorStop(.5, '#c05a30'); g.addColorStop(1, '#5a2218');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    // polar cap
    ctx.fillStyle = 'rgba(240,230,220,.45)';
    ctx.beginPath(); ctx.arc(s / 2, 40, 100, 0, Math.PI * 2); ctx.fill();
    // surface noise
    for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(${100 + Math.random() * 80},${40 + Math.random() * 40},${20 + Math.random() * 30},${Math.random() * .15})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 3, 3);
    }
});
const marsMesh = new THREE.Mesh(
    new THREE.SphereGeometry(11, geoDetail, geoDetail),
    new THREE.MeshStandardMaterial({ map: marsTex, roughness: 0.85, metalness: 0.05 })
);
marsMesh.position.set(-35 * m, -4, -400);
scene.add(marsMesh); allPlanets.push(marsMesh);

/* — Jupiter — */
const jupTex = makeTex(texSize, (ctx, s) => {
    const bands = [
        '#c9a96e', '#dfc08c', '#a07840', '#dfc08c', '#c9a96e', '#8b6930',
        '#c9a96e', '#dfc08c', '#a07840', '#c4642d', '#b8441e', '#a07840',
        '#dfc08c', '#c9a96e', '#8b6930', '#c9a96e'
    ];
    const bh = s / bands.length;
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bh, s, bh + 1); });
    // blur bands
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * s, y = Math.random() * s;
        ctx.fillStyle = `rgba(${150 + Math.random() * 60},${110 + Math.random() * 50},${50 + Math.random() * 40},${Math.random() * .08})`;
        ctx.fillRect(x, y, Math.random() * 20 + 4, 2);
    }
    // great red spot
    const cg = ctx.createRadialGradient(s * .65, s * .58, 0, s * .65, s * .58, 50);
    cg.addColorStop(0, '#c44428'); cg.addColorStop(.6, '#a8351d'); cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(s * .65, s * .58, 55, 35, 0, 0, Math.PI * 2); ctx.fill();
});
const jupMesh = new THREE.Mesh(
    new THREE.SphereGeometry(35, geoDetail, geoDetail),
    new THREE.MeshStandardMaterial({ map: jupTex, roughness: 0.7, metalness: 0.05 })
);
jupMesh.position.set(55 * m, 12, -780);
scene.add(jupMesh); allPlanets.push(jupMesh);

/* — Saturn — */
const satTex = makeTex(512, (ctx, s) => {
    const g = ctx.createRadialGradient(s * .38, s * .38, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#f5e6b8'); g.addColorStop(.5, '#d4b878'); g.addColorStop(1, '#7b6520');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(${180 + Math.random() * 50},${150 + Math.random() * 40},${80 + Math.random() * 40},${Math.random() * .12})`;
        ctx.fillRect(0, Math.random() * s, s, 2);
    }
});
const satMesh = new THREE.Mesh(
    new THREE.SphereGeometry(26, geoDetail, geoDetail),
    new THREE.MeshStandardMaterial({ map: satTex, roughness: 0.75, metalness: 0.05 })
);
satMesh.position.set(-45 * m, 6, -1100);
scene.add(satMesh); allPlanets.push(satMesh);

/* Saturn Rings */
const ringTex = makeTex(512, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, 'rgba(210,190,150,0)');
    g.addColorStop(0.15, 'rgba(210,190,150,.35)');
    g.addColorStop(0.3, 'rgba(210,190,150,.15)');
    g.addColorStop(0.45, 'rgba(210,190,150,.4)');
    g.addColorStop(0.65, 'rgba(210,190,150,.25)');
    g.addColorStop(0.85, 'rgba(210,190,150,.3)');
    g.addColorStop(1, 'rgba(210,190,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const ringGeo = new THREE.RingGeometry(32, 58, 96);
const ringMat = new THREE.MeshStandardMaterial({
    map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.7, roughness: 0.9,
});
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.position.copy(satMesh.position);
ringMesh.rotation.x = -Math.PI * 0.42;
scene.add(ringMesh);

/* ============================================================
   ASTEROID BELT  (small rocks at z ≈ -580)
   ============================================================ */
(function () {
    const N = asteroidCount;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 250;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = -560 + (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x888888, size: 2.5, sizeAttenuation: true, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(geo, mat));
})();

/* ============================================================
   NEBULA  (colored particle cloud at z ≈ -1500)
   ============================================================ */
(function () {
    const N = nebulaCount;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const palette = [
        new THREE.Color('#7b2fbe'),
        new THREE.Color('#e84393'),
        new THREE.Color('#00cec9'),
        new THREE.Color('#6c5ce7'),
    ];

    for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 180;
        pos[i * 3] = Math.cos(a) * r + (Math.random() - .5) * 60;
        pos[i * 3 + 1] = (Math.random() - .5) * 160;
        pos[i * 3 + 2] = -1500 + (Math.random() - .5) * 120;

        const c = palette[Math.floor(Math.random() * palette.length)];
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
        size: 3, vertexColors: true, transparent: true, opacity: 0.65,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geo, mat));
})();

/* ============================================================
   EDGE GLOW SPHERE (at z ≈ -1900)
   ============================================================ */
const edgeGlow = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xf9ca24, transparent: true, opacity: 0.06, depthWrite: false })
);
edgeGlow.position.set(0, 0, -1920);
scene.add(edgeGlow);

/* ============================================================
   CAMERA PATH (scroll-driven GSAP timeline)
   ============================================================ */
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: '#scroll-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
    }
});

// Keyframes: hero → moon → mars → asteroids → jupiter → saturn → deep → nebula → edge
tl.to(camera.position, { z: -110, x: 18 * m, y: 8, duration: 1 })     // moon
    .to(camera.position, { z: -390, x: -18 * m, y: -3, duration: 1.2 })   // mars
    .to(camera.position, { z: -570, x: 0, y: 3, duration: 0.6 })   // asteroids
    .to(camera.position, { z: -760, x: 28 * m, y: 14, duration: 1.2 })   // jupiter
    .to(camera.position, { z: -1080, x: -22 * m, y: 8, duration: 1.2 })   // saturn
    .to(camera.position, { z: -1300, x: 0, y: 2, duration: 0.8 })   // deep space
    .to(camera.position, { z: -1490, x: 0, y: 0, duration: 1 })     // nebula
    .to(camera.position, { z: -1900, x: 0, y: 0, duration: 1 });    // edge

/* ============================================================
   SCROLL PROGRESS & DISTANCE TRACKER
   ============================================================ */
const progressFill = document.getElementById('progress-fill');
const trackerDist = document.getElementById('tracker-distance');

const distMap = [
    { at: 0, text: '0 km' },
    { at: 0.12, text: '384,400 km' },
    { at: 0.25, text: '225 million km' },
    { at: 0.35, text: '478 million km' },
    { at: 0.48, text: '778 million km' },
    { at: 0.60, text: '1.4 billion km' },
    { at: 0.72, text: '4.5 billion km' },
    { at: 0.84, text: '1,344 light-years' },
    { at: 0.95, text: '93 billion light-years' },
];

window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - innerHeight);
    progressFill.style.width = (pct * 100) + '%';

    let dist = distMap[0].text;
    for (const d of distMap) { if (pct >= d.at) dist = d.text; }
    trackerDist.textContent = dist;
});

/* Show tracker after hero */
gsap.to('#tracker', {
    opacity: 1, y: 0, duration: .7,
    scrollTrigger: { trigger: '#panel-moon', start: 'top 80%', toggleActions: 'play none none reverse' },
});

/* ============================================================
   OVERLAY TEXT ANIMATIONS
   ============================================================ */
document.querySelectorAll('[data-anim="fade"]').forEach(el => {
    gsap.from(el, {
        y: 40, opacity: 0, duration: 0.8,
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' },
    });
});

document.querySelectorAll('[data-anim="slide"]').forEach(el => {
    const dir = el.closest('.side-left') ? -60 : 60;
    gsap.from(el, {
        x: dir, opacity: 0, duration: 0.7,
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' },
    });
});

/* Counter animations */
document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    gsap.to(el, {
        textContent: target, duration: 1.4, ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        onUpdate() { el.textContent = Math.round(+el.textContent).toLocaleString(); },
    });
});

/* Final distance counter → 93 */
const finalCounter = document.getElementById('final-counter');
gsap.to(finalCounter, {
    textContent: 93, duration: 2, ease: 'power2.out',
    snap: { textContent: 1 },
    scrollTrigger: { trigger: '#panel-edge', start: 'top 60%', toggleActions: 'play none none none' },
});

/* Restart button */
document.getElementById('restart-btn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   RENDER LOOP
   ============================================================ */
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate planets
    allPlanets.forEach((p, i) => { p.rotation.y += 0.002 + i * 0.0005; });
    ringMesh.rotation.z += 0.001;

    // Camera light follows camera
    camLight.position.copy(camera.position);

    // Edge glow pulse
    edgeGlow.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08);
    edgeGlow.material.opacity = 0.04 + Math.sin(t * 0.8) * 0.02;

    composer.render();
}
animate();

/* ============================================================
   RESIZE
   ============================================================ */
window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
});
