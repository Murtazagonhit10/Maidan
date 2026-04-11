'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ════════════════════════════════════════════════════════
   DOB PICKER — Drum-roll scroll wheel, portal-rendered
   
   Key fixes vs previous version:
   1. Dropdown rendered via React Portal to document.body —
      completely escapes any overflow:hidden/auto ancestor,
      so it never gets clipped and never blocks page scroll.
   2. Position computed from getBoundingClientRect() so the
      panel floats exactly below the trigger button.
   3. Year list capped at currentYear - 16 (minimum age 16).
   4. Age validation checks actual DOB against today's date.
════════════════════════════════════════════════════════ */

const ITEM_H  = 42;
const VISIBLE = 5;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function range(from, to) {
    const arr = [];
    for (let i = from; i <= to; i++) arr.push(i);
    return arr;
}

function daysInMonth(month, year) {
    if (!month || !year) return 31;
    return new Date(year, month, 0).getDate();
}

/* ── Returns true if the person is >= 16 years old today ── */
export function isAtLeast16({ day, month, year }) {
    if (!day || !month || !year) return false;
    const today    = new Date();
    const birthday = new Date(year, month - 1, day);
    const cutoff   = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return birthday <= cutoff;
}

/* ── Single drum wheel ── */
function Wheel({ items, value, onChange, formatter = v => v, label }) {
    const trackRef  = useRef(null);
    const offsetRef = useRef(0);
    const startYRef = useRef(0);
    const velRef    = useRef(0);
    const lastYRef  = useRef(0);
    const lastTRef  = useRef(0);
    const rafRef    = useRef(null);
    const dragging  = useRef(false);

    const centerIdx = Math.floor(VISIBLE / 2);
    const winH      = ITEM_H * VISIBLE;

    const idxToOffset = idx => -(idx * ITEM_H) + centerIdx * ITEM_H;
    const offsetToIdx = off => {
        const raw = Math.round((centerIdx * ITEM_H - off) / ITEM_H);
        return Math.max(0, Math.min(items.length - 1, raw));
    };

    function snapTo(idx, velocity = 0) {
        cancelAnimationFrame(rafRef.current);
        const target = idxToOffset(idx);
        let cur  = offsetRef.current;
        let vel  = velocity;
        function animate() {
            const diff = target - cur;
            vel  = vel * 0.82 + diff * 0.28;
            cur += vel;
            offsetRef.current = cur;
            if (trackRef.current)
                trackRef.current.style.transform = `translateY(${cur}px)`;
            if (Math.abs(diff) < 0.3 && Math.abs(vel) < 0.2) {
                offsetRef.current = target;
                if (trackRef.current)
                    trackRef.current.style.transform = `translateY(${target}px)`;
                return;
            }
            rafRef.current = requestAnimationFrame(animate);
        }
        animate();
        onChange(items[idx]);
    }

    useEffect(() => {
        const idx = items.indexOf(value);
        const off = idxToOffset(idx >= 0 ? idx : 0);
        offsetRef.current = off;
        if (trackRef.current)
            trackRef.current.style.transform = `translateY(${off}px)`;
    }, []); // eslint-disable-line

    useEffect(() => {
        const idx = items.indexOf(value);
        if (idx >= 0) snapTo(idx);
    }, [value, items.join(',')]); // eslint-disable-line

    const onPointerDown = useCallback(e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        cancelAnimationFrame(rafRef.current);
        dragging.current  = true;
        startYRef.current = e.clientY;
        lastYRef.current  = e.clientY;
        lastTRef.current  = e.timeStamp;
        velRef.current    = 0;
    }, []);

    const onPointerMove = useCallback(e => {
        if (!dragging.current) return;
        const dy = e.clientY - lastYRef.current;
        const dt = Math.max(1, e.timeStamp - lastTRef.current);
        velRef.current     = dy / dt * 16;
        lastYRef.current   = e.clientY;
        lastTRef.current   = e.timeStamp;
        offsetRef.current += dy;
        if (trackRef.current)
            trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
    }, []);

    const onPointerUp = useCallback(e => {
        if (!dragging.current) return;
        dragging.current = false;
        const projOff = offsetRef.current + velRef.current * 8;
        const idx     = offsetToIdx(projOff);
        snapTo(Math.max(0, Math.min(items.length - 1, idx)), velRef.current);
    }, [items]); // eslint-disable-line

    /* Wheel scroll — stopPropagation so the page behind doesn't scroll */
    const onWheel = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        const curIdx = offsetToIdx(offsetRef.current);
        const next   = Math.max(0, Math.min(items.length - 1, curIdx + (e.deltaY > 0 ? 1 : -1)));
        snapTo(next);
    }, [items]); // eslint-disable-line

    const selIdx = items.indexOf(value);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
                fontFamily: "'Mulish',sans-serif", fontSize: '.58rem',
                fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase',
                color: 'rgba(210,140,60,.6)',
            }}>{label}</div>

            <div
                style={{
                    position: 'relative', width: '90px', height: `${winH}px`,
                    overflow: 'hidden', cursor: 'grab',
                    userSelect: 'none', touchAction: 'none',
                    overscrollBehavior: 'contain', 
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheelCapture={onWheel}
            >
                {/* Fade overlay */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                    background: `linear-gradient(to bottom,
                        rgba(8,5,3,0.92) 0%, rgba(8,5,3,0.35) 28%,
                        transparent 45%, transparent 55%,
                        rgba(8,5,3,0.35) 72%, rgba(8,5,3,0.92) 100%)`,
                }} />

                {/* Centre selection frame */}
                <div style={{
                    position: 'absolute', zIndex: 3, pointerEvents: 'none',
                    top: `${centerIdx * ITEM_H}px`, left: 0, right: 0,
                    height: `${ITEM_H}px`,
                    borderTop: '1px solid rgba(210,140,60,.45)',
                    borderBottom: '1px solid rgba(210,140,60,.45)',
                    background: 'rgba(210,140,60,.07)',
                }} />

                {/* Track */}
                <div ref={trackRef} style={{ position: 'absolute', left: 0, right: 0, willChange: 'transform' }}>
                    {items.map((item, i) => (
                        <div
                            key={item}
                            onClick={() => snapTo(i)}
                            style={{
                                height: `${ITEM_H}px`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Syne',sans-serif",
                                fontWeight: i === selIdx ? 700 : 400,
                                fontSize  : i === selIdx ? '1.05rem' : '.9rem',
                                color     : i === selIdx ? '#d28c3c' : 'rgba(245,239,230,.35)',
                                transition: 'color .15s, font-size .15s',
                                cursor    : 'pointer',
                            }}
                        >
                            {formatter(item)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   DOBPicker
════════════════════════════════════════════════════════ */
export default function DOBPicker({ value, onChange, error }) {
    const [open, setOpen]       = useState(false);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef            = useRef(null);
    const panelRef              = useRef(null);
    const [mounted, setMounted] = useState(false);

    /* SSR safety for portal */
    useEffect(() => { setMounted(true); }, []);

    /* Year range: max 80 years ago, min exactly 16 years ago today */
    const today      = new Date();
    const maxYear    = today.getFullYear() - 16;  /* must be at least 16 */
    const minYear    = today.getFullYear() - 80;
    const years      = range(minYear, maxYear).reverse();
    const months     = range(1, 12);
    const maxDay     = daysInMonth(value.month, value.year);
    const days       = range(1, maxDay);

    /* Clamp day if month/year changes reduce max */
    useEffect(() => {
        if (value.day > maxDay) onChange({ ...value, day: maxDay });
    }, [maxDay]); // eslint-disable-line

    /* Compute portal position from trigger rect */
    function updatePos() {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setPanelPos({
            top   : r.bottom + window.scrollY + 8,
            left  : r.left   + window.scrollX,
            width : r.width,
        });
    }

    function openPicker() {
        updatePos();
        setOpen(true);
    }

    /* Reposition on scroll/resize while open */
    useEffect(() => {
        if (!open) return;
        const handler = () => updatePos();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open]);

    /* Close on outside click */
    useEffect(() => {
        if (!open) return;
        function handler(e) {
            if (
                triggerRef.current && triggerRef.current.contains(e.target) ||
                panelRef.current   && panelRef.current.contains(e.target)
            ) return;
            setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const hasValue = value.day && value.month && value.year;
    const display  = hasValue
        ? `${String(value.day).padStart(2,'0')} ${MONTHS[value.month-1]} ${value.year}`
        : '';

    /* ── Portal panel ── */
    const panel = mounted && open && createPortal(
        <div
            ref={panelRef}
            style={{
                position   : 'absolute',
                top        : panelPos.top,
                left       : panelPos.left,
                width      : panelPos.width,
                zIndex     : 99999,
                background : 'rgba(10,7,4,0.97)',
                border     : '1px solid rgba(210,140,60,.25)',
                borderRadius: '4px',
                boxShadow  : '0 24px 60px rgba(0,0,0,.75)',
                backdropFilter: 'blur(12px)',
                animation  : 'dobFadeIn .22s cubic-bezier(.22,1,.36,1)',
            }}
        >
            <style>{`
                @keyframes dobFadeIn {
                    from { opacity:0; transform:translateY(-6px); }
                    to   { opacity:1; transform:translateY(0); }
                }
            `}</style>

            {/* Amber top bar */}
            <div style={{
                height: '2px',
                background: 'linear-gradient(to right, transparent, #d28c3c 20%, #e8a055 50%, #d28c3c 80%, transparent)',
            }} />

            <div style={{
                padding: '1rem .5rem .8rem',
                display: 'flex', gap: '4px',
                justifyContent: 'center', alignItems: 'flex-start',
            }}>
                <Wheel label="Day"   items={days}   value={value.day}   onChange={day   => onChange({ ...value, day   })} formatter={v => String(v).padStart(2,'0')} />
                <div style={{ paddingTop:'2rem', color:'rgba(210,140,60,.3)', fontSize:'1.1rem', lineHeight:`${ITEM_H}px` }}>·</div>
                <Wheel label="Month" items={months} value={value.month} onChange={month => onChange({ ...value, month })} formatter={v => MONTHS[v-1]} />
                <div style={{ paddingTop:'2rem', color:'rgba(210,140,60,.3)', fontSize:'1.1rem', lineHeight:`${ITEM_H}px` }}>·</div>
                <Wheel label="Year"  items={years}  value={value.year}  onChange={year  => onChange({ ...value, year  })} formatter={v => String(v)} />
            </div>

            {/* Age note */}
            <div style={{
                padding: '0 1rem .5rem',
                fontFamily: "'Mulish',sans-serif", fontSize: '.65rem',
                color: 'rgba(245,239,230)', textAlign: 'center', letterSpacing: '.06em',
            }}>
                Must be 16 or older to register
            </div>

            {/* Confirm */}
            <div style={{ padding: '0 1rem .8rem' }}>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                        width: '100%', padding: '.55rem',
                        background: 'rgba(210,140,60,.15)',
                        border: '1px solid rgba(210,140,60,.35)',
                        color: '#d28c3c',
                        fontFamily: "'Mulish',sans-serif", fontSize: '.68rem',
                        fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase',
                        cursor: 'pointer', borderRadius: '2px', transition: 'background .2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(210,140,60,.25)'}
                    onMouseOut={e  => e.currentTarget.style.background = 'rgba(210,140,60,.15)'}
                >
                    Confirm
                </button>
            </div>
        </div>,
        document.body
    );

    return (
        <>
            {panel}

            <div style={{ position: 'relative', marginBottom: '1.35rem' }}>
                <label style={{
                    display: 'block', fontFamily: "'Mulish',sans-serif",
                    fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: open ? '#d28c3c' : 'rgba(245,239,230,.45)',
                    marginBottom: '.45rem', transition: 'color .25s',
                }}>
                    Date of Birth <span style={{ color: '#d28c3c' }}>*</span>
                </label>

                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => open ? setOpen(false) : openPicker()}
                    style={{
                        width: '100%', padding: '.82rem 1.1rem',
                        background: open ? 'rgba(210,140,60,.06)' : 'rgba(245,239,230,.03)',
                        border: `1px solid ${error ? 'rgba(220,80,60,.6)' : open ? 'rgba(210,140,60,.55)' : 'rgba(245,239,230,.12)'}`,
                        color: hasValue ? '#f5efe6' : 'rgba(245,239,230,.2)',
                        fontFamily: "'Mulish',sans-serif", fontSize: '.9rem', fontWeight: 300,
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'border-color .25s, background .25s',
                        borderRadius: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                >
                    <span>{display || 'Select your date of birth'}</span>
                    <span style={{
                        color: '#d28c3c', fontSize: '.75rem',
                        transform: open ? 'rotate(180deg)' : 'none',
                        transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
                        display: 'inline-block',
                    }}>▼</span>
                </button>
                
                
                {/* Underline */}
                <div style={{
                    position: 'absolute', bottom: error ? '1.4rem' : 0,
                    left: 0, height: '2px',
                    width: open || hasValue ? '100%' : '0%',
                    background: error ? 'rgba(220,80,60,.8)' : 'linear-gradient(to right, #d28c3c, #e8a055)',
                    transition: 'width .35s cubic-bezier(.22,1,.36,1)',
                }} />

                {error && (
                    <div style={{
                        fontFamily: "'Mulish',sans-serif", fontSize: '.7rem',
                        color: 'rgba(220,80,60,.85)', marginTop: '.35rem',
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </>
    );
}