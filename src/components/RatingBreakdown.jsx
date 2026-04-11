'use client';
import { useRef, useEffect, useState } from 'react';

export default function RatingBreakdown({ stats }) {
    const ref = useRef(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setAnimated(true); io.disconnect(); } },
            { threshold: 0.3 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const { avgRating = 0, totalReviews = 0, breakdown = {} } = stats;
    const max = Math.max(...Object.values(breakdown), 1);

    return (
        <div ref={ref} style={{
            background: '#141008',
            border: '1px solid rgba(210,140,60,.12)',
            borderRadius: '3px',
            padding: '1.8rem',
        }}>
            {/* Big number */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{
                        fontFamily: "'Syne',sans-serif", fontWeight: 800,
                        fontSize: '4rem', color: '#d28c3c', lineHeight: 1, letterSpacing: '-.04em',
                    }}>
                        {Number(avgRating).toFixed(1)}
                    </div>
                    <div style={{ display: 'flex', gap: '3px', margin: '.35rem 0 .2rem' }}>
                        {[1, 2, 3, 4, 5].map(s => {
                            const fill = Math.min(1, Math.max(0, avgRating - s + 1));
                            return (
                                <div key={s} style={{ position: 'relative', width: 18, height: 18, overflow: 'hidden' }}>
                                    <span style={{ position: 'absolute', fontSize: '1.1rem', color: 'rgba(245,239,230,.15)' }}>★</span>
                                    <span style={{
                                        position: 'absolute', fontSize: '1.1rem', color: '#d28c3c',
                                        clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`,
                                    }}>★</span>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{
                        fontFamily: "'Mulish',sans-serif", fontSize: '.72rem',
                        color: 'rgba(245,239,230,.35)',
                    }}>
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Bar breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                {[5, 4, 3, 2, 1].map(n => {
                    const count = breakdown[n] || 0;
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                            <span style={{
                                fontFamily: "'Mulish',sans-serif", fontSize: '.7rem',
                                color: 'rgba(245,239,230,.4)', width: 8, textAlign: 'right', flexShrink: 0,
                            }}>{n}</span>
                            <span style={{ fontSize: '.7rem', color: '#d28c3c', flexShrink: 0 }}>★</span>
                            <div style={{ flex: 1, height: 6, background: 'rgba(245,239,230,.06)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 3,
                                    background: `linear-gradient(to right, #d28c3c, #e8a055)`,
                                    width: animated ? `${pct}%` : '0%',
                                    transition: `width .8s cubic-bezier(.22,1,.36,1) ${(5 - n) * 0.06}s`,
                                }} />
                            </div>
                            <span style={{
                                fontFamily: "'Mulish',sans-serif", fontSize: '.68rem',
                                color: 'rgba(245,239,230,.3)', width: 22, textAlign: 'right', flexShrink: 0,
                            }}>{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}