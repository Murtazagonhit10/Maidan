'use client';
import { useEffect, useRef, useState } from 'react';
import SplashCursor from '@/components/SplashCursor';

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
  const heroRef = useRef(null); 
  
  return (
    <section ref={heroRef} style={{ position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', background: '#080503' }}>
      <style>{`
        /* ticker: 4 copies, -25% = exactly 1 copy scrolls left */
        @keyframes tickerRoll { from{transform:translateX(0)} to{transform:translateX(-25%)} }
        @keyframes pillIn     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes eyeIn      { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ReactBits SplashCursor — WebGL fluid sim that follows cursor */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <SplashCursor
          containerRef={heroRef} 
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

      {/* Dark grid overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'linear-gradient(rgba(210,140,60,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(210,140,60,.05) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', opacity: .4 }} />

      {/* Bottom fade */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(8,5,3,.55) 0%, transparent 20%, transparent 72%, rgba(8,5,3,.96) 100%)', pointerEvents: 'none' }} />

      {/* Radial spotlight — left-biased to illuminate text */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 55% 60% at 28% 50%, rgba(210,140,60,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

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
          <span style={{ display: 'block', color: '#f5efe6' }}>FIND YOUR</span>
          <span style={{ display: 'block', color: '#d28c3c' }}>COURT.</span>
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