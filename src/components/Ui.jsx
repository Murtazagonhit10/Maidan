'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── SpotlightCard ── */
export function SpotlightCard({ children, className = '' }) {
    const ref = useRef(null);
    const onMove = e => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sx', `${e.clientX - r.left}px`);
        el.style.setProperty('--sy', `${e.clientY - r.top}px`);
        el.style.setProperty('--so', '1');
    };
    const onLeave = () => ref.current?.style.setProperty('--so', '0');
    return (
        <>
            <style>{`
        .spl{--sx:50%;--sy:50%;--so:0;position:relative;overflow:hidden;transition:background .35s;}
        .spl::before{content:'';position:absolute;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(210,140,60,.12),transparent 68%);left:var(--sx);top:var(--sy);transform:translate(-50%,-50%);opacity:var(--so);transition:opacity .4s;pointer-events:none;z-index:0;}
        .spl>*{position:relative;z-index:1;}
        .spl:hover{background:rgba(210,140,60,.04);}
    `}</style>
            <div ref={ref} className={`spl ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
                {children}
            </div>
        </>
    );
}

/* ── TiltCard ── */
export function TiltCard({ children, className = '' }) {
    const ref = useRef(null);
    const onMove = e => {
        const el = ref.current; if (!el) return;
        if (window.matchMedia('(hover: none)').matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateZ(7px)`;
        el.style.boxShadow = `${-x * 20}px ${-y * 20}px 45px rgba(0,0,0,.55)`;
    };
    const onLeave = () => {
        const el = ref.current; if (!el) return;
        el.style.transform = ''; el.style.boxShadow = '';
    };
    return (
        <div ref={ref} className={className}
            style={{ transition: 'transform .45s cubic-bezier(.22,1,.36,1),box-shadow .45s', transformStyle: 'preserve-3d' }}
            onMouseMove={onMove} onMouseLeave={onLeave}>
            {children}
        </div>
    );
}

