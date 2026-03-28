'use client';
import { useState, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   VenueFilterBar  —  Now accepts dynamic data from API
═══════════════════════════════════════════════════════ */

/* ── Quick Pick card ── */
const QP_META = {
  top_rated: { icon: '', title: 'Top Rated', sub: 'Rating 4.7+', color: '#d4a030', bg: 'rgba(212,160,48,.16)' },
  budget: { icon: '', title: 'Budget Pick', sub: 'Under Rs.1,200/hr', color: '#50c878', bg: 'rgba(80,200,120,.14)' },
  multi_sport: { icon: '', title: 'Multi-Sport', sub: '2+ sports on site', color: '#d28c3c', bg: 'rgba(210,140,60,.16)' },
  new: { icon: '', title: 'Newly Added', sub: 'Listed after Aug', color: '#a78bfa', bg: 'rgba(167,139,250,.14)' },
  lahore: { icon: '', title: 'Lahore Only', sub: 'City of venues', color: '#f87171', bg: 'rgba(248,113,113,.14)' },
};

const QUICK_PICKS = [
  { id: 'top_rated', label: 'Top Rated', filter: v => v.avgRating >= 4.7 },
  { id: 'budget', label: 'Budget Friendly', filter: v => (v.minPrice || 0) <= 1200 },
  { id: 'multi_sport', label: 'Multi-Sport', filter: v => v.sports && v.sports.split(',').length > 1 },
  { id: 'new', label: 'Recently Added', filter: v => new Date(v.RegistrationDate) > new Date('2023-08-01') },
  { id: 'lahore', label: 'Lahore Only', filter: v => v.City === 'Lahore' },
];

function QuickPickCard({ qp, active, onClick, count }) {
  const [hov, setHov] = useState(false);
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const ref = useRef(null);
  const meta = QP_META[qp.id] || { icon: '🔥', title: qp.label, sub: '', color: '#d28c3c', bg: 'rgba(210,140,60,.16)' };

  const onMove = e => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setShine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <button ref={ref} type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onMouseMove={onMove}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        padding: '.85rem 1.15rem', minWidth: '128px', flexShrink: 0,
        background: active ? meta.bg : hov ? 'rgba(210,140,60,.07)' : 'rgba(245,239,230,.02)',
        border: `1.5px solid ${active ? meta.color : hov ? 'rgba(210,140,60,.35)' : 'rgba(245,239,230,.08)'}`,
        borderRadius: '8px', cursor: 'pointer',
        transform: active ? 'translateY(-3px) scale(1.02)' : hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: active ? `0 8px 24px ${meta.bg}, 0 0 0 1px ${meta.color}22 inset` : hov ? '0 4px 16px rgba(210,140,60,.12)' : 'none',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
      }}>
      {(active || hov) && <div style={{ position: 'absolute', top: 0, left: hov && !active ? '25%' : '15%', right: hov && !active ? '25%' : '15%', height: active ? '2px' : '1.5px', background: `linear-gradient(to right, transparent, ${active ? meta.color : 'rgba(210,140,60,.5)'}, transparent)`, transition: 'all .35s cubic-bezier(.22,1,.36,1)' }} />}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: (hov || active) ? 1 : 0, transition: 'opacity .3s', background: `radial-gradient(circle 90px at ${shine.x}% ${shine.y}%, ${active ? meta.bg : 'rgba(210,140,60,.08)'} 0%, transparent 70%)` }} />
      {active && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,.06) 50%,transparent 70%)', animation: 'qpShimmer 2.4s ease-in-out infinite' }} />}
      <span style={{ fontSize: '1.35rem', lineHeight: 1, marginBottom: '.38rem', filter: active ? `drop-shadow(0 0 6px ${meta.color}88)` : hov ? 'drop-shadow(0 0 5px rgba(210,140,60,.6))' : 'none', transition: 'filter .3s' }}>{meta.icon}</span>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.8rem', letterSpacing: '-.01em', color: active ? '#f5efe6' : hov ? '#f5efe6' : 'rgba(245,239,230,.42)', lineHeight: 1.2, transition: 'color .25s' }}>{meta.title}</div>
      <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', letterSpacing: '.07em', color: active ? meta.color : hov ? '#d28c3c' : 'rgba(245,239,230,.25)', marginTop: '.16rem', transition: 'color .25s' }}>{meta.sub}</div>
      {count > 0 && (
        <div style={{ position: 'absolute', top: '.5rem', right: '.5rem', background: active ? meta.color : hov ? 'rgba(210,140,60,.2)' : 'rgba(245,239,230,.1)', color: active ? '#0f0a06' : hov ? '#d28c3c' : 'rgba(245,239,230,.38)', fontFamily: "'Mulish',sans-serif", fontSize: '.55rem', fontWeight: 700, borderRadius: '20px', padding: '.08rem .38rem', minWidth: 18, textAlign: 'center', transition: 'all .25s' }}>
          {count}
        </div>
      )}
    </button>
  );
}

