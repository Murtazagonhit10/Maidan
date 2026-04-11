'use client';
import { useEffect, useRef } from 'react';

export default function ParallaxSection({ children, className = '', intensity = 0.15 }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onScroll = () => {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            const imgs = el.querySelectorAll('[data-parallax-inner]');
            imgs.forEach(img => {
                const spd = parseFloat(img.dataset.parallaxInner) || intensity;
                img.style.transform = `translateY(${center * spd}px)`;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [intensity]);

    return (
        <div ref={ref} className={`parallax-wrap ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
            {children}
        </div>
    );
}