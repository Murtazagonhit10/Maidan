'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';

/* ════════════════════════════════════════════════════════
   COURT CARD
   ReactBits-inspired:
   - Magnetic tilt on mouse move (Tilted Card)
   - Spotlight glow following cursor (Spotlight Card)
   - Animated amber border on hover (Border Glow)
   - Sport icon floating animation (image or emoji fallback)
   - Peak / Base price display
════════════════════════════════════════════════════════ */

const SPORT_ICONS = {
    Cricket: '🏏',
    'Turf Cricket': '🏏',
    Futsal: '⚽',
    Padel: '🎾',
    Basketball: '🏀',
    Tennis: '🎾',
    Badminton: '🏸',
    Squash: '🎯',
    default: '🏟️',
};

const SPORT_COLORS = {
    Cricket: { bg: 'rgba(34,85,34,.18)', border: 'rgba(34,140,34,.35)', glow: '34,140,34' },
    'Turf Cricket': { bg: 'rgba(34,85,34,.18)', border: 'rgba(34,140,34,.35)', glow: '34,140,34' },
    Futsal: { bg: 'rgba(20,60,140,.18)', border: 'rgba(40,100,220,.35)', glow: '40,100,220' },
    Padel: { bg: 'rgba(120,30,30,.18)', border: 'rgba(200,60,60,.35)', glow: '200,60,60' },
    default: { bg: 'rgba(210,140,60,.1)', border: 'rgba(210,140,60,.35)', glow: '210,140,60' },
};

const STATUS_STYLES = {
    Active: { color: '#50c878', bg: 'rgba(80,200,120,.12)', label: 'Available' },
    Maintenance: { color: '#f0a030', bg: 'rgba(240,160,48,.12)', label: 'Maintenance' },
    Closed: { color: '#e05050', bg: 'rgba(220,80,80,.12)', label: 'Closed' },
};

