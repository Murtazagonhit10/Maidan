'use client';
import { useEffect, useRef, useState } from 'react';

/* ════════════════════════════════════════════════════════
   CountUp — ReactBits-inspired animated counter
   Counts from 0 → end using an easeOutExpo curve.
   Supports a suffix string (e.g. "k+", "+", "%").
   Triggers once when the element enters the viewport.
════════════════════════════════════════════════════════ */
export default function CountUp({
    end = 100,
    suffix = '',
    duration = 1800,   /* ms */
    delay = 0,         /* ms before starting */
    style = {},
}) {
    const [display, setDisplay] = useState('0');
    const ref = useRef(null);
    const started = useRef(false);
    const rafRef = useRef(null);

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function startCount() {
        if (started.current) return;
        started.current = true;

        const startTime = performance.now() + delay;

        function tick(now) {
            if (now < startTime) { rafRef.current = requestAnimationFrame(tick); return; }

            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(eased * end);

            setDisplay(String(current));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setDisplay(String(end));
            }
        }
        rafRef.current = requestAnimationFrame(tick);
    }

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { startCount(); observer.disconnect(); } },
            { threshold: 0.3 }
        );
        observer.observe(el);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <span ref={ref} style={style}>
            {display}{suffix}
        </span>
    );
}