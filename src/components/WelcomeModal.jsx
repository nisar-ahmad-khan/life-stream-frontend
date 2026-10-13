import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const STORAGE_KEY = 'lifestream_welcome_seen_v1';

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

/* ── Three.js scene ─────────────────────────────────────────────────────── */
function buildScene(canvas) {
  const W = canvas.clientWidth || 400;
  const H = canvas.clientHeight || 440;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.z = 5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const pl = new THREE.PointLight(0xe63946, 3, 15);
  pl.position.set(2, 3, 4);
  scene.add(pl);
  const pl2 = new THREE.PointLight(0x457b9d, 2, 15);
  pl2.position.set(-3, -2, 2);
  scene.add(pl2);

  /* Central pulsing icosahedron */
  const geoOrb = new THREE.IcosahedronGeometry(1.1, 1);
  const matOrb = new THREE.MeshPhongMaterial({
    color: 0xe63946,
    emissive: 0x8b0000,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.88,
    shininess: 120,
  });
  const orb = new THREE.Mesh(geoOrb, matOrb);
  scene.add(orb);

  /* Wireframe shell */
  const geoWire = new THREE.IcosahedronGeometry(1.35, 1);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0xff6b7a,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const wire = new THREE.Mesh(geoWire, matWire);
  scene.add(wire);

  /* Floating particles */
  const N = 130;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const geoP = new THREE.BufferGeometry();
  geoP.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const matP = new THREE.PointsMaterial({ color: 0xff4d6d, size: 0.09, transparent: true, opacity: 0.7, sizeAttenuation: true });
  scene.add(new THREE.Points(geoP, matP));

  /* Orbit ring */
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.02, 8, 60),
    new THREE.MeshBasicMaterial({ color: 0xff6b7a, transparent: true, opacity: 0.22 })
  );
  ring.rotation.x = Math.PI / 4;
  scene.add(ring);

  let t = 0;
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    t += 0.012;

    const s = 1 + 0.08 * Math.sin(t * 2);
    orb.scale.set(s, s, s);
    orb.rotation.y += 0.008;
    orb.rotation.x += 0.004;

    wire.rotation.y -= 0.012;
    wire.rotation.x += 0.005;

    const pa = geoP.attributes.position;
    for (let i = 0; i < N; i++) {
      pa.array[i * 3 + 1] += 0.005;
      if (pa.array[i * 3 + 1] > 5) pa.array[i * 3 + 1] = -5;
    }
    pa.needsUpdate = true;

    ring.rotation.z += 0.005;
    ring.scale.setScalar(1 + 0.05 * Math.sin(t));
    pl.intensity = 2.5 + 1.5 * Math.sin(t * 2.2);

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
        .wm-left{position:relative;width:44%;min-height:440px;background:#06061a;flex-shrink:0;overflow:hidden}
        .wm-left canvas{display:block;width:100%!important;height:100%!important;position:absolute;inset:0}
        .wm-left-label{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.4);font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;z-index:2;pointer-events:none}
        .wm-right{flex:1;background:linear-gradient(145deg,#0e0e1e 0%,#1a0a10 60%,#090e1e 100%);padding:42px 36px 32px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
        .wm-right::before{content:'';position:absolute;top:-55px;right:-55px;width:190px;height:190px;background:radial-gradient(circle,rgba(230,57,70,.32) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .wm-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(230,57,70,.13);border:1px solid rgba(230,57,70,.28);color:#ff6b7a;border-radius:100px;padding:4px 13px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;width:fit-content}
        .wm-dot-pulse{width:6px;height:6px;border-radius:50%;background:#e63946;animation:wm-blink 1.4s infinite}
        @keyframes wm-blink{0%,100%{opacity:1}50%{opacity:.2}}
        .wm-icon{font-size:40px;display:block;margin-bottom:10px;animation:wm-bob 2.4s ease-in-out infinite}
        @keyframes wm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .wm-headline{font-size:clamp(1.45rem,3vw,2.05rem);font-weight:900;line-height:1.17;color:#fff;margin-bottom:13px;white-space:pre-line}
        .wm-sub{font-size:.875rem;color:rgba(255,255,255,.62);line-height:1.68;margin-bottom:28px;max-width:360px}
        .wm-cta{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,#e63946,#b91c1c);color:#fff;border:none;border-radius:100px;padding:12px 26px;font-size:.875rem;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 6px 24px rgba(230,57,70,.4);margin-bottom:24px;font-family:'Inter',sans-serif}
        .wm-cta:hover{transform:translateY(-2px);box-shadow:0 10px 34px rgba(230,57,70,.55)}
        .wm-cta:active{transform:scale(.97)}
        .wm-dots{display:flex;gap:8px;align-items:center}
        .wm-navdot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.18);border:none;padding:0;cursor:pointer;transition:all .25s}
        .wm-navdot.on{width:22px;border-radius:4px;background:#e63946}
        .wm-progress{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#e63946,#ff6b7a);transition:width .05s linear}
        .wm-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);color:rgba(255,255,255,.55);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;z-index:10}
        .wm-close:hover{background:rgba(230,57,70,.22);color:#fff}
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
