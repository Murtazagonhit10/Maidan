'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

/* BlurText */
function BlurText({ text, baseDelay = 0.3, gap = 0.09 }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} style={{
          display: 'inline-block', opacity: 0, filter: 'blur(10px)',
          animation: `blurReveal .72s cubic-bezier(.22,1,.36,1) ${baseDelay + i * gap}s forwards`,
        }}>
          {w}&nbsp;
        </span>
      ))}
    </>
  );
}

/* Circular SVG text */
function CircularText() {
  const R = 54;
  const cx = R + 12;
  const cy = R + 12;
  return (
    <div style={{
      position: 'absolute',
      right: '-350px', bottom: '500px',
      width: (R + 12) * 2,
      height: (R + 12) * 2,
      animation: 'circSpin 22s linear infinite',
      zIndex: 3,
      pointerEvents: 'none',
    }}>
      {/* Centre dot */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 8, height: 8,
        background: '#d28c3c', borderRadius: '50%',
      }} />
      <svg
        width="100%" height="100%"
        viewBox={`0 0 ${(R + 12) * 2} ${(R + 12) * 2}`}
        style={{ overflow: 'visible' }}
      >
        {/* The circular path — starts and ends at same point */}
        <path
          id="circPath"
          d={`
            M ${cx}, ${cy}
            m -${R}, 0
            a ${R},${R} 0 1,1 ${R * 2},0
            a ${R},${R} 0 1,1 -${R * 2},0
          `}
          fill="none"
        />
        <text
          fill="rgba(245,239,230,0.4)"
          fontFamily="'Mulish',sans-serif"
          fontSize="8.8"
          fontWeight="500"
          letterSpacing="3.2"
        >
          <textPath href="#circPath" startOffset="0%">
            BOOK · PLAY · WIN · REPEAT · MAIDAN ·&nbsp;&nbsp;
          </textPath>
        </text>
      </svg>
      <style>{`@keyframes circSpin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}

export default function HeroScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = init;
    document.head.appendChild(script);

    let animId, renderer, scene, camera;

    function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

      // Store the initial DPR to detect zoom vs real resize
      let lastDpr = window.devicePixelRatio;
      let lastInnerWidth = window.innerWidth;
      let lastInnerHeight = window.innerHeight;

      function updateSize() {
        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 3);

        // Use the smaller dimension to keep it square
        const size = Math.min(rect.width, rect.height);  // ← This line causes clipping

        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);

        renderer.setViewport(0, 0, canvas.width, canvas.height);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
      }

      updateSize();

      function onResize() {
        const currentDpr = window.devicePixelRatio;
        const currentW = window.innerWidth;
        const currentH = window.innerHeight;

        // If DPR changed but screen size is same = zoom, skip resize
        if (currentDpr !== lastDpr && currentW === lastInnerWidth && currentH === lastInnerHeight) {
          lastDpr = currentDpr;
          return;
        }

        updateSize();
      }

      /* Morphing icosahedron */
      const geo = new THREE.IcosahedronGeometry(1.5, 3);
      const basePos = new Float32Array(geo.attributes.position.array);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xd28c3c, wireframe: true, transparent: true, opacity: 0.22 }));
      scene.add(mesh);

      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.38, 3),
        new THREE.MeshBasicMaterial({ color: 0x3d1f00, transparent: true, opacity: 0.38 })
      );
      scene.add(inner);

      const outer = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.9, 2),
        new THREE.MeshBasicMaterial({ color: 0xd28c3c, wireframe: true, transparent: true, opacity: 0.06 })
      );
      scene.add(outer);

      const ringGeo = new THREE.TorusGeometry(2.3, 0.008, 2, 200);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.45 }));
      ring.rotation.x = Math.PI / 2.3;
      scene.add(ring);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.0, 0.004, 2, 200),
        new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.18 })
      );
      ring2.rotation.x = Math.PI / 2.3;
      ring2.rotation.z = Math.PI / 4;
      scene.add(ring2);

      const pGeo = new THREE.BufferGeometry();
      const pArr = new Float32Array(220 * 3);
      for (let i = 0; i < 220; i++) {
        pArr[i * 3] = (Math.random() - .5) * 14;
        pArr[i * 3 + 1] = (Math.random() - .5) * 10;
        pArr[i * 3 + 2] = (Math.random() - .5) * 8;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xd28c3c, size: 0.025, transparent: true, opacity: 0.5 }));
      scene.add(particles);

      let mx = 0, my = 0;
      const onMouse = e => { mx = (e.clientX / window.innerWidth - .5) * 2; my = (e.clientY / window.innerHeight - .5) * 2; };
      window.addEventListener('mousemove', onMouse);
      window.addEventListener('resize', onResize);

      let t = 0;
      function animate() {
        animId = requestAnimationFrame(animate);
        t += 0.005;

        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const bx = basePos[i * 3], by = basePos[i * 3 + 1], bz = basePos[i * 3 + 2];
          const n = Math.sin(bx * 2.2 + t) * Math.cos(by * 2.2 + t * .7) * Math.sin(bz * 1.8 + t * 1.1);
          const s = 1 + n * .14;
          pos.setXYZ(i, bx * s, by * s, bz * s);
        }
        pos.needsUpdate = true;

        mesh.rotation.x = t * .38 + my * .18;
        mesh.rotation.y = t * .55 + mx * .18;
        outer.rotation.x = -t * .18;
        outer.rotation.y = t * .28;
        inner.rotation.copy(mesh.rotation);

        ring.rotation.z = t * .15;
        ring2.rotation.z = -t * .1;

        mesh.position.y = Math.sin(t * .7) * .12;
        inner.position.y = outer.position.y = mesh.position.y;

        particles.rotation.y = t * .04;
        particles.rotation.x = t * .02;

        camera.position.x += (mx * .35 - camera.position.x) * .05;
        camera.position.y += (-my * .22 - camera.position.y) * .05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      return () => { window.removeEventListener('mousemove', onMouse); window.removeEventListener('resize', onResize); };
    }

    return () => { if (animId) cancelAnimationFrame(animId); if (renderer) renderer.dispose(); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes blurReveal { to { opacity:1; filter:blur(0); } }
        @keyframes slideInL   { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:none} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:none} }

        /* ── Hero wraps the full viewport ── */
        .hero {
          position: relative;
          width: 100%;
          background: #0f0a06;
          overflow: clip;
          overflow-clip-margin: content-box;
          display: flex;
          align-items: center;
          margin-bottom: -30rem;
        }

        /* Subtle grid texture */
        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(210,140,60,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210,140,60,.06) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 1; pointer-events: none;
        }

        /* Inner layout: text left, canvas right */
        .hero-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 6rem 5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-top: 4rem;
        }

        /* ── LEFT: text ── */
        .hero-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-tag {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: 'Mulish', sans-serif;
          font-size: .68rem; font-weight: 500;
          letter-spacing: .28em; text-transform: uppercase;
          color: #d28c3c; margin-bottom: 1.8rem;
          opacity: 0; animation: slideInL .8s .25s cubic-bezier(.22,1,.36,1) forwards;
        }
        .hero-tag::before { content: ''; display: block; width: 26px; height: 1px; background: #d28c3c; }

        .hero-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(3rem, 5.5vw, 5.8rem);
          line-height: .95; letter-spacing: -.04em; color: #f5efe6;
          margin-bottom: 1.8rem;
        }
        .hero-title .stroke { -webkit-text-stroke: 1.5px #d28c3c; color: transparent; }
        .hero-title .amber  { color: #d28c3c; }

        .hero-sub {
          font-family: 'Mulish', sans-serif;
          font-size: .96rem; font-weight: 300;
          color: rgba(245,239,230,.5); line-height: 1.82;
          max-width: 400px; margin-bottom: 2.5rem;
          opacity: 0; animation: fadeUp .8s .72s forwards;
        }

        .hero-actions {
          display: flex; gap: .9rem; flex-wrap: wrap;
          opacity: 0; animation: fadeUp .7s .9s forwards;
        }

        .hero-stats {
          display: flex; gap: 2.5rem; flex-wrap: wrap;
          margin-top: 3rem; padding-top: 2rem;
          border-top: 1px solid rgba(210,140,60,.16);
          opacity: 0; animation: fadeUp .7s 1.05s forwards;
        }
        .hero-stat-val {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 1.8rem; color: #d28c3c;
          display: block; line-height: 1;
        }
        .hero-stat-lbl {
          font-family: 'Mulish', sans-serif; font-size: .63rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: rgba(245,239,230,.38); display: block; margin-top: .25rem;
        }

        .hero-canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: visible;
}
        .hero-glow {
          position: absolute;
          width: min(650px, 80%); 
          height: min(650px, 80%);  border-radius: 50%;
          background: radial-gradient(circle, rgba(210,140,60,.16) 0%, transparent 70%);
          pointer-events: none; z-index: 1;
          top: -50%; right: -150px; transform: translateY(-50%);
        }
        .hero-canvas {
  position: absolute;
  right: -130px; /* Use px instead of % */
  top: -50%; /* Adjust this value as needed */
  transform: translateY(-50%);
  width: min(900px, 80vw); /* Responsive but capped */
  height: min(900px, 80vw);
  z-index: 2;
}
}
        /* Scroll hint */
        .hero-scroll {
          position: absolute; bottom: 2.5rem; left: 5rem; z-index: 3;
          display: flex; align-items: center; gap: .8rem;
          opacity: 0; animation: fadeUp .7s 1.2s forwards;
        }
        .hero-scroll span {
          font-family: 'Mulish', sans-serif; font-size: .6rem;
          letter-spacing: .25em; text-transform: uppercase;
          color: rgba(245,239,230,.3); writing-mode: vertical-rl;
        }
        .hero-scroll-line {
          width: 1px; height: 52px;
          background: linear-gradient(to bottom, #d28c3c, transparent);
          animation: scrollPulse 2.2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { opacity:.25; transform:scaleY(.7); }
          50%      { opacity:1;  transform:scaleY(1); }
        }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */
        @media (max-width: 900px) {
          .hero-inner {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            padding: 5rem 2rem 3rem;
            gap: 0;
            min-height: unset;
          }
          .hero-text {
            text-align: center;
            align-items: center;
            padding-bottom: 2rem;
          }
          .hero-tag::before { display: none; }
          .hero-sub { max-width: 100%; }
          .hero-stats { justify-content: center; }
          .hero-canvas-wrap { min-height: 280px; height: 280px; }
          .hero-scroll { display: none; }
        }

        @media (max-width: 480px) {
          .hero-inner { padding: 5rem 1.25rem 2.5rem; }
          .hero-title { font-size: clamp(2.2rem, 9vw, 3.2rem); }
          .hero-canvas-wrap { min-height: 220px; height: 220px; }
          .hero-stats { gap: 1.5rem; }
          .hero-actions { justify-content: center; }
        }
      `}</style>

      <section className="hero">
        <div className="hero-inner">
          {/* Left: text */}
          <div className="hero-text">
            <span className="hero-tag">Pakistan · Indoor Sports · Real-Time</span>

            <h1 className="hero-title">
              <BlurText text="BOOK" baseDelay={0.38} gap={0} /><br />
              <span className="stroke"><BlurText text="YOUR" baseDelay={0.52} gap={0} /></span><br />
              <span className="amber"><BlurText text="COURT." baseDelay={0.66} gap={0} /></span>
            </h1>

            <p className="hero-sub">
              Real-time slots across cricket, futsal and padel venues in Lahore.
              Find, compare, and secure your court in under 60 seconds.
            </p>

            <div className="hero-actions">
              <Link href="/venues" className="btn-fill">Find a Court</Link>
              <Link href="/register" className="btn-outline">List Venue</Link>
            </div>

            <div className="hero-stats">
              {[['120+', 'Venues'], ['10k+', 'Bookings'], ['4.9★', 'Rating']].map(([v, l]) => (
                <div key={l}>
                  <span className="hero-stat-val">{v}</span>
                  <span className="hero-stat-lbl">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Three.js */}
          <div className="hero-canvas-wrap">
            <div className="hero-glow" />
            <canvas ref={canvasRef} className="hero-canvas" />
            <CircularText />
          </div>
        </div>



        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>
    </>
  );
}