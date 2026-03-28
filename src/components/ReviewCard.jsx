'use client';
import { useRef, useEffect, useState } from 'react';

export default function ReviewCard({ review, index = 0 }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
            { threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    function getInitials(name = '') {
        return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    const date = review.ReviewDate
        ? new Date(review.ReviewDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    return (
        <div
            ref={ref}
            style={{
                background: '#141008',
                border: '1px solid rgba(210,140,60,.1)',
                borderRadius: '3px',
                padding: '1.4rem',
                position: 'relative',
                overflow: 'hidden',
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity .5s cubic-bezier(.22,1,.36,1) ${index * 0.06}s, transform .5s cubic-bezier(.22,1,.36,1) ${index * 0.06}s`,
            }}
        >
            {/* Ambient top line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(210,140,60,.25) 40%, rgba(210,140,60,.25) 60%, transparent)',
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '.85rem' }}>
                {/* Avatar */}
                <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(210,140,60,.15)',
                    border: '1px solid rgba(210,140,60,.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {review.UserImage ? (
                        <img src={review.UserImage} alt={review.UserName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{
                            fontFamily: "'Syne',sans-serif", fontWeight: 700,
                            fontSize: '.72rem', color: '#d28c3c',
                        }}>
                            {getInitials(review.UserName)}
                        </span>
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontFamily: "'Syne',sans-serif", fontWeight: 600,
                        fontSize: '.88rem', color: '#f5efe6',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {review.UserName}
                    </div>
                    <div style={{
                        fontFamily: "'Mulish',sans-serif", fontSize: '.65rem',
                        color: 'rgba(245,239,230,.35)',
                    }}>
                        {review.CourtName} · {review.SportName}
                    </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end', marginBottom: '.18rem' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{
                                fontSize: '.72rem',
                                color: s <= review.Rating ? '#d28c3c' : 'rgba(245,239,230,.15)',
                            }}>★</span>
                        ))}
                    </div>
                    <div style={{
                        fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                        color: 'rgba(245,239,230,.28)',
                    }}>{date}</div>
                </div>
            </div>

            {/* Comment */}
            {review.Comment && (
                <p style={{
                    fontFamily: "'Mulish',sans-serif", fontSize: '.82rem',
                    fontWeight: 300, color: 'rgba(245,239,230,.62)',
                    lineHeight: 1.72, margin: 0,
                }}>
                    &quot;{review.Comment}&quot;
                </p>
            )}
        </div>
    );
}