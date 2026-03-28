'use client';

import { useRef, useEffect } from 'react';

export default function MagneticButton({
    children,
    className = '',
    disabled = false,
    style = {},
    type = 'button',
    onClick,
    strength = 0.32,
    asLink = false,
    href = '',
    ...props
}) {
    const btnRef = useRef(null);
    const innerRef = useRef(null);
    const animRef = useRef(null);
    const cur = useRef({ x: 0, y: 0 });
    const tgt = useRef({ x: 0, y: 0 });
    const hovered = useRef(false);

    useEffect(() => {
        const btn = btnRef.current;
        const inner = innerRef.current;
        if (!btn || !inner) return;

        const lerp = (a, b, t) => a + (b - a) * t;

        function tick() {
            cur.current.x = lerp(cur.current.x, tgt.current.x, 0.1);
            cur.current.y = lerp(cur.current.y, tgt.current.y, 0.1);
            inner.style.transform = `translate(${cur.current.x}px, ${cur.current.y}px)`;
            animRef.current = requestAnimationFrame(tick);
        }
        tick();

        const onMove = (e) => {
            if (!hovered.current || disabled) return;
            const rect = btn.getBoundingClientRect();
            tgt.current = {
                x: (e.clientX - (rect.left + rect.width / 2)) * strength,
                y: (e.clientY - (rect.top + rect.height / 2)) * strength,
            };
        };

        const onEnter = () => { hovered.current = true; };
        const onLeave = () => {
            hovered.current = false;
            tgt.current = { x: 0, y: 0 };
        };

        btn.addEventListener('mousemove', onMove);
        btn.addEventListener('mouseenter', onEnter);
        btn.addEventListener('mouseleave', onLeave);

        return () => {
            cancelAnimationFrame(animRef.current);
            btn.removeEventListener('mousemove', onMove);
            btn.removeEventListener('mouseenter', onEnter);
            btn.removeEventListener('mouseleave', onLeave);
        };
    }, [disabled, strength]);

    const commonProps = {
        ref: btnRef,
        className: `magnetic-btn ${className}`,
        disabled,
        style: { ...style, overflow: 'hidden', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        ...props,
    };

    const innerElement = (
        <span ref={innerRef} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
        }}>
            {children}
        </span>
    );

    if (asLink && href) {
        return (
            <a href={href} {...commonProps} onClick={onClick}>
                {innerElement}
            </a>
        );
    }

    return (
        <button type={type} onClick={onClick} {...commonProps}>
            {innerElement}
        </button>
    );
}