'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VenueHero from './VenueIdHero';
import VenueInfo from './VenueInfo';
import CourtCard from '@/components/CourtCard';
import ReviewCard from '@/components/ReviewCard';
import RatingBreakdown from '@/components/RatingBreakdown';
import '@/app/tokens.css';

/* ════════════════════════════════════════════════════════
   SECTION HEADER — reusable eyebrow + title component
════════════════════════════════════════════════════════ */
function SectionHeader({ eyebrow, title, titleHighlight, sub }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
            { threshold: 0.2 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            marginBottom: '2rem',
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)',
        }}>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '.45rem',
                fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase',
                color: '#d28c3c', marginBottom: '.7rem',
            }}>
                <span style={{ width: 16, height: 1, background: '#d28c3c', display: 'block' }} />
                {eyebrow}
            </div>
            <h2 style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                letterSpacing: '-.04em', color: '#f5efe6',
                lineHeight: .96, margin: 0,
            }}>
                {title}{' '}
                {titleHighlight && <span style={{ color: '#d28c3c' }}>{titleHighlight}</span>}
            </h2>
            {sub && (
                <p style={{
                    fontFamily: "'Mulish',sans-serif", fontWeight: 300,
                    fontSize: '.9rem', color: 'rgba(245,239,230,.42)',
                    marginTop: '.7rem', maxWidth: 480, lineHeight: 1.7,
                }}>
                    {sub}
                </p>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════════════════ */
function LoadingSkeleton() {
    return (
        <>
            <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skel {
          background: linear-gradient(90deg, #1a1108 25%, #221508 50%, #1a1108 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
      `}</style>
            <div style={{ background: '#0f0a06', minHeight: '100vh' }}>
                <div className="skel" style={{ height: '70vh', width: '100%' }} />
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 5rem' }}>
                    <div className="skel" style={{ height: 28, width: 200, marginBottom: '1rem' }} />
                    <div className="skel" style={{ height: 48, width: '60%', marginBottom: '.7rem' }} />
                    <div className="skel" style={{ height: 48, width: '40%', marginBottom: '3rem' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
                        {[0, 1, 2].map(i => <div key={i} className="skel" style={{ height: 320 }} />)}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ════════════════════════════════════════════════════════
   ERROR STATE
════════════════════════════════════════════════════════ */
function ErrorState({ message }) {
    return (
        <div style={{ background: '#0f0a06', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.6rem', color: '#f5efe6', marginBottom: '.6rem' }}>
                    Venue Not Found
                </h2>
                <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.9rem', color: 'rgba(245,239,230,.4)', marginBottom: '2rem' }}>
                    {message || 'This venue may be inactive or does not exist.'}
                </p>
                <Link href="/venues" style={{
                    display: 'inline-block', padding: '.8rem 2rem',
                    background: '#d28c3c', color: '#0f0a06',
                    fontFamily: "'Mulish',sans-serif", fontSize: '.75rem',
                    fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
                    textDecoration: 'none', borderRadius: '2px',
                }}>
                    Browse All Venues
                </Link>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE — Next.js 15: params is a Promise → React.use()
════════════════════════════════════════════════════════ */
export default function VenueDetailPage({ params }) {
    /* Next.js 15: unwrap params Promise with React.use() */
    const { id } = use(params);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('courts'); /* 'courts' | 'reviews' */

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/venues/${id}`)
            .then(r => {
                if (!r.ok) throw new Error(r.status === 404 ? 'Venue not found' : 'Failed to load venue');
                return r.json();
            })
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [id]);

    if (loading) return <><Navbar /><LoadingSkeleton /></>;
    if (error || !data) return <><Navbar /><ErrorState message={error} /></>;

    const { venue, courts, reviews, sports, stats } = data;

    /* Group courts by sport */
    const courtsBySport = courts.reduce((acc, c) => {
        if (!acc[c.SportName]) acc[c.SportName] = [];
        acc[c.SportName].push(c);
        return acc;
    }, {});

    return (
        <>
            <style>{`
        * { box-sizing: border-box; }
        body { background: #0f0a06; }

        /* Grid texture overlay */
        .vd-root::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(210,140,60,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210,140,60,.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .vd-container {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 0 clamp(1.25rem, 5vw, 5rem);
        }

        .vd-section {
          padding: clamp(2.5rem, 5vw, 4.5rem) 0;
          border-top: 1px solid rgba(210,140,60,.08);
        }

        /* Tab bar */
        .vd-tabs {
          display: flex; gap: 0;
          border-bottom: 1px solid rgba(210,140,60,.12);
          margin-bottom: 2.5rem;
        }
        .vd-tab {
          padding: .85rem 1.6rem;
          background: none; border: none; border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          fontFamily: 'Mulish',sans-serif; font-size: .75rem;
          font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer; transition: all .25s; color: rgba(245,239,230,.4);
        }
        .vd-tab:hover { color: rgba(245,239,230,.75); }
        .vd-tab.active {
          color: #d28c3c;
          border-bottom-color: #d28c3c;
        }

        /* Courts grid */
        .courts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.4rem;
        }

        /* Reviews grid */
        .reviews-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 2rem;
          align-items: start;
        }

        /* Sport section divider */
        .sport-section-label {
          display: flex; align-items: center; gap: .8rem;
          margin-bottom: 1.2rem; margin-top: 2rem;
          font-family: 'Syne',sans-serif; font-weight: 700;
          font-size: .88rem; letter-spacing: .06em;
          color: rgba(245,239,230,.5); text-transform: uppercase;
        }
        .sport-section-label:first-child { margin-top: 0; }
        .sport-section-label::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(210,140,60,.1);
        }

        /* Sticky book bar (mobile) */
        .vd-book-bar {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          padding: 1rem 1.5rem;
          background: rgba(15,10,6,.96);
          border-top: 1px solid rgba(210,140,60,.2);
          backdrop-filter: blur(12px);
          z-index: 200;
        }

        @media(max-width: 960px) {
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width: 768px) {
          .courts-grid { grid-template-columns: 1fr !important; }
          .vd-book-bar { display: flex; gap: 1rem; align-items: center; }
        }
        @media(max-width: 480px) {
          .vd-tabs { overflow-x: auto; }
          .vd-tab { padding: .7rem 1rem; white-space: nowrap; }
        }
      `}</style>

            <Navbar />

            <div className="vd-root" style={{ background: '#0f0a06', minHeight: '100vh', paddingBottom: '50px' }}>

                {/* ── Hero ── */}
                <VenueHero venue={venue} stats={stats} sports={sports} />

                {/* ── About ── */}
                <div className="vd-section">
                    <div className="vd-container">
                        <VenueInfo venue={venue} />
                    </div>
                </div>

                {/* ── Tabs: Courts / Reviews ── */}
                <div className="vd-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="vd-container">
                        <div className="vd-tabs">
                            <button
                                className={`vd-tab${activeTab === 'courts' ? ' active' : ''}`}
                                onClick={() => setActiveTab('courts')}
                                style={{ fontFamily: "'Mulish',sans-serif" }}
                            >
                                Courts ({courts.length})
                            </button>
                            <button
                                className={`vd-tab${activeTab === 'reviews' ? ' active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                                style={{ fontFamily: "'Mulish',sans-serif" }}
                            >
                                Reviews {stats.totalReviews > 0 && `(${stats.totalReviews})`}
                            </button>
                        </div>

                        {/* ── COURTS TAB ── */}
                        {activeTab === 'courts' && (
                            <div>
                                <SectionHeader
                                    eyebrow="Book a Court"
                                    title="Available"
                                    titleHighlight="Courts"
                                    sub={`${courts.length} court${courts.length !== 1 ? 's' : ''} available across ${Object.keys(courtsBySport).length} sport${Object.keys(courtsBySport).length !== 1 ? 's' : ''}`}
                                />

                                {courts.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center', padding: '4rem 2rem',
                                        fontFamily: "'Mulish',sans-serif", fontSize: '.9rem',
                                        color: 'rgba(245,239,230,.35)',
                                    }}>
                                        No courts currently available.
                                    </div>
                                ) : (
                                    Object.entries(courtsBySport).map(([sport, sportCourts]) => (
                                        <div key={sport}>
                                            <div className="sport-section-label">
                                                {sport}
                                            </div>
                                            <div className="courts-grid">
                                                {sportCourts.map((court, i) => (
                                                    <CourtCard
                                                        key={court.CourtID}
                                                        court={court}
                                                        venueId={id}
                                                        index={i}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── REVIEWS TAB ── */}
                        {activeTab === 'reviews' && (
                            <div>
                                <SectionHeader
                                    eyebrow="Player Reviews"
                                    title="What People"
                                    titleHighlight="Say."
                                    sub={stats.totalReviews > 0
                                        ? `${stats.totalReviews} verified review${stats.totalReviews !== 1 ? 's' : ''} from confirmed bookings`
                                        : 'No reviews yet — be the first to book and review.'}
                                />

                                {stats.totalReviews === 0 ? (
                                    <div style={{
                                        textAlign: 'center', padding: '4rem 2rem',
                                        fontFamily: "'Mulish',sans-serif", fontSize: '.9rem',
                                        color: 'rgba(245,239,230,.35)',
                                    }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                                        No reviews yet. Book a court to leave the first one.
                                    </div>
                                ) : (
                                    <div className="reviews-grid">
                                        {/* Reviews list */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {reviews.map((r, i) => (
                                                <ReviewCard key={r.ReviewID} review={r} index={i} />
                                            ))}
                                        </div>

                                        {/* Rating breakdown — sticky */}
                                        <div style={{ position: 'sticky', top: '5rem' }}>
                                            <RatingBreakdown stats={stats} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom CTA ── */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(20,16,8,.95), rgba(10,7,4,.98))',
                    borderTop: '1px solid rgba(210,140,60,.12)',
                    padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 5rem)',
                }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <div style={{
                                fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                                fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase',
                                color: '#d28c3c', marginBottom: '.5rem',
                            }}>Ready to play?</div>
                            <h3 style={{
                                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                                fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                                letterSpacing: '-.03em', color: '#f5efe6', margin: 0, lineHeight: 1.1,
                            }}>
                                Book your court at<br />
                                <span style={{ color: '#d28c3c' }}>{venue.Name}</span>
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                            {venue.ContactNumber && (
                                <a href={`tel:${venue.ContactNumber}`} style={{
                                    padding: '.82rem 1.6rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(210,140,60,.38)',
                                    borderRadius: '2px',
                                    fontFamily: "'Mulish',sans-serif", fontSize: '.75rem',
                                    fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
                                    color: '#d28c3c', textDecoration: 'none',
                                    transition: 'all .25s',
                                }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(210,140,60,.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    📞 Call Venue
                                </a>
                            )}
                            <button
                                onClick={() => setActiveTab('courts')}
                                style={{
                                    padding: '.82rem 2rem',
                                    background: '#d28c3c', color: '#0f0a06',
                                    border: 'none', borderRadius: '2px', cursor: 'pointer',
                                    fontFamily: "'Mulish',sans-serif", fontSize: '.75rem',
                                    fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                                    transition: 'background .25s, transform .25s',
                                    display: 'flex', alignItems: 'center', gap: '.5rem',
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#e8a055'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#d28c3c'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                View Courts
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile sticky book bar ── */}
                <div className="vd-book-bar">
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#f5efe6', lineHeight: 1.2 }}>
                            {venue.Name}
                        </div>
                        {courts.length > 0 && (
                            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(245,239,230,.4)' }}>
                                From PKR {Math.min(...courts.map(c => c.BasePricePerHour)).toLocaleString()}/hr
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { setActiveTab('courts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{
                            padding: '.7rem 1.4rem',
                            background: '#d28c3c', color: '#0f0a06',
                            border: 'none', borderRadius: '2px', cursor: 'pointer',
                            fontFamily: "'Mulish',sans-serif", fontSize: '.72rem',
                            fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                            flexShrink: 0,
                        }}
                    >
                        Book Now
                    </button>
                </div>

            </div>
        </>
    );
}