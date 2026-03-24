'use client';
import ElectricBorder from './ElectricBorder';
import './ElectricBorder.css';
import { useEffect, useRef } from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Search',
    desc: 'Filter by sport, area of Lahore, date, time and budget. Every result updates in real-time.',
    img: '/pictures/steps/search.jpg',
  },
  {
    num: '02',
    title: 'Book',
    desc: 'Pick your slot, confirm your details, pay securely. Confirmation lands in your inbox instantly.',
    img: '/pictures/steps/book.jpg',
  },
  {
    num: '03',
    title: 'Play',
    desc: 'Show up, scan your QR at the gate. The court is yours. The whole process took under a minute.',
    img: '/pictures/steps/play.jpg',
  },
  {
    num: '•', // Special card
    title: 'Maidan',
    desc: 'Maidan is your all-in-one sports court booking platform, designed to make finding and reserving courts in Pakistan effortless and enjoyable.',
    img: '',
    isMaidanCard: true
  },
];

const N = STEPS.length;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };

/* ── Stacking offsets — tweak to taste ──────────────────────────
   CARD_DX : px each waiting card shifts RIGHT per depth level
   CARD_DY : px each waiting card shifts UP per depth level
   These directly match the ReactBits "Card Distance" / "Vertical Distance" sliders */
const CARD_DX = 50;   /* horizontal (right) offset per depth */
const CARD_DY = 14;   /* vertical (up) offset per depth      */