export default function CourtCard({ court, venueId, index = 0 }) {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [spot, setSpot] = useState({ x: 50, y: 50, on: false });
    const [hovered, setHovered] = useState(false);
    const [iconError, setIconError] = useState(false);

    const sc = SPORT_COLORS[court.SportName] || SPORT_COLORS.default;
    const st = STATUS_STYLES[court.Status] || STATUS_STYLES.Active;

    // Check if SportIcon is a valid URL or just text
    const isValidUrl = court.SportIcon && (court.SportIcon.startsWith('http') || court.SportIcon.startsWith('/'));
    const emojiFallback = SPORT_ICONS[court.SportName] || SPORT_ICONS.default || '🏟️';

    function onMouseMove(e) {
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width;
        const cy = (e.clientY - r.top) / r.height;
        setTilt({ x: (cy - 0.5) * -8, y: (cx - 0.5) * 8 });
        setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
    }

    function onMouseLeave() {
        setTilt({ x: 0, y: 0 });
        setSpot(s => ({ ...s, on: false }));
        setHovered(false);
    }

    const hasPeak = court.PeakPricePerHour && court.PeakPricePerHour > court.BasePricePerHour;
    const hasPeakTime = hasPeak && court.PeakStartTime && court.PeakEndTime;

    return (
        <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={onMouseLeave}
            className="court-card-anim"
            style={{
                position: 'relative',
                background: '#141008',
                border: `1px solid ${hovered ? sc.border : 'rgba(210,140,60,.12)'}`,
                borderRadius: '4px',
                overflow: 'hidden',
                padding: '1.6rem',
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? '4px' : '0'})`,
                transition: hovered ? 'none' : 'transform .5s cubic-bezier(.22,1,.36,1), border-color .3s, box-shadow .3s',
                boxShadow: hovered
                    ? `0 20px 50px rgba(0,0,0,.6), 0 0 30px rgba(${sc.glow},.18), inset 0 0 0 1px rgba(${sc.glow},.2)`
                    : '0 4px 20px rgba(0,0,0,.3)',
                animationDelay: `${index * 0.07}s`,
            }}
        >
            {/* Spotlight */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                opacity: spot.on ? 1 : 0,
                transition: 'opacity .3s',
                background: `radial-gradient(260px circle at ${spot.x}px ${spot.y}px, rgba(${sc.glow},.12) 0%, transparent 70%)`,
            }} />

            {/* Animated border gradient */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(to right, transparent, rgba(${sc.glow},.7) 40%, rgba(${sc.glow},1) 50%, rgba(${sc.glow},.7) 60%, transparent)`,
                transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'center',
                transition: 'transform .4s cubic-bezier(.22,1,.36,1)',
                zIndex: 2,
            }} />

            {/* Background sport tint */}
            <div style={{
                position: 'absolute', inset: 0,
                background: sc.bg,
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity .3s',
                zIndex: 0,
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 3 }}>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {/* Sport icon */}
                    <div className="icon-container" style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: `rgba(${sc.glow},.14)`,
                        border: `1px solid rgba(${sc.glow},.3)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem',
                        overflow: 'hidden',
                        flexShrink: 0,
                        animation: hovered ? 'courtIconSpin .6s cubic-bezier(.22,1,.36,1)' : 'none',
                    }}>
                        {isValidUrl && !iconError ? (
                            <img
                                src={court.SportIcon}
                                alt={court.SportName}
                                style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                                onError={() => setIconError(true)}
                            />
                        ) : (
                            <span style={{ fontSize: '1.4rem' }}>{emojiFallback}</span>
                        )}
                    </div>

                    {/* Status */}
                    <span className="status-badge" style={{
                        padding: '.2rem .65rem',
                        background: st.bg,
                        border: `1px solid ${st.color}44`,
                        borderRadius: '20px',
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: '.6rem', fontWeight: 600,
                        letterSpacing: '.14em', textTransform: 'uppercase',
                        color: st.color,
                        display: 'flex', alignItems: 'center', gap: '.3rem',
                        flexShrink: 0,
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: st.color,
                            animation: court.Status === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none',
                            flexShrink: 0,
                        }} />
                        {st.label}
                    </span>
                </div>

                {/* Names */}
                <div style={{ marginBottom: '1rem' }}>
                    <div className="sport-name" style={{
                        fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                        fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
                        color: `rgba(${sc.glow},.75)`, marginBottom: '.3rem',
                    }}>
                        {court.SportName}
                    </div>
                    <h3 style={{
                        fontFamily: "'Syne',sans-serif", fontWeight: 700,
                        fontSize: '1.05rem', color: '#f5efe6',
                        letterSpacing: '-.01em', lineHeight: 1.2,
                    }}>
                        {court.CourtName}
                    </h3>
                </div>

                {/* Rating */}
                {court.ReviewCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <div className="rating-stars" style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} style={{
                                    fontSize: '.7rem',
                                    color: s <= Math.round(court.AvgRating) ? '#d28c3c' : 'rgba(245,239,230,.15)',
                                }}>★</span>
                            ))}
                        </div>
                        <span style={{
                            fontFamily: "'Mulish',sans-serif", fontSize: '.72rem',
                            color: 'rgba(245,239,230,.45)',
                        }}>
                            {Number(court.AvgRating).toFixed(1)} ({court.ReviewCount})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="price-container" style={{
                    padding: '.8rem',
                    background: 'rgba(245,239,230,.03)',
                    border: '1px solid rgba(245,239,230,.07)',
                    borderRadius: '3px',
                    marginBottom: '1.1rem',
                }}>
                    <div className="price-block" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        <div>
                            <div style={{
                                fontFamily: "'Mulish',sans-serif", fontSize: '.58rem',
                                letterSpacing: '.14em', textTransform: 'uppercase',
                                color: 'rgba(245,239,230,.3)', marginBottom: '.2rem',
                            }}>Base Rate</div>
                            <div className="price-value" style={{
                                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                                fontSize: '1.15rem', color: '#d28c3c', lineHeight: 1,
                            }}>
                                PKR {Number(court.BasePricePerHour).toLocaleString()}
                                <span style={{ fontFamily: "'Mulish',sans-serif", fontWeight: 300, fontSize: '.68rem', color: 'rgba(245,239,230,.35)' }}>/hr</span>
                            </div>
                        </div>

                        {hasPeak && (
                            <div className="peak-price" style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontFamily: "'Mulish',sans-serif", fontSize: '.58rem',
                                    letterSpacing: '.14em', textTransform: 'uppercase',
                                    color: 'rgba(245,239,230,.3)', marginBottom: '.2rem',
                                }}>Peak</div>
                                <div style={{
                                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                                    fontSize: '1rem', color: '#e8a055', lineHeight: 1,
                                }}>
                                    PKR {Number(court.PeakPricePerHour).toLocaleString()}
                                    <span style={{ fontFamily: "'Mulish',sans-serif", fontWeight: 300, fontSize: '.65rem', color: 'rgba(245,239,230,.35)' }}>/hr</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {hasPeakTime && (
                        <div style={{
                            marginTop: '.6rem', paddingTop: '.6rem',
                            borderTop: '1px solid rgba(245,239,230,.06)',
                            fontFamily: "'Mulish',sans-serif", fontSize: '.65rem',
                            color: 'rgba(245,239,230,.3)',
                        }}>
                            ⏰ Peak: {court.PeakStartTime?.slice(0, 5)} – {court.PeakEndTime?.slice(0, 5)}
                            {court.PeakDays && ` · ${court.PeakDays}`}
                        </div>
                    )}
                </div>

                {/* Book CTA */}
                {court.Status === 'Active' && (
                    <Link
                        href={`/venues/${venueId}/book?court=${court.CourtID}`}
                        onClick={e => e.stopPropagation()}
                        className="book-btn"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                            width: '100%', padding: '.7rem',
                            background: hovered ? '#d28c3c' : 'rgba(210,140,60,.12)',
                            border: '1px solid rgba(210,140,60,.38)',
                            borderRadius: '2px',
                            fontFamily: "'Mulish',sans-serif", fontSize: '.72rem',
                            fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
                            color: hovered ? '#0f0a06' : '#d28c3c',
                            textDecoration: 'none',
                            transition: 'all .3s cubic-bezier(.22,1,.36,1)',
                        }}
                    >
                        Book This Court
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                )}
            </div>

            <style>{`
    @keyframes courtIconSpin {
        from { transform: rotate(-10deg) scale(.9); }
        to   { transform: rotate(0deg) scale(1); }
    }
    @keyframes statusPulse {
        0%,100% { opacity:1; } 50% { opacity:.3; }
    }
    .court-card-anim {
        animation: courtCardIn .55s cubic-bezier(.22,1,.36,1) both;
        animation-delay: var(--delay, 0s);
    }
    @keyframes courtCardIn {
        from { opacity:0; transform: perspective(800px) translateY(24px) rotateX(4deg); }
        to   { opacity:1; transform: perspective(800px) translateY(0) rotateX(0deg); }
    }
    
    /* Mobile specific styles */
    @media (max-width: 768px) {
        .court-card-anim {
            padding: 1rem !important;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .court-card-anim * {
            text-rendering: optimizeLegibility;
        }
        
        .court-card-anim h3 {
            font-size: 0.9rem !important;
        }
        
        .court-card-anim .sport-name {
            font-size: 0.55rem !important;
        }
        
        .court-card-anim .price-block {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
        }
        
        .court-card-anim .price-value {
            font-size: 1rem !important;
        }
        
        .court-card-anim .peak-price {
            text-align: left !important;
        }
        
        .court-card-anim .book-btn {
            padding: 0.6rem !important;
            font-size: 0.65rem !important;
        }
        
        .court-card-anim .icon-container {
            width: 38px !important;
            height: 38px !important;
        }
        
        .court-card-anim .status-badge {
            padding: 0.15rem 0.5rem !important;
            font-size: 0.55rem !important;
        }
        
        .court-card-anim .rating-stars {
            font-size: 0.6rem !important;
        }
        
        .court-card-anim .rating-stars span {
            font-size: 0.6rem !important;
        }
        
        .court-card-anim .price-container {
            padding: 0.6rem !important;
        }
    }
`}</style>
        </div>
    );
}