/* ── Sport icon SVGs ── */
function CricketIcon({ size = 42, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="26" y="6" width="12" height="34" rx="4" fill={color} opacity=".9" />
      <rect x="29.5" y="8" width="5" height="30" rx="2" fill="white" opacity=".2" />
      <rect x="30" y="40" width="4" height="14" rx="2" fill={color} opacity=".6" />
      {[42, 46, 50].map(y => <rect key={y} x="29" y={y} width="6" height="1.5" rx="1" fill="white" opacity=".3" />)}
      <circle cx="14" cy="20" r="7" fill="#c0392b" opacity=".92" />
      <path d="M9 17 Q14 14 19 17" stroke="white" strokeWidth="1.2" fill="none" opacity=".5" />
      <path d="M9 23 Q14 26 19 23" stroke="white" strokeWidth="1.2" fill="none" opacity=".5" />
    </svg>
  );
}
function FootballIcon({ size = 42, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" fill={color} opacity=".9" />
      <polygon points="32,21 41,27.5 37.5,39 26.5,39 23,27.5" fill="rgba(0,0,0,.7)" />
      <polygon points="18,28 23,22 23,27.5 18,28" fill="rgba(0,0,0,.5)" />
      <polygon points="46,28 41,22 41,27.5 46,28" fill="rgba(0,0,0,.5)" />
      <polygon points="22,45 26.5,39 28,44" fill="rgba(0,0,0,.5)" />
      <polygon points="42,45 37.5,39 36,44" fill="rgba(0,0,0,.5)" />
    </svg>
  );
}
function PadelIcon({ size = 42, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="18" y="6" width="28" height="34" rx="10" fill={color} opacity=".9" />
      {[22, 27, 32, 37, 42].map(x => <line key={`v${x}`} x1={x} y1="11" x2={x} y2="35" stroke="white" strokeWidth="1" opacity=".25" />)}
      {[12, 17, 22, 27, 32].map(y => <line key={`h${y}`} x1="19" y1={y} x2="45" y2={y} stroke="white" strokeWidth="1" opacity=".25" />)}
      <path d="M26 40 L30 48 L34 40 Z" fill={color} opacity=".7" />
      <rect x="28.5" y="48" width="7" height="14" rx="3" fill={color} opacity=".6" />
    </svg>
  );
}
const SPORT_META = {
  'Turf Cricket': { Icon: CricketIcon, label: 'Cricket', sub: 'Nets & Turf' },
  'Futsal': { Icon: FootballIcon, label: 'Futsal', sub: 'Indoor Courts' },
  'Padel': { Icon: PadelIcon, label: 'Padel', sub: 'Glass Courts' },
};

function SportCard({ sport, active, onClick }) {
  const [hov, setHov] = useState(false);
  const { Icon, label, sub } = SPORT_META[sport];
  const lit = active || hov;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '1rem 1.2rem', background: active ? 'rgba(210,140,60,.18)' : hov ? 'rgba(210,140,60,.07)' : 'rgba(245,239,230,.03)', border: `1.5px solid ${active ? '#d28c3c' : hov ? 'rgba(210,140,60,.35)' : 'rgba(245,239,230,.1)'}`, borderRadius: '8px', cursor: 'pointer', transform: active ? 'translateY(-3px)' : hov ? 'translateY(-2px)' : 'translateY(0)', boxShadow: active ? '0 8px 24px rgba(210,140,60,.28)' : hov ? '0 4px 16px rgba(210,140,60,.12)' : 'none', transition: 'all .3s cubic-bezier(.22,1,.36,1)', position: 'relative', overflow: 'hidden', minWidth: '86px' }}>
      {active && <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1.5px', background: 'linear-gradient(to right,transparent,#d28c3c,transparent)' }} />}
      <Icon size={40} color={lit ? '#d28c3c' : 'rgba(245,239,230,.3)'} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.78rem', color: lit ? '#f5efe6' : 'rgba(245,239,230,.42)', transition: 'color .25s' }}>{label}</div>
        <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.57rem', color: lit ? '#d28c3c' : 'rgba(245,239,230,.2)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: '.08rem', transition: 'color .25s' }}>{sub}</div>
      </div>
    </button>
  );
}

