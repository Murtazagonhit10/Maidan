'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SplashCursor from '@/components/SplashCursor';
import MagneticButton from '@/components/MagneticButton';
import { MagBtn } from '@/components/Ui';

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
  const heroRef = useRef(null);
  const [isCursorInHero, setIsCursorInHero] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const isInHero = e.clientY >= rect.top && e.clientY <= rect.bottom;
      setIsCursorInHero(isInHero);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        @keyframes blurReveal { to { opacity:1; filter:blur(0); } }
        @keyframes slideInL   { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:none} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:none} }

        .hero {
          position: relative;
          width: 100%;
          background: #0f0a06;
          overflow: clip;
          overflow-clip-margin: content-box;
          display: flex;
          align-items: center;
          margin-bottom: -36rem;
        }

        .hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(210,140,60,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210,140,60,.06) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 1; pointer-events: none;
        }

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
          height: min(650px, 80%); 
          border-radius: 50%;
          background: radial-gradient(circle, rgba(210,140,60,.16) 0%, transparent 70%);
          pointer-events: none; z-index: 1;
          top: -50%; right: -150px; transform: translateY(-50%);
        }

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

      <section ref={heroRef} className="hero">
        {/* SplashCursor effect */}
        {isCursorInHero && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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
          </div>
        )}

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
              <MagneticButton asLink href="/venues" className="btn-fill" strength={0.28}>Find a Court</MagneticButton>
              <MagBtn href="/register" className="btn-outline">List Venue</MagBtn>
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

          {/* Right: Circular text only */}
          <div className="hero-canvas-wrap">
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