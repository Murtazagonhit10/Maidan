'use client';
import { useRef, useEffect, useState } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80';

export default function VenueHero({ venue, stats, sports }) {
    const imgRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    /* Parallax on scroll */
    useEffect(() => {
        const fn = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const statItems = [
        { label: 'Courts', value: sports?.length > 0 ? `${sports.length} Sport${sports.length > 1 ? 's' : ''}` : '—' },
        { label: 'Rating', value: stats?.totalReviews > 0 ? `${Number(stats.avgRating).toFixed(1)} ★` : 'New' },
        { label: 'Reviews', value: stats?.totalReviews || 0 },
        { label: 'City', value: venue.City },
    ];

    return (
        <div style={{ position: 'relative', height: '70vh', minHeight: 520, maxHeight: 720, overflow: 'hidden' }}>
            {/* Parallax image */}
            <img
                src={venue.PrimaryImage || FALLBACK}
                alt={venue.Name}
                onLoad={() => setLoaded(true)}
                onError={e => { e.currentTarget.src = FALLBACK; setLoaded(true); }}
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '110%',
                    objectFit: 'cover',
                    filter: 'brightness(.28) saturate(.6)',
                    transform: `translateY(${scrollY * 0.25}px)`,
                    transition: loaded ? 'none' : 'opacity .8s',
                    opacity: loaded ? 1 : 0,
                }}
            />

            {/* Gradient overlays */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(15,10,6,.65) 0%, transparent 55%)'
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(15,10,6,1) 0%, rgba(15,10,6,.5) 40%, transparent 70%)'
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(15,10,6,.4) 0%, transparent 50%)'
            }} />

            {/* Amber left accent */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                background: 'linear-gradient(to bottom, transparent, #d28c3c 30%, #d28c3c 70%, transparent)',
            }} />

            {/* Content */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 5rem)',
                display: 'flex', flexDirection: 'column', gap: '1.2rem',
            }}>
                {/* Breadcrumb */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.45rem',
                    fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                    letterSpacing: '.2em', textTransform: 'uppercase',
                    color: 'rgba(245,239,230,.4)',
                }}>
                    <span>{venue.City}</span>
                    <span style={{ color: 'rgba(210,140,60,.4)' }}>·</span>
                    <span>{venue.Location}</span>
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 800,
                    fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
                    lineHeight: .94, letterSpacing: '-.04em',
                    color: '#f5efe6', margin: 0,
                    maxWidth: 700,
                }}>
                    {venue.Name}
                </h1>

                {/* Sport chips */}
                {sports?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                        {sports.map(s => (
                            <span key={s.SportName} style={{
                                padding: '.25rem .7rem',
                                background: 'rgba(210,140,60,.12)',
                                border: '1px solid rgba(210,140,60,.28)',
                                borderRadius: '20px',
                                fontFamily: "'Mulish',sans-serif",
                                fontSize: '.65rem', fontWeight: 600,
                                letterSpacing: '.12em', textTransform: 'uppercase',
                                color: '#d28c3c',
                            }}>
                                {s.SportIcon || ''} {s.SportName}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats row */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '.4rem .1px',
                    background: 'rgba(15,10,6,.72)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(210,140,60,.14)',
                    alignSelf: 'flex-start',
                }}>
                    {statItems.map((item, i) => (
                        <div key={item.label} style={{
                            display: 'flex', flexDirection: 'column',
                            padding: '.7rem 1.3rem',
                            borderRight: i < statItems.length - 1 ? '1px solid rgba(210,140,60,.1)' : 'none',
                        }}>
                            <span style={{
                                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                                fontSize: '1.1rem', color: '#d28c3c', lineHeight: 1,
                            }}>{item.value}</span>
                            <span style={{
                                fontFamily: "'Mulish',sans-serif", fontSize: '.6rem',
                                letterSpacing: '.14em', textTransform: 'uppercase',
                                color: 'rgba(245,239,230,.35)', marginTop: '.2rem',
                            }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div style={{
                position: 'absolute', bottom: '1.5rem', right: '2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem',
                fontFamily: "'Mulish',sans-serif", fontSize: '.58rem',
                letterSpacing: '.18em', textTransform: 'uppercase',
                color: 'rgba(245,239,230,.22)',
                animation: 'heroScrollHint 2s ease-in-out infinite',
            }}>
                <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(210,140,60,.6), transparent)' }} />
                Scroll
            </div>

            <style>{`
        @keyframes heroScrollHint {
          0%,100%{opacity:.4;transform:translateY(0)}
          50%{opacity:.9;transform:translateY(4px)}
        }
      `}</style>
        </div>
    );
}