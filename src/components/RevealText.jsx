'use client';
import { useEffect, useRef } from 'react';

export default function RevealText({ children, className = '', direction = 'up' }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) ref.current?.classList.add('rv-visible'); },
            { threshold: 0.12 }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
        .rv { opacity:0; transition: opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1); }
        .rv-up    { transform: translateY(40px); }
        .rv-left  { transform: translateX(-40px); }
        .rv-right { transform: translateX(40px); }
        .rv-scale { transform: scale(.96); }
        .rv-visible { opacity:1; transform: none !important; }
      `}</style>
            <div ref={ref} className={`rv rv-${direction} ${className}`}>
                {children}
            </div>
        </>
    );
}
