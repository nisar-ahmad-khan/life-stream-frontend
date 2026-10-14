import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Bumped version so the modal pops up again for you to see the new DNA animation
const STORAGE_KEY = 'lifestream_welcome_seen_v2';

const slides = [
  {
    icon: '🩸',
    headline: 'Every Drop\nCounts',
    sub: "One donation can save up to 3 lives. You have the power to be someone's miracle today.",
    cta: 'I Want to Donate',
    tag: 'For Donors',
  },
  {
    icon: '❤️',
    headline: '"Whoever saves\none life…"',
    sub: '"…it is as if he had saved all of mankind." — Al-Quran (5:32). Your blood is a gift — share it.',
    cta: 'Be the Hero',
    tag: 'Divine Reward',
  },
  {
    icon: '🌟',
    headline: 'Hope is Just\nOne Call Away',
    sub: 'If you or a loved one needs blood, LifeStream connects you with verified local donors in seconds.',
    cta: 'Find a Donor',
    tag: 'For Seekers',
  },
  {
    icon: '🤝',
    headline: 'Join Thousands\nof Life-Savers',
    sub: 'Our growing community of heroes donates regularly. Register today and let your blood type save a stranger.',
    cta: 'Join the Community',
    tag: 'Community',
  },
];

/* ── Three.js scene: 3D DNA Helix ───────────────────────────────────────── */
function buildScene(canvas) {
  const W = canvas.clientWidth || 400;
  const H = canvas.clientHeight || 440;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  // Adjust camera to view the full vertical strand
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.z = 16;
  camera.position.y = 0;

  // Lighting to enhance the 3D depth of the DNA
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const light1 = new THREE.PointLight(0xffffff, 1.5, 50);
  light1.position.set(5, 10, 5);
  scene.add(light1);
  const light2 = new THREE.PointLight(0xA61818, 2.5, 50);
  light2.position.set(-5, -5, 5);
  scene.add(light2);

  // Group to hold the entire DNA structure
  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  // Geometries and Materials for DNA components
  const sphereGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const rungGeo = new THREE.CylinderGeometry(0.06, 0.06, 4, 16);

  const matStrand1 = new THREE.MeshPhongMaterial({ color: 0xA61818, emissive: 0x300000, shininess: 80 }); // Primary Red
  const matStrand2 = new THREE.MeshPhongMaterial({ color: 0xe2e8f0, emissive: 0x111111, shininess: 80 }); // Bright contrasting strand
  const matRung = new THREE.MeshPhongMaterial({ color: 0x970707, transparent: true, opacity: 0.6 });      // Dark Red connections

  const numBasePairs = 30;
  const radius = 2;
  const heightSpread = 0.65; // Distance between each rung

  // Build the Double Helix
  for (let i = 0; i < numBasePairs; i++) {
    const t = i * 0.45; // Twist angle per step
    const y = (i - numBasePairs / 2) * heightSpread;

    // First backbone node
    const x1 = Math.cos(t) * radius;
    const z1 = Math.sin(t) * radius;
    const node1 = new THREE.Mesh(sphereGeo, matStrand1);
    node1.position.set(x1, y, z1);
    dnaGroup.add(node1);

    // Second backbone node (offset by Pi)
    const x2 = Math.cos(t + Math.PI) * radius;
    const z2 = Math.sin(t + Math.PI) * radius;
    const node2 = new THREE.Mesh(sphereGeo, matStrand2);
    node2.position.set(x2, y, z2);
    dnaGroup.add(node2);

    // Connecting rung
    const rung = new THREE.Mesh(rungGeo, matRung);
    rung.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    rung.lookAt(x1, y, z1);
    rung.rotateX(Math.PI / 2); // Orient cylinder correctly
    dnaGroup.add(rung);
  }

  /* Floating blood particles in the background */
  const N = 80;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }
  const geoP = new THREE.BufferGeometry();
  geoP.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const matP = new THREE.PointsMaterial({ color: 0xA61818, size: 0.15, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(geoP, matP);
  scene.add(particles);

  let time = 0;
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    time += 0.015;

    // Smoothly rotate the DNA structure
    dnaGroup.rotation.y += 0.008;
    // Add a subtle breathing/floating vertical motion
    dnaGroup.position.y = Math.sin(time) * 0.5;
    dnaGroup.rotation.z = Math.sin(time * 0.5) * 0.05;

    // Slowly rise the background particles
    const pa = geoP.attributes.position;
    for (let i = 0; i < N; i++) {
      pa.array[i * 3 + 1] += 0.015;
      if (pa.array[i * 3 + 1] > 12) pa.array[i * 3 + 1] = -12; // Wrap around
    }
    pa.needsUpdate = true;
    particles.rotation.y -= 0.002; // Slowly rotate particle field opposite to DNA

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  /* Show only for first-time visitors */
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  /* Mount Three.js after modal appears */
  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    return buildScene(canvasRef.current);
  }, [visible]);

  /* Auto-advance slides every 5 s */
  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    let elapsed = 0;
    const DURATION = 5000;
    const STEP = 50;

    progressRef.current = setInterval(() => {
      elapsed += STEP;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, STEP);

    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current);
      setSlide(prev => (prev + 1) % slides.length);
    }, DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [slide, visible]);

  function dismiss() {
    setClosing(true);
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 440);
  }

  function goSlide(i) {
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    setSlide(i);
  }

  if (!visible) return null;
  const cur = slides[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        .wm-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(4,4,18,.75);backdrop-filter:blur(7px);animation:wm-fi .4s ease both;font-family:'Inter',sans-serif}
        .wm-overlay.wm-out{animation:wm-fo .44s ease both}
        @keyframes wm-fi{from{opacity:0}to{opacity:1}}
        @keyframes wm-fo{from{opacity:1}to{opacity:0}}
        .wm-card{position:relative;width:min(96vw,860px);min-height:440px;border-radius:28px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.07);animation:wm-su .46s cubic-bezier(.22,1,.36,1) both;display:flex;flex-direction:row}
        .wm-card.wm-out{animation:wm-sd .42s cubic-bezier(.4,0,1,1) both}
        @keyframes wm-su{from{opacity:0;transform:translateY(44px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes wm-sd{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(30px) scale(.97)}}
        .wm-left{position:relative;width:44%;min-height:440px;background:#1A1C1F;flex-shrink:0;overflow:hidden}
        .wm-left canvas{display:block;width:100%!important;height:100%!important;position:absolute;inset:0}
        .wm-left-label{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.3);font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;z-index:2;pointer-events:none}
        .wm-right{flex:1;background:linear-gradient(145deg,#26282C 0%,#1c1d21 60%,#151619 100%);padding:42px 36px 32px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
        .wm-right::before{content:'';position:absolute;top:-55px;right:-55px;width:190px;height:190px;background:radial-gradient(circle,rgba(166,24,24,.32) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .wm-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(166,24,24,.15);border:1px solid rgba(166,24,24,.3);color:#ff8a8a;border-radius:100px;padding:4px 13px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;width:fit-content}
        .wm-dot-pulse{width:6px;height:6px;border-radius:50%;background:#A61818;animation:wm-blink 1.4s infinite}
        @keyframes wm-blink{0%,100%{opacity:1}50%{opacity:.2}}
        .wm-icon{font-size:40px;display:block;margin-bottom:10px;animation:wm-bob 2.4s ease-in-out infinite}
        @keyframes wm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .wm-headline{font-size:clamp(1.45rem,3vw,2.05rem);font-weight:900;line-height:1.17;color:#fff;margin-bottom:13px;white-space:pre-line}
        .wm-sub{font-size:.875rem;color:rgba(255,255,255,.62);line-height:1.68;margin-bottom:28px;max-width:360px}
        .wm-cta{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,#A61818,#970707);color:#fff;border:none;border-radius:100px;padding:12px 26px;font-size:.875rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 6px 24px rgba(166,24,24,.4);margin-bottom:24px;font-family:'Inter',sans-serif}
        .wm-cta:hover{transform:translateY(-2px);box-shadow:0 10px 34px rgba(166,24,24,.6)}
        .wm-cta:active{transform:scale(.97)}
        .wm-dots{display:flex;gap:8px;align-items:center}
        .wm-navdot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.18);border:none;padding:0;cursor:pointer;transition:all .25s}
        .wm-navdot.on{width:22px;border-radius:4px;background:#A61818}
        .wm-progress{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#A61818,#970707);transition:width .05s linear}
        .wm-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);color:rgba(255,255,255,.55);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;z-index:10}
        .wm-close:hover{background:rgba(166,24,24,.3);color:#fff}
        .wm-bottom{display:flex;align-items:center;justify-content:space-between}
        .wm-skip{font-size:.72rem;color:rgba(255,255,255,.33);cursor:pointer;background:none;border:none;padding:0;transition:color .2s;text-decoration:underline dotted;font-family:'Inter',sans-serif}
        .wm-skip:hover{color:rgba(255,255,255,.65)}
        @media(max-width:600px){.wm-card{flex-direction:column;min-height:0}.wm-left{width:100%;min-height:200px}.wm-right{padding:26px 20px 22px}}
      `}</style>

      <div className={`wm-overlay${closing ? ' wm-out' : ''}`} onClick={e => e.target === e.currentTarget && dismiss()}>
        <div className={`wm-card${closing ? ' wm-out' : ''}`}>

          {/* ── Three.js panel ── */}
          <div className="wm-left">
            <canvas ref={canvasRef} />
            <span className="wm-left-label">LifeStream · Give · Live · Thrive</span>
          </div>

          {/* ── Content panel ── */}
          <div className="wm-right">
            <button className="wm-close" onClick={dismiss} aria-label="Close welcome">✕</button>

            <div>
              <div className="wm-tag">
                <span className="wm-dot-pulse" />
                {cur.tag}
              </div>
              <span className="wm-icon">{cur.icon}</span>
              <h2 className="wm-headline">{cur.headline}</h2>
              <p className="wm-sub">{cur.sub}</p>
              <button className="wm-cta" onClick={dismiss}>
                {cur.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="wm-bottom">
              <div className="wm-dots">
                {slides.map((_, i) => (
                  <button key={i} className={`wm-navdot${slide === i ? ' on' : ''}`} onClick={() => goSlide(i)} aria-label={`Go to slide ${i + 1}`} />
                ))}
              </div>
              <button className="wm-skip" onClick={dismiss}>Skip intro</button>
            </div>

            <div className="wm-progress" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}