export default function ScrollStackHIW() {
  const outerRef = useRef(null);
  const numRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const dotRefs = useRef([]);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    let lastActive = -1;

    function tick() {
      const scrolled = -outer.getBoundingClientRect().top;
      const stepH = window.innerHeight;
      /* progress: 0 → N-1, fully continuous */
      const progress = clamp(scrolled / stepH, 0, N - 1);
      const activeI = clamp(Math.floor(progress), 0, N - 1);
      const frac = progress - activeI;   /* 0→1 within current step */

      /* ── LEFT text swap ── */
      if (activeI !== lastActive) {
        lastActive = activeI;
        const s = STEPS[activeI];
        [numRef.current, titleRef.current, descRef.current].forEach((el, k) => {
          if (!el) return;
          const txt = [s.num, s.title, s.desc][k];
          el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            el.textContent = txt;
            el.style.transition = 'opacity .38s ease, transform .38s ease';
            el.style.opacity = '1'; el.style.transform = 'translateY(0)';
          });
        });
        dotRefs.current.forEach((d, k) => {
          if (!d) return;
          d.style.background = k === activeI ? '#d28c3c' : k < activeI ? 'rgba(210,140,60,.5)' : 'rgba(210,140,60,.18)';
          d.style.width = k === activeI ? '22px' : '7px';
        });
      }

      /* ────────────────────────────────────────────────────────────
         RIGHT CARDS  —  Exerra queue behaviour
         
         Key insight from examining Exerra image 1:
         ┌─────────────────────────────────────────┐
         │                                         │
         │  ┌──────────────────────────────────┐   │  ← NEXT card peeking (only header)
         │  │  [3] STEP 3  Monitor & Optimize  │   │    positioned ABOVE viewport fold
         │  └──────────────────────────────────┘   │    partially clipped
         │  ┌──────────────────────────────────┐   │
         │  │  [2] STEP 2  Solution Arch.       │   │  ← ACTIVE card, full size
         │  │  ┌─────────────────────────────┐ │   │
         │  │  │  [content / image]          │ │   │
         │  │  └─────────────────────────────┘ │   │
         │  └──────────────────────────────────┘   │
         └─────────────────────────────────────────┘
 
         So the NEXT card is ABOVE the active card (higher on screen).
         The RIGHT panel clips overflow at top.
         
         Implementation:
         - Stack container has overflow hidden
         - All cards: position absolute, inset 0
         - Card i = active:  translateY(0)  — fills the stack container
         - Card i = next:    translateY(-100% + PEEK_PX)  — only header peeks
                             slides DOWN to 0 as frac→1 of PREVIOUS step
         - Card i = exiting: translateY(0) → translateY(-100%) as frac 0→1
         
         Wait — let me re-read:
         When active=1 (showing step 2), step 3 peeks from top.
         step 3 peek means step 3 header is visible ABOVE step 2.
         
         In absolute terms:
         - Active card: translateY(0) fills container
         - Next card (peek): translateY = -(containerH - PEEK_PX) / containerH * 100%
           ≈ translateY(-84%)  so only 16% (the header) is visible at the TOP
         
         Transition (as frac goes 0→1 for step i→i+1):
         - Card i (active → exiting): translateY: 0 → -100%  (slides UP and out)
         - Card i+1 (next → active): translateY: -84% → 0    (slides DOWN into place)
      ────────────────────────────────────────────────────────────── */

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const depth = i - progress;  /* 0=active, pos=future, neg=past */

        let tx, ty, sc, opacity, zIdx, evOpacity;

        if (depth <= -1) {
          /* ── Fully exited — invisible below ── */
          tx = 0; ty = 120; sc = 0.92; opacity = 0; zIdx = 10; evOpacity = 0;

        } else if (depth < 0) {
          /* ── EXITING ──
             depth: 0 → -1  means card slides DOWN from its resting position.
             At depth=0: tx=0, ty=0, sc=1 (was active)
             At depth=-1: off screen below, fully faded                       */
          const t = smooth(-depth);             /* 0 → 1 */
          tx = 0;
          ty = t * 120;                    /* slides DOWN 120% of card height */
          sc = 1 - t * 0.08;
          opacity = clamp(1 - t * 1.6, 0, 1);  /* fades out fast */
          zIdx = 80;                         /* exits OVER the stack */
          evOpacity = clamp(1 - t * 3, 0, 1);

        } else if (depth < 0.01) {
          /* ── ACTIVE ── fully in position */
          tx = 0; ty = 0; sc = 1; opacity = 1; zIdx = 60; evOpacity = 1;

        } else if (depth < 1) {
          /* ── ENTERING ──
             depth: 1 → 0.  Card travels from its "waiting" position (DX,−DY)
             to the front position (0,0).
             t=0 when depth=1 (waiting), t=1 when depth=0 (active)            */
          const t = smooth(1 - depth);
          tx = CARD_DX * (1 - t);         /* DX → 0 */
          ty = -CARD_DY * (1 - t);        /* −DY → 0 */
          sc = (1 - 0.06 * (1 - t));      /* scale up to 1 */
          opacity = clamp(0.65 + t * 0.35, 0, 1);
          zIdx = 55;
          evOpacity = t;

        } else {
          /* ── WAITING in the stack ──
             depth ≥ 1.  Each level shifts right by CARD_DX and up by CARD_DY.
             Clamp depth so cards beyond level 2 don't fly off screen.        */
          const d = clamp(depth, 1, N - 1);
          tx = CARD_DX * d;
          ty = -CARD_DY * d;
          sc = 1 - 0.06 * d;
          opacity = clamp(1 - (d - 1) * 0.35, 0.35, 0.85);
          zIdx = Math.round(50 - d * 10);
          evOpacity = 0;
        }

        card.style.transform = `translate(${tx}px, ${ty}%) scale(${sc})`;
        card.style.opacity = String(clamp(opacity, 0, 1));
        card.style.zIndex = String(zIdx);
      });

      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
  }, []);

  return (
    <>
      <style>{`
        .hiw-outer {
          position: relative;
          background: #0f0a06;
        }
        .hiw-outer::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(210,140,60,.04) 1px, transparent 1px),
            linear-gradient(90deg,rgba(210,140,60,.04) 1px, transparent 1px);
          background-size:60px 60px; pointer-events:none; z-index:0;
        }

        /* Sticky two-column viewport */
        .hiw-sticky {
          position: sticky; top:0; height:100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          overflow: hidden; z-index:1;
        }

        /* ── LEFT ── */
        .hiw-left {
          display:flex; flex-direction:column; justify-content:center;
          padding: 0 4rem 0 5rem;
        }
        .hiw-eyebrow {
          display:inline-flex; align-items:center; gap:.5rem;
          font-family:'Mulish',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.26em; text-transform:uppercase; color:#d28c3c;
          margin-bottom:1.2rem;
        }
        .hiw-big-title {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:clamp(2.4rem,4.5vw,4.8rem);
          line-height:.95; letter-spacing:-.03em; color:#f5efe6;
          margin-bottom:2.8rem;
        }
        .hiw-big-title span { color:#d28c3c; }
        .hiw-step-row { display:flex; align-items:center; gap:.85rem; margin-bottom:1rem; }
        .hiw-step-badge {
          width:40px; height:40px; border-radius:50%;
          border:1.5px solid rgba(210,140,60,.5);
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.88rem; color:#d28c3c; flex-shrink:0;
        }
        .hiw-step-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:clamp(1.3rem,2.2vw,1.7rem);
          letter-spacing:-.02em; color:#f5efe6;
        }
        .hiw-step-desc {
          /* Same as Exerra: light weight, muted, generous line-height */
          font-family:'Mulish',sans-serif; font-weight:300;
          font-size:clamp(.88rem,1.2vw,.98rem);
          color:rgba(245,239,230,.48); line-height:1.85;
          max-width:400px; margin-bottom:2rem;
        }
        .hiw-dots { display:flex; gap:.35rem; margin-bottom:1.5rem; }
        .hiw-dot {
          height:3px; border-radius:2px;
          transition:background .4s, width .4s cubic-bezier(.22,1,.36,1);
        }
        .hiw-hint {
          font-family:'Mulish',sans-serif; font-size:.7rem;
          color:rgba(245,239,230,.22); letter-spacing:.08em;
        }

        /* ── RIGHT ── */
        .hiw-right {
          position:relative;
          display:flex; align-items:center; justify-content:center;
          padding: 0 2rem 0 2rem;
          /* Clip so peeking cards don't overflow outside the panel */
          overflow: hidden;
        }

        /* Stack container */
        .hiw-stack {
          position: relative;
          width: 100%; max-width: 880px;
          height: clamp(420px, 56vh, 540px);
          overflow: visible;   /* cards peek out diagonally — don't clip */
        }

        /* Individual card — all stacked on top of each other */
        .hcard {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          will-change: transform, opacity;
          /* NO css transition — RAF drives transforms */
        }

        /* Card shell */
        .hcard-shell {
          position: relative;
          width:100%; height:100%;
          background: #181108;
          border: 1px solid rgba(210,140,60,.2);
          border-radius: 4px;
          overflow: hidden;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,.7);
          margin: 0;
        }
        .hcard-hdr {
          height: 62px; flex-shrink: 0;
          display: flex; align-items: center; gap: .9rem;
          padding: 0 1.4rem;
          background: rgba(16,10,4,.97);
          border-bottom: 1px solid rgba(210,140,60,.12);
          position: relative; z-index:2;
        }
        .hcard-num-badge {
          width:30px; height:30px; border-radius:50%;
          border: 1px solid rgba(210,140,60,.45);
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:.75rem; color:#d28c3c; flex-shrink:0;
        }
        .hcard-step-lbl {
          font-family:'Mulish',sans-serif; font-size:.65rem;
          font-weight:500; letter-spacing:.2em; text-transform:uppercase;
          color:rgba(245,239,230,0.6); line-height:1; display:block;
        }
        .hcard-step-name {
          font-family:'Syne',sans-serif; font-weight:600;
          font-size:1rem; color:rgba(210,140,60);
          letter-spacing:-.01em; line-height:1;
        }

        /* Image body — fills the rest */
        .hcard-body {
          flex:1; 
          position:relative; 
          overflow:hidden; 
          min-height:0;
          z-index:30;
        }
        .hcard-body img {
          position:absolute; inset:0;
          width:100%; height:100%; object-fit:cover;
          filter:saturate(.78) brightness(.65);
          display:block;
          z-index:31;
        }
        /* Full dark gradient to make white text readable */
        .hcard-grad {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(8,5,2,.88) 0%, rgba(8,5,2,.4) 45%, transparent 75%);
          z-index:32;
        }
        /* White text block in bottom of image */
        .hcard-txt {
          position:absolute; bottom:0; left:0; right:0;
          padding:1.4rem 1.5rem;
          z-index:33;
        }
        .hcard-txt-num {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:2.6rem; color:rgba(255,255,255,.13);
          line-height:1; margin-bottom:.25rem;
        }
        .hcard-txt-title {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:1.08rem; color:#ffffff; margin-bottom:.35rem;
        }
        .hcard-txt-desc {
          font-family:'Mulish',sans-serif; font-weight:300;
          font-size:.78rem; color:rgba(255,255,255,.6); line-height:1.65;
        }

        /* Maidan Card css */

        .maidan-card-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #181108;
        }
              
        .maidan-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 2.5rem;
          letter-spacing: .08em;
          color: #f5efe6;
          text-align: center;
          line-height: 1.2;
        }

.maidan-logo span {
  color: #d28c3c;
}
        /* Responsive */
        @media(max-width:900px){
          .hiw-sticky{grid-template-columns:1fr;}
          .hiw-left{padding:5rem 2rem 1.5rem;justify-content:flex-start;}
          .hiw-right{padding:1.5rem 2rem 3rem;}
          .hiw-stack{max-width:100%;}
        }
        @media(max-width:480px){
          .hiw-left{padding:5rem 1.25rem 1rem;}
          .hiw-right{padding:1rem 1.25rem 2rem;}
        }
      `}</style>

      {/* Scroll room */}
      <div ref={outerRef} className="hiw-outer" style={{ height: `${(N + 1) * 100}vh` }}>
        <div className="hiw-sticky">

          {/* ═══ LEFT ═══ */}
          <div className="hiw-left">
            <div className="hiw-eyebrow">
              <span style={{ width: '20px', height: '1px', background: '#d28c3c', display: 'block' }} />
              Process
            </div>

            <h2 className="hiw-big-title">
              Court in <span>3 steps.</span>
            </h2>

            <div className="hiw-step-row">
              <div className="hiw-step-badge">
                <span ref={numRef}>01</span>
              </div>
              <div ref={titleRef} className="hiw-step-title">
                {STEPS[0].title}
              </div>
            </div>

            <p ref={descRef} className="hiw-step-desc">
              {STEPS[0].desc}
            </p>

            <div className="hiw-dots">
              {STEPS.map((_, i) => (
                <div key={i}
                  ref={el => dotRefs.current[i] = el}
                  className="hiw-dot"
                  style={{ width: i === 0 ? '22px' : '7px', background: i === 0 ? '#d28c3c' : 'rgba(210,140,60,.18)' }}
                />
              ))}
            </div>

            <p className="hiw-hint">Scroll to continue ↓</p>
          </div>

          {/* ═══ RIGHT ═══ */}
          <div className="hiw-right">
            <div className="hiw-stack">
              {STEPS.map((step, i) => {
                const isMaidanCard = step.isMaidanCard || i === 3; // Fourth card is Maidan card

                return (
                  <div
                    key={step.num}
                    ref={el => cardRefs.current[i] = el}
                    className="hcard"
                    style={{
                      /* Initial diagonal stack — RAF takes over immediately */
                      opacity: i === 0 ? 1 : i === 1 ? 0.75 : i === 2 ? 0.45 : 0.2,
                      transform: i === 0
                        ? 'translate(0px, 0%) scale(1)'
                        : i === 1
                          ? `translate(${CARD_DX}px, ${-CARD_DY}%) scale(0.94)`
                          : i === 2
                            ? `translate(${CARD_DX * 2}px, ${-CARD_DY * 2}%) scale(0.88)`
                            : `translate(${CARD_DX * 3}px, ${-CARD_DY * 3}%) scale(0.82)`,
                      zIndex: 50 - i,
                    }}
                  >
                    <ElectricBorder
                      color="#d28c3c"
                      speed={1.5}
                      chaos={0.12}
                      borderRadius={4}
                      className="w-full h-full"
                    >
                      <div className="hcard-shell">
                        {isMaidanCard ? (
                          /* Maidan card content - centered logo */
                          <div className="maidan-card-content">
                            <div className="maidan-logo">
                              MAIDA<span>N</span>
                            </div>
                          </div>
                        ) : (
                          /* Regular card content */
                          <>
                            {/* Header strip */}
                            <div className="hcard-hdr">
                              <div className="hcard-num-badge">{i + 1}</div>
                              <div>
                                <span className="hcard-step-lbl">Step {step.num}</span>
                                <span className="hcard-step-name">{step.title}</span>
                              </div>
                            </div>

                            {/* Image + white text overlay */}
                            <div className="hcard-body">
                              <img src={step.img} alt={step.title} />
                              <div className="hcard-grad" />
                              <div className="hcard-txt">
                                <div className="hcard-txt-num">{step.num}</div>
                                <div className="hcard-txt-title">{step.title}</div>
                                <p className="hcard-txt-desc">{step.desc}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </ElectricBorder>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}