function CityPill({ city, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '.48rem 1.05rem', background: active ? 'rgba(210,140,60,.18)' : hov ? 'rgba(210,140,60,.06)' : 'rgba(245,239,230,.03)', border: `1px solid ${active ? '#d28c3c' : hov ? 'rgba(210,140,60,.3)' : 'rgba(245,239,230,.1)'}`, borderRadius: '100px', fontFamily: "'Mulish',sans-serif", fontSize: '.73rem', fontWeight: active ? 700 : 500, letterSpacing: '.06em', color: active ? '#d28c3c' : hov ? 'rgba(245,239,230,.7)' : 'rgba(245,239,230,.38)', cursor: 'pointer', transform: active ? 'scale(1.04)' : 'scale(1)', boxShadow: active ? '0 4px 16px rgba(210,140,60,.2)' : 'none', transition: 'all .25s cubic-bezier(.22,1,.36,1)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? '#d28c3c' : 'rgba(245,239,230,.2)', flexShrink: 0, transition: 'background .25s' }} />
      {city}
    </button>
  );
}

function PriceSlider({ min, max, valueMin, valueMax, onChange }) {
  const trackRef = useRef(null);
  const pct = v => ((v - min) / (max - min)) * 100;
  const drag = (which, e) => {
    e.preventDefault();
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const move = ev => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const raw = Math.round(((cx - rect.left) / rect.width) * (max - min) + min);
      const c = Math.max(min, Math.min(max, raw));
      if (which === 'lo') onChange(Math.min(c, valueMax - 200), valueMax);
      else onChange(valueMin, Math.max(c, valueMin + 200));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#d28c3c' }}>Rs. {valueMin.toLocaleString()}</span>
        <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.6rem', color: 'rgba(245,239,230,.28)', alignSelf: 'flex-end' }}>per hr</span>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.85rem', color: '#d28c3c' }}>Rs. {valueMax.toLocaleString()}</span>
      </div>
      <div ref={trackRef} style={{ position: 'relative', height: 5, background: 'rgba(245,239,230,.08)', borderRadius: 3, margin: '12px 0 4px' }}>
        <div style={{ position: 'absolute', height: '100%', left: `${pct(valueMin)}%`, width: `${pct(valueMax) - pct(valueMin)}%`, background: 'linear-gradient(to right,#d28c3c,#e8a055)', borderRadius: 3 }} />
        {[['lo', valueMin], ['hi', valueMax]].map(([w, v]) => (
          <div key={w} onMouseDown={e => drag(w, e)} onTouchStart={e => drag(w, e)}
            style={{ position: 'absolute', top: '50%', left: `${pct(v)}%`, transform: 'translate(-50%,-50%)', width: 20, height: 20, borderRadius: '50%', background: '#d28c3c', border: '3px solid #0f0a06', cursor: 'grab', zIndex: 2, boxShadow: '0 0 0 4px rgba(210,140,60,.25)', transition: 'box-shadow .2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 7px rgba(210,140,60,.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 4px rgba(210,140,60,.25)'; }} />
        ))}
      </div>
    </div>
  );
}

