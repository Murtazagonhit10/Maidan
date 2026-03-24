'use client';
import { useEffect, useRef, useState } from 'react';
import SplashCursor from './SplashCursor';

/* ═══════════════════════════════════════════════════════
   VenuesHero  —  final rebuild

   ① Liquid Ether: CSS radial-gradient blobs that
      smoothly follow the mouse (lerp). Large, blurred,
      layered. THIS is what reactbits.dev/backgrounds/
      liquid-ether looks like — CSS, not WebGL.

   ② Three.js wireframe sports scene: exact match to the
      homepage HeroScene aesthetic — IcosahedronGeometry,
      wireframe:true, morphing vertices, TorusGeometry
      rings, Points particles, mouse parallax.
      Sports cycle: cricket bat+ball → football → padel.

   ③ Seamless ticker: 4× duplication, translateX(-25%).
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   ① LIQUID ETHER  —  CSS blob background
      3 radial-gradient divs filtered through blur.
      Each tracks mouse position with different lerp
      speeds, creating the fluid "ether" look.
      Amber / dark-gold palette for Maidan theme.
══════════════════════════════════════════════════════ */
function LiquidEther() {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useEffect(() => {
    /* Current blob positions */
    const pos = [
      { x: 30, y: 40, tx: 30, ty: 40 },
      { x: 70, y: 55, tx: 70, ty: 55 },
      { x: 50, y: 25, tx: 50, ty: 25 },
    ];

    const refs = [blob1Ref, blob2Ref, blob3Ref];
    /* Each blob lags at a different speed */
    const speeds = [0.04, 0.025, 0.065];
    /* Each blob offset from cursor (so they spread out) */
    const offsets = [
      { x: -12, y: -8 },
      { x: 14, y: 10 },
      { x: 2, y: -16 },
    ];

    let mx = 50, my = 50;

    const onMove = (e) => {
      const section = blob1Ref.current?.closest('section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width) * 100;
      my = ((e.clientY - rect.top) / rect.height) * 100;
    };

    window.addEventListener('mousemove', onMove);

    let raf;
    function animate() {
      pos.forEach((p, i) => {
        const targetX = mx + offsets[i].x;
        const targetY = my + offsets[i].y;
        p.x += (targetX - p.x) * speeds[i];
        p.y += (targetY - p.y) * speeds[i];
        if (refs[i].current) {
          refs[i].current.style.left = `${p.x}%`;
          refs[i].current.style.top = `${p.y}%`;
        }
      });
      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const blobBase = {
    position: 'absolute',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    willChange: 'left, top',
  };

  return (
    /* The outer div clips, the inner div has filter:blur so blobs bleed into each other */
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#080503' }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(60px)', zIndex: 0 }}>
        {/* Blob 1 — large warm amber */}
        <div ref={blob1Ref} style={{
          ...blobBase,
          width: '55vw', height: '55vw',
          background: 'radial-gradient(circle, rgba(180,100,20,.72) 0%, rgba(120,60,8,.45) 45%, transparent 70%)',
        }} />
        {/* Blob 2 — deep orange-gold */}
        <div ref={blob2Ref} style={{
          ...blobBase,
          width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(210,140,60,.65) 0%, rgba(90,40,5,.4) 50%, transparent 72%)',
        }} />
        {/* Blob 3 — dark tobacco accent */}
        <div ref={blob3Ref} style={{
          ...blobBase,
          width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(240,180,60,.55) 0%, rgba(60,25,3,.35) 55%, transparent 75%)',
        }} />
      </div>
      {/* Dark overlay so text stays readable */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,3,1,.62)', zIndex: 1 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ② THREE.JS WIREFRAME SPORTS SCENE
      Matches homepage HeroScene exactly:
        - IcosahedronGeometry wireframe
        - Morphing vertices via sine waves
        - TorusGeometry rings
        - Points particles
        - Mouse parallax on camera
      Sports cycle every 4s with fade:
        cricket bat+ball → football → padel racket
══════════════════════════════════════════════════════ */
function SportsWireframe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = init;
    document.head.appendChild(script);

    let animId, renderer, scene, camera;
    let currentGroup = null;
    let nextGroup = null;
    let transitionT = 0; /* 0..1 fade progress */
    let isTransitioning = false;
    let sportIdx = 0;
    const SPORTS = ['cricket', 'football', 'padel'];
    const CYCLE_MS = 4000;
    let lastCycle = performance.now();

    function init() {
      if (!canvas) return;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.set(0, 0, 5);

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

      function updateSize() {
        const W = canvas.offsetWidth || 500;
        const H = canvas.offsetHeight || 500;
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        renderer.setViewport(0, 0, canvas.width, canvas.height);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      }
      updateSize();
      const ro = new ResizeObserver(updateSize);
      ro.observe(canvas);

      /* ── Material factory ── */
      const amberWire = (opacity) => new THREE.MeshBasicMaterial({ color: 0xd28c3c, wireframe: true, transparent: true, opacity });
      const amberFill = (opacity) => new THREE.MeshBasicMaterial({ color: 0x3d1f00, transparent: true, opacity });
      const amberTorus = (opacity) => new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity });

      /* ── SPORT BUILDERS ── */

      /* Cricket bat + ball */
      function createCricket() {
        const g = new THREE.Group();

        /* Ball — icosahedron wireframe, pure amber, NO ring around it */
        const ballGeo = new THREE.IcosahedronGeometry(0.52, 2);
        const ball = new THREE.Mesh(ballGeo, amberWire(0.58));
        /* Amber dark fill — no red at all */
        const ballFill = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.48, 2),
          new THREE.MeshBasicMaterial({ color: 0x2a1500, transparent: true, opacity: 0.30 })
        );
        /* Bring ball close to bat — just off the blade edge */
        ball.position.set(0.05, 0.72, 0.35);
        ballFill.position.copy(ball.position);
        g.add(ball, ballFill);
        ball.userData.basePos = new Float32Array(ballGeo.attributes.position.array);

        /* Bat blade — box wireframe */
        const bladeGeo = new THREE.BoxGeometry(0.5, 1.6, 0.12);
        const blade = new THREE.Mesh(bladeGeo, amberWire(0.48));
        const bladeFill = new THREE.Mesh(bladeGeo,
          new THREE.MeshBasicMaterial({ color: 0x2a1500, transparent: true, opacity: 0.18 })
        );
        blade.position.set(0.55, 0, 0);
        bladeFill.position.copy(blade.position);
        g.add(blade, bladeFill);

        /* Bat ridge */
        const ridgeGeo = new THREE.BoxGeometry(0.09, 1.4, 0.14);
        const ridge = new THREE.Mesh(ridgeGeo, amberWire(0.28));
        ridge.position.set(0.55, 0, -0.13);
        g.add(ridge);

        /* Handle */
        const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8);
        const handle = new THREE.Mesh(handleGeo, amberWire(0.38));
        handle.position.set(0.55, -1.22, 0);
        g.add(handle);

        /* Knob at bottom */
        const knob = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 6, 6),
          amberWire(0.32)
        );
        knob.position.set(0.55, -1.67, 0);
        g.add(knob);

        g.rotation.z = -0.18;
        g.rotation.y = 0.25;
        return g;
      }

      /* Football — icosahedron (classic soccer look), all amber */
      function createFootball() {
        const g = new THREE.Group();

        /* Main wireframe ball */
        const mainGeo = new THREE.IcosahedronGeometry(1.22, 2);
        const main = new THREE.Mesh(mainGeo, amberWire(0.52));
        main.userData.basePos = new Float32Array(mainGeo.attributes.position.array);
        g.add(main);

        /* Inner solid fill — dark amber, no black/red */
        const inner = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.13, 2),
          new THREE.MeshBasicMaterial({ color: 0x2a1500, transparent: true, opacity: 0.28 })
        );
        g.add(inner);

        /* Outer sparse shell — extra depth, very faint */
        const outer = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.45, 1),
          amberWire(0.07)
        );
        g.add(outer);

        g.rotation.x = 0.3;
        g.rotation.y = 0.5;
        return g;
      }

      /* Padel racket — all amber, no red */
      function createPadel() {
        const g = new THREE.Group();

        /* Head — torus frame ring */
        const headFrame = new THREE.Mesh(
          new THREE.TorusGeometry(0.74, 0.05, 8, 32),
          amberWire(0.58)
        );
        headFrame.position.y = 0.52;
        g.add(headFrame);

        /* Head fill — dark amber */
        const headFill = new THREE.Mesh(
          new THREE.CylinderGeometry(0.72, 0.72, 0.04, 32),
          new THREE.MeshBasicMaterial({ color: 0x2a1500, transparent: true, opacity: 0.14 })
        );
        headFill.position.y = 0.52;
        g.add(headFill);

        /* String grid vertical bars */
        for (let i = -3; i <= 3; i++) {
          const vBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.012, 1.38, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.24 })
          );
          vBar.position.set(i * 0.2, 0.52, 0);
          g.add(vBar);
        }
        /* String grid horizontal bars */
        for (let j = -4; j <= 4; j++) {
          const hBar = new THREE.Mesh(
            new THREE.BoxGeometry(1.38, 0.012, 0.01),
            new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.24 })
          );
          hBar.position.set(0, 0.52 + j * 0.155, 0);
          g.add(hBar);
        }

        /* Throat — triangular join, use a narrow box */
        const throat = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.32, 0.08),
          amberWire(0.38)
        );
        throat.position.y = -0.18;
        g.add(throat);

        /* Handle */
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 1.05, 0.1),
          amberWire(0.48)
        );
        const handleFill = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 1.05, 0.1),
          new THREE.MeshBasicMaterial({ color: 0x2a1500, transparent: true, opacity: 0.16 })
        );
        handle.position.y = -0.72;
        handleFill.position.y = -0.72;
        g.add(handle, handleFill);

        /* Grip rings — amber wireframe torus */
        for (let i = 0; i < 4; i++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.14, 0.016, 4, 16),
            amberWire(0.32)
          );
          ring.position.y = -0.38 - i * 0.2;
          ring.rotation.x = Math.PI / 2;
          g.add(ring);
        }

        /* End cap knob */
        const knob = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 6, 6),
          amberWire(0.28)
        );
        knob.position.y = -1.28;
        g.add(knob);

        g.rotation.z = 0.2;
        g.rotation.y = -0.3;
        return g;
      }

      /* ── Shared environment ── */
      /* Rings (always present, same as homepage) */
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.009, 2, 200),
        new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.38 })
      );
      ring1.rotation.x = Math.PI / 2.4;
      scene.add(ring1);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.1, 0.005, 2, 200),
        new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.16 })
      );
      ring2.rotation.x = Math.PI / 2.4;
      ring2.rotation.z = Math.PI / 4;
      scene.add(ring2);

      const ring3 = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.007, 2, 200),
        new THREE.MeshBasicMaterial({ color: 0xd28c3c, transparent: true, opacity: 0.1 })
      );
      ring3.rotation.x = Math.PI / 5;
      ring3.rotation.y = Math.PI / 6;
      scene.add(ring3);

      /* Particles */
      const pGeo = new THREE.BufferGeometry();
      const pArr = new Float32Array(220 * 3);
      for (let i = 0; i < 220; i++) {
        pArr[i * 3] = (Math.random() - .5) * 14;
        pArr[i * 3 + 1] = (Math.random() - .5) * 10;
        pArr[i * 3 + 2] = (Math.random() - .5) * 8;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
      const particles = new THREE.Points(pGeo,
        new THREE.PointsMaterial({ color: 0xd28c3c, size: 0.028, transparent: true, opacity: 0.45 })
      );
      scene.add(particles);

      /* ── Build sport builders array ── */
      const builders = [createCricket, createFootball, createPadel];

      /* First sport */
      currentGroup = builders[0]();
      scene.add(currentGroup);

      /* ── Mouse ── */
      let mx = 0, my = 0;
      const onMouse = e => {
        mx = (e.clientX / window.innerWidth - .5) * 2;
        my = (e.clientY / window.innerHeight - .5) * 2;
      };
      window.addEventListener('mousemove', onMouse);

      /* ── Animate ── */
      let t = 0;

      /* Morph the main wireframe geo of a group */
      function morphGroup(group, t) {
        group.traverse(child => {
          if (child.isMesh && child.userData.basePos) {
            const pos = child.geometry.attributes.position;
            const base = child.userData.basePos;
            for (let i = 0; i < pos.count; i++) {
              const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
              const n = Math.sin(bx * 2.2 + t) * Math.cos(by * 2.2 + t * .7) * Math.sin(bz * 1.8 + t * 1.1);
              const s = 1 + n * 0.06;
              pos.setXYZ(i, bx * s, by * s, bz * s);
            }
            pos.needsUpdate = true;
          }
        });
      }

      function animate(now) {
        animId = requestAnimationFrame(animate);
        t += 0.005;

        /* ── Sport cycling ── */
        if (!isTransitioning && (now - lastCycle) > CYCLE_MS) {
          lastCycle = now;
          isTransitioning = true;
          transitionT = 0;
          sportIdx = (sportIdx + 1) % SPORTS.length;
          nextGroup = builders[sportIdx]();
          nextGroup.traverse(c => { if (c.isMesh) c.material.opacity = 0; });
          scene.add(nextGroup);
        }

        if (isTransitioning) {
          transitionT += 0.018;
          const ease = 1 - Math.pow(1 - Math.min(transitionT, 1), 3);
          /* Fade current out */
          if (currentGroup) {
            currentGroup.traverse(c => {
              if (c.isMesh && c.material.transparent) {
                c.material.opacity = Math.max(0, c.material.opacity - 0.02);
              }
            });
          }
          /* Fade next in */
          if (nextGroup) {
            nextGroup.traverse(c => {
              if (c.isMesh && c.material.transparent) {
                const targetOpacity = c.material.color?.getHex() === 0xd28c3c ? 0.5 : 0.25;
                c.material.opacity = Math.min(c.material.opacity + 0.018, targetOpacity);
              }
            });
          }
          if (transitionT >= 1) {
            if (currentGroup) { scene.remove(currentGroup); }
            currentGroup = nextGroup;
            nextGroup = null;
            isTransitioning = false;
          }
        }

        /* ── Morph sport ── */
        if (currentGroup) {
          morphGroup(currentGroup, t);
          currentGroup.rotation.y += 0.005 + mx * 0.0008;
          currentGroup.rotation.x += 0.002 + my * 0.0005;
          currentGroup.position.y = Math.sin(t * .7) * .12;
        }

        /* ── Rings ── */
        ring1.rotation.z = t * .12;
        ring2.rotation.z = -t * .08;
        ring3.rotation.z = t * .05;
        ring3.rotation.x = Math.PI / 5 + t * 0.03;

        /* ── Particles ── */
        particles.rotation.y = t * .03;
        particles.rotation.x = t * .015;

        /* ── Camera mouse parallax ── */
        camera.position.x += (mx * .35 - camera.position.x) * .05;
        camera.position.y += (-my * .22 - camera.position.y) * .05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate(performance.now());

      return () => {
        window.removeEventListener('mousemove', onMouse);
        ro.disconnect();
      };
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        right: '-60px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'clamp(340px, 38vw, 580px)',
        height: 'clamp(340px, 38vw, 580px)',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   SEAMLESS TICKER  —  4 copies, translate -25%
══════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  'Cricket Nets', '·', 'Futsal Courts', '·', 'Padel Arenas', '·',
  'Real-Time Booking', '·', 'Instant Confirm', '·', '120+ Venues', '·',
  'Book in 60 seconds', '·',
];
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'tickerRoll 28s linear infinite', willChange: 'transform' }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', fontWeight: item === '·' ? 400 : 600, letterSpacing: item === '·' ? 0 : '.18em', textTransform: 'uppercase', color: item === '·' ? 'rgba(210,140,60,.5)' : 'rgba(245,239,230,.42)', padding: '0 1.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ScrambleText */
const SC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&';
function ScrambleText({ text, color = '#f5efe6', delay = 0 }) {
  const [chars, setChars] = useState(() => text.split(''));
  const rRef = useRef(0), fRef = useRef(0), ivRef = useRef(null);
  useEffect(() => {
    const tid = setTimeout(() => {
      rRef.current = 0; fRef.current = 0;
      ivRef.current = setInterval(() => {
        fRef.current++;
        if (fRef.current % 3 === 0 && rRef.current < text.length) rRef.current++;
        setChars(text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < rRef.current) return ch;
          return SC[Math.floor(Math.random() * SC.length)];
        }));
        if (rRef.current >= text.length) clearInterval(ivRef.current);
      }, 38);
    }, delay);
    return () => { clearTimeout(tid); clearInterval(ivRef.current); };
  }, [text, delay]);
  return (
    <span>
      {chars.map((ch, i) => (
        <span key={i} style={{ color: ch === text[i] ? color : `${color}44`, display: 'inline-block', minWidth: ch === ' ' ? '.25em' : undefined, fontFamily: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/* CountUp pill */
function StatPill({ end, suffix = '', label, delay = 0 }) {
  const [val, setVal] = useState(0);
  const [seen, setSeen] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!seen) return;
    let raf; const dur = 1600, s0 = performance.now() + delay;
    const tick = (now) => {
      if (now < s0) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min((now - s0) / dur, 1);
      setVal(Math.round((1 - Math.pow(2, -10 * t)) * end));
      if (t < 1) raf = requestAnimationFrame(tick); else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, end, delay]);
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 1.8rem', background: hov ? 'rgba(210,140,60,.14)' : 'rgba(245,239,230,.05)', border: `1px solid ${hov ? 'rgba(210,140,60,.55)' : 'rgba(210,140,60,.22)'}`, borderRadius: '6px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden', transform: hov ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hov ? '0 12px 32px rgba(210,140,60,.2)' : 'none', transition: 'all .35s cubic-bezier(.22,1,.36,1)', cursor: 'default', animation: 'pillIn .6s cubic-bezier(.22,1,.36,1) both', animationDelay: `${delay + 700}ms` }}>
      <div style={{ position: 'absolute', top: 0, left: hov ? '10%' : '35%', right: hov ? '10%' : '35%', height: '1.5px', background: 'linear-gradient(to right,transparent,#d28c3c,transparent)', transition: 'all .4s cubic-bezier(.22,1,.36,1)' }} />
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '2rem', color: '#d28c3c', lineHeight: 1, letterSpacing: '-.04em' }}>{val}{suffix}</span>
      <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.6rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(245,239,230,.42)', marginTop: '.3rem' }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO EXPORT
═══════════════════════════════════════════════════════ */
export default function VenuesHero({ totalVenues = 11, totalCities = 4, totalSports = 3 }) {
  return (
    <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', background: '#080503' }}>
      <style>{`
        /* ticker: 4 copies, -25% = exactly 1 copy scrolls left */
        @keyframes tickerRoll { from{transform:translateX(0)} to{transform:translateX(-25%)} }
        @keyframes pillIn     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes eyeIn      { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ReactBits SplashCursor — WebGL fluid sim that follows cursor */}
      <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        PRESSURE_ITERATIONS={20}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        TRANSPARENT={true}
      />

      {/* ① Liquid Ether blobs */}
      <LiquidEther />

      {/* Dark grid overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(rgba(210,140,60,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(210,140,60,.05) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', opacity: .4 }} />

      {/* Bottom fade */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(8,5,3,.55) 0%, transparent 20%, transparent 72%, rgba(8,5,3,.96) 100%)', pointerEvents: 'none' }} />

      {/* Radial spotlight — left-biased to illuminate text */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 55% 60% at 28% 50%, rgba(210,140,60,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ② Three.js wireframe sport (right side) */}
      <SportsWireframe />

      {/* Glow halo behind the 3D scene */}
      <div style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', width: 'clamp(340px,40vw,600px)', height: 'clamp(340px,40vw,600px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(210,140,60,.14) 0%, transparent 65%)', zIndex: 2, pointerEvents: 'none' }} />

      {/* ③ Text */}
      <div style={{ position: 'relative', zIndex: 4, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 4rem 0 4rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', marginBottom: '1.5rem', animation: 'eyeIn .6s .05s both' }}>
          <span style={{ width: 22, height: 1, background: '#d28c3c', display: 'block' }} />
          <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', color: '#d28c3c' }}>
            Lahore · Indoor Sports
          </span>
        </div>
        {/* Headline */}
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(3rem,6.5vw,6.8rem)', lineHeight: .9, letterSpacing: '-.04em', marginBottom: '1.4rem', userSelect: 'none', maxWidth: '55vw' }}>
          <span style={{ display: 'block' }}><ScrambleText text="FIND YOUR" color="#f5efe6" delay={200} /></span>
          <span style={{ display: 'block' }}><ScrambleText text="COURT." color="#d28c3c" delay={700} /></span>
        </h1>
        {/* Sub */}
        <p style={{ fontFamily: "'Mulish',sans-serif", fontWeight: 300, fontSize: 'clamp(.9rem,1.4vw,1.08rem)', color: 'rgba(245,239,230,.5)', lineHeight: 1.78, maxWidth: '440px', marginBottom: '3rem', animation: 'eyeIn .7s .85s both' }}>
          Browse {totalVenues}+ premium indoor venues. Cricket nets, futsal courts & padel arenas — instantly bookable.
        </p>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <StatPill end={totalVenues} suffix="+" label="Active Venues" delay={0} />
          <StatPill end={totalCities} suffix="" label="Cities Covered" delay={120} />
          <StatPill end={totalSports} suffix="" label="Sports Offered" delay={240} />
        </div>
      </div>

      {/* ④ Ticker tape */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, borderTop: '1px solid rgba(210,140,60,.18)', background: 'rgba(8,5,3,.78)', backdropFilter: 'blur(8px)', padding: '.54rem 0', overflow: 'hidden' }}>
        <Ticker />
      </div>
    </section>
  );
}