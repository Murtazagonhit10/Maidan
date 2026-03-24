'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import '@/app/tokens.css';

import VenuesHero from './VenuesHero';
import VenueFilterBar from './VenueFilterBar';
import VenueCard from './VenueCard';
import { VENUES, PRICE_MIN, PRICE_MAX, QUICK_PICKS } from './venuesData';

const PER_PAGE = 9;

const DEFAULT_FILTERS = {
  sport: [], city: '',
  priceMin: PRICE_MIN, priceMax: PRICE_MAX,
  minRating: 0, sortBy: 'recommended', quickPick: '',
};

function EmptyState({ onClear }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem', textAlign: 'center', animation: 'vcFadeUp .5s cubic-bezier(.22,1,.36,1)' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(210,140,60,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.6rem', animation: 'emptyPulse 2.5s ease-in-out infinite' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(210,140,60,.55)" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </div>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-.03em', color: '#f5efe6', marginBottom: '.65rem' }}>No venues found.</h3>
      <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.9rem', color: 'rgba(245,239,230,.38)', lineHeight: 1.78, maxWidth: '380px', marginBottom: '1.8rem' }}>
        Try widening the price range, removing a sport filter, or selecting a different city.
      </p>
      <button type="button" onClick={onClear}
        style={{ padding: '.75rem 2rem', background: 'rgba(210,140,60,.12)', border: '1px solid rgba(210,140,60,.38)', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#d28c3c', transition: 'all .25s' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(210,140,60,.22)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(210,140,60,.12)'}
      >
        Clear all filters
      </button>
    </div>
  );
}

function PagBtn({ children, active, disabled, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#d28c3c' : hov ? 'rgba(210,140,60,.1)' : 'rgba(245,239,230,.04)', border: `1px solid ${active ? '#d28c3c' : hov ? 'rgba(210,140,60,.35)' : 'rgba(245,239,230,.1)'}`, borderRadius: '2px', fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', fontWeight: active ? 700 : 500, color: active ? '#0f0a06' : disabled ? 'rgba(245,239,230,.2)' : 'rgba(245,239,230,.6)', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .22s cubic-bezier(.22,1,.36,1)' }}>
      {children}
    </button>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem', marginTop: '3.5rem' }}>
      <PagBtn disabled={page === 1} onClick={() => onChange(page - 1)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </PagBtn>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <PagBtn key={p} active={p === page} onClick={() => onChange(p)}>{p}</PagBtn>
      ))}
      <PagBtn disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </PagBtn>
    </div>
  );
}

export default function VenuesPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);

  const filtered = useMemo(() => {
    let list = [...VENUES];
    if (filters.quickPick) {
      const qp = QUICK_PICKS.find(q => q.id === filters.quickPick);
      if (qp) list = list.filter(qp.filter);
    } else {
      if (filters.sport.length > 0) list = list.filter(v => filters.sport.some(s => v.sports.includes(s)));
      if (filters.city) list = list.filter(v => v.City === filters.city);
      list = list.filter(v => v.minPrice <= filters.priceMax && v.maxPrice >= filters.priceMin);
      if (filters.minRating > 0) list = list.filter(v => v.avgRating >= filters.minRating);
    }
    switch (filters.sortBy) {
      case 'rating_desc': list.sort((a, b) => b.avgRating - a.avgRating); break;
      case 'price_asc': list.sort((a, b) => a.minPrice - b.minPrice); break;
      case 'price_desc': list.sort((a, b) => b.maxPrice - a.maxPrice); break;
      case 'newest': list.sort((a, b) => new Date(b.RegistrationDate) - new Date(a.RegistrationDate)); break;
      default: list.sort((a, b) => (b.avgRating * Math.log(b.reviewCount + 1)) - (a.avgRating * Math.log(a.reviewCount + 1)));
    }
    return list;
  }, [filters]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = useCallback((next) => {
    setFilters(next);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => { setFilters(DEFAULT_FILTERS); setPage(1); }, []);

  const handlePageChange = (p) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{`
        :root { --bg:#0f0a06;--surface:#130e08;--card:#1a1108;--amber:#d28c3c;--cream:#f5efe6;--muted:rgba(245,239,230,.45);--border:rgba(210,140,60,.14);--serif:'Syne',sans-serif;--body:'Mulish',sans-serif; }
        @keyframes vcFadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes emptyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(210,140,60,0);border-color:rgba(210,140,60,.25)} 50%{box-shadow:0 0 0 10px rgba(210,140,60,.05);border-color:rgba(210,140,60,.55)} }
        .venues-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        @media(max-width:1100px){ .venues-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:660px) { .venues-grid{grid-template-columns:1fr;} }
        select option { background:#1a1108;color:#f5efe6; }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#0f0a06} ::-webkit-scrollbar-thumb{background:rgba(210,140,60,.22);border-radius:3px}
      `}</style>

      <Navbar />

      <VenuesHero
        totalVenues={VENUES.length}
        totalCities={new Set(VENUES.map(v => v.City)).size}
        totalSports={3}
      />

      <VenueFilterBar
        filters={filters}
        onChange={handleFilterChange}
        resultCount={filtered.length}
        allVenues={VENUES}
      />

      <main style={{ background: 'var(--bg)', minHeight: '60vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(210,140,60,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(210,140,60,.022) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div ref={gridRef} style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '3.5rem 3rem 5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.4rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ width: 14, height: 1, background: '#d28c3c', display: 'block' }} />
                {filters.quickPick ? QUICK_PICKS.find(q => q.id === filters.quickPick)?.label ?? 'Filtered'
                  : filters.sport.length > 0 ? filters.sport.join(' & ')
                    : filters.city ? `${filters.city} Venues`
                      : 'All Venues'}
              </div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem,2.5vw,2.4rem)', letterSpacing: '-.03em', color: '#f5efe6', lineHeight: 1 }}>
                {filtered.length > 0
                  ? <>{filtered.length} venue{filtered.length !== 1 ? 's' : ''} <span style={{ color: '#d28c3c' }}>found.</span></>
                  : <>No venues <span style={{ color: '#d28c3c' }}>found.</span></>}
              </h2>
            </div>
            {totalPages > 1 && <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.72rem', color: 'rgba(245,239,230,.3)' }}>Page {page} of {totalPages}</span>}
          </div>

          <div className="venues-grid">
            {pageItems.length === 0
              ? <EmptyState onClear={clearFilters} />
              : pageItems.map((venue, i) => <VenueCard key={venue.VenueID} venue={venue} index={i} />)
            }
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </div>
      </main>

      {/* Footer CTA */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid rgba(210,140,60,.1)', padding: '3.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '.5rem' }}>Own a facility?</div>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(1.2rem,2vw,1.8rem)', letterSpacing: '-.03em', color: '#f5efe6', lineHeight: 1 }}>
            List your venue on <span style={{ color: '#d28c3c' }}>Maidan.</span>
          </h3>
          <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.85rem', color: 'rgba(245,239,230,.4)', marginTop: '.5rem', maxWidth: 420 }}>
            Reach thousands of players instantly. Manage bookings, slots and payments in one dashboard.
          </p>
        </div>
        <a href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.88rem 2.2rem', background: '#d28c3c', color: '#0f0a06', fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px', transition: 'background .25s, box-shadow .25s', flexShrink: 0 }}
          onMouseOver={e => { e.currentTarget.style.background = '#e8a055'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(210,140,60,.35)'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#d28c3c'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          List Your Venue
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </a>
      </div>
    </>
  );
}