'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   VenueCard
   - Spotlight: radial amber glow follows cursor inside card
   - Electric border canvas: animated arc traces on hover
   - Hover lift + amber glow box-shadow
   - Sport chips, city badge, court count, rating, price
   - Staggered mount animation
═══════════════════════════════════════════════════════ */

const SPORT_ICONS = { 'Turf Cricket': '🏏', 'Futsal': '⚽', 'Padel': '🎾' };

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: '#c9a84c', fontSize: '.72rem', letterSpacing: '.04em' }}>
      {'★'.repeat(full)}{half ? '½' : ''}<span style={{ opacity: .2 }}>{'★'.repeat(empty)}</span>
    </span>
  );
}

function ElectricBorderCanvas({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 380, H = canvas.offsetHeight || 300;
    canvas.width = W * 2; canvas.height = H * 2; ctx.scale(2, 2);
    const arcs = Array.from({ length: 5 }, () => ({
      offset: Math.random() * 2 * (W + H),
      speed: 1.4 + Math.random() * 1.0,
      length: 50 + Math.random() * 70,
      opacity: 0.45 + Math.random() * 0.45,
    }));
    function ptOnPerim(d, w, h) {
      const p = 2 * (w + h); d = ((d % p) + p) % p;
      if (d < w)         return [d, 0];
      if (d < w + h)     return [w, d - w];
      if (d < 2 * w + h) return [w - (d - w - h), h];
      return [0, h - (d - 2 * w - h)];
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const perim = 2 * (W + H);
      arcs.forEach(arc => {
        arc.offset = (arc.offset + arc.speed) % perim;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(210,140,60,${arc.opacity})`;
        ctx.lineWidth = 1.2; ctx.shadowColor = '#d28c3c'; ctx.shadowBlur = 6; ctx.lineCap = 'round';
        let s = false;
        for (let i = 0; i <= 30; i++) {
          const [x, y] = ptOnPerim(arc.offset + (arc.length * i / 30), W, H);
          if (!s) { ctx.moveTo(x, y); s = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    if (active) draw(); else ctx.clearRect(0, 0, W, H);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: -1, width: 'calc(100% + 2px)', height: 'calc(100% + 2px)', pointerEvents: 'none', zIndex: 3, opacity: active ? 1 : 0, transition: 'opacity .4s', borderRadius: '4px' }} />
  );
}

export default function VenueCard({ venue, index = 0 }) {
  const [hov, setHov] = useState(false);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={onMove}
      style={{
        position: 'relative', background: '#1a1108',
        border: `1px solid ${hov ? 'rgba(210,140,60,.38)' : 'rgba(245,239,230,.08)'}`,
        borderRadius: '4px', overflow: 'hidden',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hov ? '0 20px 56px rgba(0,0,0,.6), 0 0 0 1px rgba(210,140,60,.1) inset' : '0 2px 12px rgba(0,0,0,.4)',
        transition: 'transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s cubic-bezier(.22,1,.36,1), border-color .3s',
        cursor: 'default',
        animation: 'vcFadeUp .55s cubic-bezier(.22,1,.36,1) both',
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <ElectricBorderCanvas active={hov} />
      {/* Spotlight */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: hov ? 1 : 0, transition: 'opacity .35s', background: `radial-gradient(circle 220px at ${spot.x}% ${spot.y}%, rgba(210,140,60,.11) 0%, transparent 70%)` }} />

      {/* Image */}
      <div style={{ position: 'relative', height: 195, overflow: 'hidden' }}>
        <img src={venue.PrimaryImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'} alt={venue.Name}
          style={{ width: '100%', height: '125%', objectFit: 'cover', display: 'block', filter: `saturate(.7) brightness(${hov ? '.82' : '.68'})`, transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform .7s cubic-bezier(.22,1,.36,1), filter .5s' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,8,3,.88) 0%, rgba(13,8,3,.2) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: '.75rem', left: '.75rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '.3rem', padding: '.22rem .62rem', background: 'rgba(10,6,3,.82)', border: '1px solid rgba(210,140,60,.28)', borderRadius: '2px', backdropFilter: 'blur(8px)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d28c3c', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,239,230,.75)' }}>{venue.City}</span>
        </div>
        <div style={{ position: 'absolute', top: '.75rem', right: '.75rem', zIndex: 2, padding: '.22rem .62rem', background: 'rgba(10,6,3,.82)', border: '1px solid rgba(245,239,230,.1)', borderRadius: '2px', backdropFilter: 'blur(8px)', fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 600, letterSpacing: '.1em', color: 'rgba(245,239,230,.5)' }}>
          {venue.courtCount} {venue.courtCount === 1 ? 'court' : 'courts'}
        </div>
        <div style={{ position: 'absolute', bottom: '.75rem', left: '.75rem', right: '.75rem', zIndex: 2, display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
          {venue.sports.map(sport => (
            <span key={sport} style={{ display: 'flex', alignItems: 'center', gap: '.25rem', padding: '.18rem .55rem', background: 'rgba(210,140,60,.15)', border: '1px solid rgba(210,140,60,.35)', borderRadius: '2px', fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#d28c3c' }}>
              {SPORT_ICONS[sport] || '🏅'} {sport}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ position: 'relative', zIndex: 2, padding: '1.1rem 1.25rem 1.25rem' }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.02em', color: hov ? '#f5efe6' : 'rgba(245,239,230,.9)', marginBottom: '.28rem', lineHeight: 1.25, transition: 'color .25s' }}>{venue.Name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '.65rem' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(210,140,60,.6)" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.72rem', color: 'rgba(245,239,230,.38)' }}>{venue.Location}</span>
        </div>
        <div style={{ height: '1px', background: `linear-gradient(to right, ${hov ? 'rgba(210,140,60,.25)' : 'rgba(245,239,230,.06)'}, transparent)`, marginBottom: '.75rem', transition: 'background .3s' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <Stars rating={venue.avgRating} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#f5efe6' }}>{venue.avgRating.toFixed(1)}</span>
            {venue.reviewCount > 0 && <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', color: 'rgba(245,239,230,.28)' }}>({venue.reviewCount})</span>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', color: 'rgba(245,239,230,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>from</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.82rem', color: '#d28c3c', lineHeight: 1 }}>Rs. {venue.minPrice.toLocaleString()}/hr</div>
          </div>
        </div>
        <Link href={`/venues/${venue.VenueID}`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '.65rem 1rem',
          background: hov ? '#d28c3c' : 'rgba(210,140,60,.1)',
          border: `1px solid ${hov ? '#d28c3c' : 'rgba(210,140,60,.3)'}`,
          borderRadius: '2px',
          fontFamily: "'Mulish',sans-serif", fontSize: '.72rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
          color: hov ? '#0f0a06' : '#d28c3c',
          textDecoration: 'none', transition: 'all .3s cubic-bezier(.22,1,.36,1)', boxSizing: 'border-box',
        }}>
          <span>View Details</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: hov ? 'translateX(3px)' : 'translateX(0)', transition: 'transform .3s cubic-bezier(.22,1,.36,1)' }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: hov ? '100%' : '0%', background: 'linear-gradient(to right, #d28c3c, #e8a055)', transition: 'width .45s cubic-bezier(.22,1,.36,1)', zIndex: 4 }} />
    </article>
  );
}