function RatingRow({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '.42rem' }}>
      {[{ v: 0, l: 'Any' }, { v: 3.5, l: '3.5+' }, { v: 4.0, l: '4.0+' }, { v: 4.5, l: '4.5+' }].map(o => {
        const a = value === o.v;
        return (
          <button key={o.v} type="button" onClick={() => onChange(a ? 0 : o.v)}
            style={{ padding: '.42rem .82rem', background: a ? 'rgba(210,140,60,.18)' : 'rgba(245,239,230,.03)', border: `1px solid ${a ? '#d28c3c' : 'rgba(245,239,230,.1)'}`, borderRadius: 4, fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', fontWeight: a ? 700 : 400, color: a ? '#d28c3c' : 'rgba(245,239,230,.38)', cursor: 'pointer', transition: 'all .22s', display: 'flex', alignItems: 'center', gap: '.22rem' }}>
            {o.v > 0 && <span style={{ color: '#c9a84c', fontSize: '.65rem' }}>★</span>}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

const SORT_OPTS = [
  { v: 'recommended', l: '🔥 Best Match' }, { v: 'rating_desc', l: '⭐ Top Rated' },
  { v: 'price_asc', l: '💚 Cheapest' }, { v: 'price_desc', l: '💎 Premium' }, { v: 'newest', l: '✨ Newest' },
];
function SortTabs({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '.38rem', flexWrap: 'wrap' }}>
      {SORT_OPTS.map(o => {
        const a = value === o.v;
        return (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            style={{ padding: '.4rem .82rem', background: a ? '#d28c3c' : 'rgba(245,239,230,.03)', border: `1px solid ${a ? '#d28c3c' : 'rgba(245,239,230,.1)'}`, borderRadius: 4, fontFamily: "'Mulish',sans-serif", fontSize: '.68rem', fontWeight: a ? 700 : 400, color: a ? '#0f0a06' : 'rgba(245,239,230,.38)', cursor: 'pointer', transition: 'all .25s cubic-bezier(.22,1,.36,1)', transform: a ? 'scale(1.02)' : 'scale(1)', whiteSpace: 'nowrap' }}>
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

const SL = ({ children }) => (
  <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,239,230,.28)', marginBottom: '.62rem', display: 'flex', alignItems: 'center', gap: '.38rem' }}>
    <span style={{ width: 10, height: 1, background: 'rgba(210,140,60,.4)', display: 'block' }} />
    {children}
  </div>
);

/* ════════════════════════════════════════════════════════
   MAIN EXPORT — accepts dynamic data from parent
════════════════════════════════════════════════════════ */
export default function VenueFilterBar({
  filters,
  onChange,
  resultCount,
  allVenues = [],
  priceMin = 0,
  priceMax = 5000,
  allSports = [],
  allCities = []
}) {
  const { sport, city, minRating, sortBy, quickPick } = filters;
  const [open, setOpen] = useState(window.innerWidth > 768);

  const activeCount = [sport.length > 0, city !== '', filters.priceMin > priceMin || filters.priceMax < priceMax, minRating > 0, quickPick !== ''].filter(Boolean).length;
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const toggleSport = s => set('sport', sport.includes(s) ? sport.filter(x => x !== s) : [...sport, s]);
  const clearAll = () => onChange({ sport: [], city: '', priceMin: priceMin, priceMax: priceMax, minRating: 0, sortBy: 'recommended', quickPick: '' });

  const qpCounts = {};
  QUICK_PICKS.forEach(qp => { qpCounts[qp.id] = allVenues.filter(qp.filter).length; });

  return (
    <>
      <style>{`
  @keyframes qpShimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
  
  .filter-panel-body {
    max-height: none;
    overflow: visible;
    transition: max-height .42s cubic-bezier(.22,1,.36,1);
  }
  .filter-panel-body.closed { max-height: 0; }
  
  /* Large screens (default) */
  .filter-main-grid {
    display: grid;
    grid-template-columns: auto 1px auto 1px minmax(280px, 1fr) 1px auto;
    gap: 0 1.2rem;
    align-items: start;
  }
  
  /* Medium screens (1300px and below) */
  @media (max-width: 1300px) {
    .filter-main-grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    .filter-col-divider {
      display: none !important;
    }
  }
  
  /* Tablet (1100px and below) */
  @media (max-width: 1100px) {
    .filter-main-grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
    .filter-col-divider {
      display: none !important;
    }
  }
  
  /* Mobile (768px and below) */
  @media (max-width: 768px) {
    .filter-mobile-btn { display: flex !important; }
    .filter-quick-row { 
      padding-left: 1.25rem !important; 
      padding-right: 1.25rem !important;
      padding-top: 1rem !important;
      padding-bottom: 1rem !important;
    }
    .filter-main-wrap { 
      padding-left: 1.25rem !important; 
      padding-right: 1.25rem !important; 
    }
  }
`}</style>

      <div
        style={{
          background: 'rgba(12,8,4,.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(245,239,230,.07)',
          borderTop: '1px solid rgba(210,140,60,.1)',
        }}
      >

        <div className="filter-quick-row"
          style={{ padding: '.95rem 3rem .88rem', borderBottom: '1px solid rgba(245,239,230,.05)', display: 'flex', alignItems: 'center', gap: '.65rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.42rem', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(245,239,230,.28)', whiteSpace: 'nowrap' }}>
              Quick Picks
            </span>
            {quickPick && (
              <button type="button" onClick={() => set('quickPick', '')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Mulish',sans-serif", fontSize: '.6rem', color: 'rgba(245,239,230,.28)', letterSpacing: '.08em', transition: 'color .2s', padding: '0 .3rem' }}
                onMouseOver={e => e.currentTarget.style.color = '#d28c3c'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(245,239,230,.28)'}
              >✕ clear</button>
            )}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '.65rem', overflowX: 'auto', flex: 1,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            paddingBottom: '2px',
          }}>
            {QUICK_PICKS.map(qp => (
              <QuickPickCard key={qp.id} qp={qp} active={quickPick === qp.id} count={qpCounts[qp.id] || 0}
                onClick={() => set('quickPick', quickPick === qp.id ? '' : qp.id)} />
            ))}
          </div>

          <button type="button" onClick={() => setOpen(o => !o)}
            className="filter-mobile-btn"
            style={{ display: 'none', flexShrink: 0, alignItems: 'center', gap: '.4rem', padding: '.35rem .75rem', background: 'rgba(245,239,230,.04)', border: '1px solid rgba(245,239,230,.12)', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Mulish',sans-serif", fontSize: '.68rem', color: 'rgba(245,239,230,.4)', whiteSpace: 'nowrap' }}>
            {open ? '↑ Filters' : '↓ Filters'}
            {activeCount > 0 && <span style={{ background: '#d28c3c', color: '#0f0a06', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.58rem', fontWeight: 700 }}>{activeCount}</span>}
          </button>
        </div>

        <div className={`filter-panel-body${open ? '' : ' closed'}`}>
          <div className="filter-main-wrap"
            style={{ padding: '1.2rem 3rem 1.35rem' }}>
            <div className="filter-main-grid"
              style={{ display: 'grid', gridTemplateColumns: 'auto 1px auto 1px minmax(280px, 1fr) 1px auto', gap: '0 1.2rem', alignItems: 'start' }}>

              <div>
                <SL>Sport</SL>
                <div style={{ display: 'flex', gap: '.62rem', flexWrap: 'wrap' }}>
                  {allSports.map(s => <SportCard key={s} sport={s} active={sport.includes(s)} onClick={() => toggleSport(s)} />)}
                </div>
              </div>
              <div className="filter-col-divider" style={{ background: 'rgba(245,239,230,.07)', alignSelf: 'stretch' }} />

              <div>
                <SL>City</SL>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  <CityPill city="All Cities" active={city === ''} onClick={() => set('city', '')} />
                  {allCities.map(c => <CityPill key={c} city={c} active={city === c} onClick={() => set('city', city === c ? '' : c)} />)}
                </div>
              </div>
              <div className="filter-col-divider" style={{ background: 'rgba(245,239,230,.07)', alignSelf: 'stretch' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                <div>
                  <SL>Price / Hour</SL>
                  <PriceSlider min={priceMin} max={priceMax} valueMin={filters.priceMin} valueMax={filters.priceMax}
                    onChange={(lo, hi) => onChange({ ...filters, priceMin: lo, priceMax: hi })} />
                </div>
                <div>
                  <SL>Min Rating</SL>
                  <RatingRow value={minRating} onChange={v => set('minRating', v)} />
                </div>
                <div>
                  <SL>Sort By</SL>
                  <SortTabs value={sortBy} onChange={v => set('sortBy', v)} />
                </div>
              </div>
              <div className="filter-col-divider" style={{ background: 'rgba(245,239,230,.07)', alignSelf: 'stretch' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minWidth: '110px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '2.3rem', color: '#d28c3c', lineHeight: 1, letterSpacing: '-.04em' }}>{resultCount}</div>
                  <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,239,230,.3)', marginTop: '.14rem' }}>
                    venue{resultCount !== 1 ? 's' : ''}
                  </div>
                </div>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll}
                    style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem 1rem', background: 'rgba(220,80,60,.1)', border: '1px solid rgba(220,80,60,.3)', borderRadius: 4, cursor: 'pointer', fontFamily: "'Mulish',sans-serif", fontSize: '.67rem', fontWeight: 600, letterSpacing: '.08em', color: 'rgba(220,80,60,.85)', transition: 'all .22s', marginTop: 'auto' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(220,80,60,.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(220,80,60,.1)'}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear ({activeCount})
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}