/* ── MagneticBtn ── */
export function MagBtn({ href, children, className = 'btn-fill', onClick }) {
    const ref = useRef(null);
    const onMove = e => {
        const el = ref.current; if (!el) return;
        if (window.matchMedia('(hover: none)').matches) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .2}px)`;
    };
    const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
    if (href) return (
        <Link ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</Link>
    );
    return (
        <button ref={ref} className={className} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</button>
    );
}

/* ── AnimCounter ── */
export function AnimCounter({ to, suffix = '', dec = false, className = '' }) {
    const ref = useRef(null);
    const fired = useRef(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !fired.current) {
                fired.current = true;
                let i = 0; const total = 85;
                const iv = setInterval(() => {
                    i++;
                    const ease = 1 - Math.pow(1 - i / total, 3);
                    el.textContent = (dec ? (to * ease).toFixed(1) : Math.round(to * ease)) + suffix;
                    if (i >= total) clearInterval(iv);
                }, 18);
            }
        }, { threshold: .5 });
        io.observe(el);
        return () => io.disconnect();
    }, [to, suffix, dec]);
    return <span ref={ref} className={className}>0{suffix}</span>;
}

/* ── Marquee Ticker ── */
export function Marquee({ items, speed = 28 }) {
    return (
        <>
            <style>{`
        .mq{overflow:hidden;white-space:nowrap;}
        .mq-t{display:inline-flex;animation:mqS ${speed}s linear infinite;}
        .mq-t:hover{animation-play-state:paused;}
        @keyframes mqS{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-i{font-family:'Mulish',sans-serif;font-size:clamp(.6rem,1.2vw,.72rem);font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,239,230,.45);padding:0 clamp(1rem,2.5vw,2rem);}
        .mq-s{color:#d28c3c;font-size:.5rem;flex-shrink:0;}
      `}</style>
            <div className="mq">
                <div className="mq-t">
                    {[...items, ...items].map((item, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span className="mq-i">{item}</span>
                            <span className="mq-s">◆</span>
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ════════════════════════════════════════════════════════
   SEAMLESS IMAGE STRIP
   
   Root cause of the gap bug:
   - CSS clamp() widths are unknown at render time
   - translateX(-50%) assumes exactly half the track = one set
   - If clamp resolves differently, seam shows as a blank gap
   
   Fix: RAF loop that measures actual rendered pixel width of
   ONE set of images, then resets position when that exact
   distance is scrolled — pixel-perfect, zero gap, forever.
════════════════════════════════════════════════════════ */
/* ── Local images from public/pictures/strips/set1 ── */
const STRIP_SET1 = [
    '/pictures/strips/set1/cricket1.jpg',
    '/pictures/strips/set1/cricket2.jpg',
    '/pictures/strips/set1/cricket3.jpg',
    '/pictures/strips/set1/futsal1.jpg',
    '/pictures/strips/set1/futsal2.jpg',
    '/pictures/strips/set1/futsal3.jpg',
    '/pictures/strips/set1/padel1.jpg',
    '/pictures/strips/set1/padel2.jpg',
];

/* ── Local images from public/pictures/strips/set2 ── */
const STRIP_SET2 = [
    '/pictures/strips/set2/cricket1.jpg',
    '/pictures/strips/set2/cricket2.jpg',
    '/pictures/strips/set2/cricket3.jpg',
    '/pictures/strips/set2/futsal1.jpg',
    '/pictures/strips/set2/futsal2.jpg',
    '/pictures/strips/set2/futsal3.jpg',
    '/pictures/strips/set2/padel1.jpg',
    '/pictures/strips/set2/padel2.jpg',
];

/* Fixed px dimensions — no clamp, no vw — so the loop math is always exact */
const IMG_W  = 240;   /* px width per image  */
const IMG_H  = 170;   /* px height per image */
const IMG_GAP = 3;    /* px gap between images */

function StripRow({ reverse = false, speed = 0.6, imageSet = STRIP_SET1 }) {
    const trackRef = useRef(null);
    
    /* Calculate SET_W based on the actual image set being used */
    const SET_W = imageSet.length * (IMG_W + IMG_GAP);
    
    const xRef     = useRef(reverse ? -SET_W : 0);
    const rafRef   = useRef(null);
    const lastTs   = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        /* Set initial position */
        track.style.transform = `translateX(${xRef.current}px)`;

        function tick(ts) {
            if (lastTs.current === null) lastTs.current = ts;
            const dt = ts - lastTs.current;
            lastTs.current = ts;

            /* Move at `speed` px per ms */
            const dir = reverse ? 1 : -1;
            xRef.current += dir * speed * dt;

            /* Seamless reset:
               Forward row:  when x reaches -SET_W, jump back to 0
               Reverse row:  when x reaches 0, jump back to -SET_W     */
            if (!reverse && xRef.current <= -SET_W) {
                xRef.current += SET_W;
            }
            if (reverse && xRef.current >= 0) {
                xRef.current -= SET_W;
            }

            track.style.transform = `translateX(${xRef.current}px)`;
            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [reverse, speed, SET_W]);

    /*
      Render 3 copies of the images:
      - Copy A: the "previous" set (to the left, so reverse row is seamless)
      - Copy B: the "current" set (main visible set)
      - Copy C: the "next" set (always filling the right side)
      
      With 3 copies, regardless of viewport width, at least one full
      viewport-width of content is always visible with no gaps.
    */
    const allImgs = [...imageSet, ...imageSet, ...imageSet];

    return (
        <div style={{ overflow: 'hidden', lineHeight: 0, width: '100%' }}>
            <div
                ref={trackRef}
                style={{
                    display      : 'flex',
                    gap          : `${IMG_GAP}px`,
                    willChange   : 'transform',
                    /* Start position: offset left by one set so reverse row fills correctly */
                    transform    : `translateX(${reverse ? -SET_W : 0}px)`,
                    /* Width: 3 sets */
                    width        : `${allImgs.length * (IMG_W + IMG_GAP)}px`,
                    flexShrink   : 0,
                }}
            >
                {allImgs.map((src, i) => (
                    <div
                        key={i}
                        style={{
                            flexShrink   : 0,
                            width        : IMG_W,
                            height       : IMG_H,
                            overflow     : 'hidden',
                        }}
                    >
                        <img
                            src={src}
                            alt=""
                            loading="lazy"
                            draggable={false}
                            style={{
                                width      : '100%',
                                height     : '100%',
                                objectFit  : 'cover',
                                display    : 'block',
                                filter     : 'saturate(.55) brightness(.75)',
                                transition : 'filter .4s',
                                userSelect : 'none',
                                pointerEvents: 'none',
                            }}
                            onMouseOver={e => e.currentTarget.style.filter = 'saturate(.9) brightness(.85)'}
                            onMouseOut={e  => e.currentTarget.style.filter = 'saturate(.55) brightness(.75)'}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ImageStrip() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <StripRow reverse={false} speed={0.12} imageSet={STRIP_SET1} />
            <StripRow reverse={true}  speed={0.15} imageSet={STRIP_SET2} />
        </div>
    );
}

/* ── Text Ribbon ── */
export function TextRibbon({ words }) {
    return (
        <>
            <style>{`
        .rib{overflow:hidden;white-space:nowrap;padding:clamp(1.5rem,4vw,3rem) 0;}
        .rib-t{display:inline-flex;align-items:center;gap:clamp(1.2rem,3vw,3rem);animation:ribS 22s linear infinite;}
        @keyframes ribS{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .rib-w{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,4.2rem);letter-spacing:-.04em;white-space:nowrap;}
        .rib-solid{color:var(--cream,#f5efe6);}
        .rib-ghost{color:transparent;-webkit-text-stroke:1.5px rgba(210,140,60,.25);}
        .rib-dot{width:6px;height:6px;border-radius:50%;background:#d28c3c;opacity:.55;flex-shrink:0;}
      `}</style>
            <div className="rib">
                <div className="rib-t">
                    {[...words, ...words].map((w, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(1.2rem,3vw,3rem)' }}>
                            <span className={`rib-w ${i % 2 === 0 ? 'rib-solid' : 'rib-ghost'}`}>{w}</span>
                            <span className="rib-dot" />
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}