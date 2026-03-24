'use client';
import { useEffect, useRef } from 'react';

export function RevealText({ children, className = '', delay = 0, from = 'bottom' }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) ref.current?.classList.add('rv-in'); },
            { threshold: 0.08 }
        );
        io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    const t = { bottom: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)', scale: 'scale(.95)' };
    return (
        <>
            <style>{`.rv{opacity:0;transition:opacity .95s cubic-bezier(.22,1,.36,1),transform .95s cubic-bezier(.22,1,.36,1)}.rv.rv-in{opacity:1;transform:none!important}`}</style>
            <div ref={ref} className={`rv ${className}`}
                style={{ transform: t[from] || t.bottom, transitionDelay: `${delay}s` }}>
                {children}
            </div>
        </>
    );
}

export function ParallaxSection({ children, className = '' }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        // Disable parallax on small screens (causes layout issues)
        const tick = () => {
            if (window.innerWidth < 768) return;
            const rect = el.getBoundingClientRect();
            const c = rect.top + rect.height / 2 - window.innerHeight / 2;
            el.querySelectorAll('[data-p]').forEach(ch => {
                ch.style.transform = `translateY(${c * parseFloat(ch.dataset.p)}px)`;
            });
        };
        window.addEventListener('scroll', tick, { passive: true });
        window.addEventListener('resize', tick, { passive: true });
        tick();
        return () => { window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); };
    }, []);
    return (
        <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
            {children}
        </div>
    );
}