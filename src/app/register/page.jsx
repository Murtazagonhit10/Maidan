'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ElectricBorder from '@/components/ElectricBorder.jsx';
import '@/components/ElectricBorder.css';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import '@/app/tokens.css';
import CNICField from '@/components/CNICField';
import PhoneField from '@/components/PhoneField';
import DOBPicker, { isAtLeast16 } from '@/components/DOBPicker';

/* ════════════════════════════════════════════════════════
   1. MAGNETIC BUTTON — ReactBits "Magnet" pattern
      Button content softly follows cursor inside bounds,
      springs back on leave. No deps — pure RAF + lerp.
════════════════════════════════════════════════════════ */
function MagneticButton({ children, className, disabled, style, type = 'button', onClick, strength = 0.32 }) {
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
            inner.style.transform = `translate(${cur.current.x}px,${cur.current.y}px)`;
            animRef.current = requestAnimationFrame(tick);
        }
        tick();

        const onMove = e => {
            if (!hovered.current || disabled) return;
            const r = btn.getBoundingClientRect();
            tgt.current = {
                x: (e.clientX - (r.left + r.width / 2)) * strength,
                y: (e.clientY - (r.top + r.height / 2)) * strength,
            };
        };
        const onEnter = () => { hovered.current = true; };
        const onLeave = () => { hovered.current = false; tgt.current = { x: 0, y: 0 }; };

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

    return (
        <button
            ref={btnRef} type={type}
            className={className} disabled={disabled}
            style={{ ...style, overflow: 'hidden', position: 'relative' }}
            onClick={onClick}
        >
            <span ref={innerRef} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: '100%', pointerEvents: 'none',
            }}>
                {children}
            </span>
        </button>
    );
}

/* ════════════════════════════════════════════════════════
   2. STAT CARD — glassy card with hover lift + amber glow
      Inspired by ReactBits SpotlightCard / TiltCard
════════════════════════════════════════════════════════ */
function StatCard({ value, label }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: 'relative',
                padding: '.78rem 1.15rem',
                background: hov ? 'rgba(210,140,60,.09)' : 'rgba(245,239,230,.03)',
                border: `1px solid ${hov ? 'rgba(210,140,60,.48)' : 'rgba(245,239,230,.1)'}`,
                borderRadius: '6px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: hov
                    ? '0 8px 28px rgba(210,140,60,.2), 0 0 0 1px rgba(210,140,60,.1) inset'
                    : '0 2px 8px rgba(0,0,0,.3)',
                transform: hov ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all .38s cubic-bezier(.22,1,.36,1)',
                cursor: 'default', minWidth: '68px',
                overflow: 'hidden',
            }}
        >
            {/* Top amber accent line slides in on hover */}
            <div style={{
                position: 'absolute', top: 0, left: hov ? '15%' : '45%', right: hov ? '15%' : '45%',
                height: '1.5px',
                background: 'linear-gradient(to right, transparent, #d28c3c, transparent)',
                opacity: hov ? 1 : 0,
                transition: 'all .4s cubic-bezier(.22,1,.36,1)',
            }} />
            <div style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                fontSize: '1.32rem', color: '#d28c3c', lineHeight: 1,
                transform: hov ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
                display: 'inline-block',
            }}>{value}</div>
            <div style={{
                fontFamily: "'Mulish',sans-serif", fontSize: '.58rem',
                letterSpacing: '.14em', textTransform: 'uppercase',
                color: hov ? 'rgba(245,239,230,.5)' : 'rgba(245,239,230,.28)',
                marginTop: '.25rem', transition: 'color .25s',
            }}>{label}</div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   TRUE SILK — WebGL fragment shader background
════════════════════════════════════════════════════════ */
function SilkShader() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
        if (!gl) return;
        const VS = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;
        const FS = `
      precision highp float;
      uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
      float hash(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y)*2.0-1.0;}
      float fbm(vec2 p){float v=0.0,amp=0.5,freq=1.0;
        for(int i=0;i<6;i++){v+=amp*noise(p*freq);amp*=0.5;freq*=2.1;p+=vec2(0.3,0.7);}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_res;uv.y=1.0-uv.y;
        vec2 m=u_mouse*2.0-1.0;float t=u_time*0.18;
        vec2 q;q.x=fbm(uv+t*0.3);q.y=fbm(uv+vec2(1.7,9.2)+t*0.25);
        vec2 r;r.x=fbm(uv+1.2*q+vec2(1.7,9.2)+t*0.15);r.y=fbm(uv+1.2*q+vec2(8.3,2.8)+t*0.12);
        r+=m*0.08;float f=fbm(uv+1.5*r);float light=f*0.5+0.5;
        vec3 c1=vec3(0.055,0.030,0.008),c2=vec3(0.58,0.32,0.08),c3=vec3(0.88,0.56,0.18),c4=vec3(0.96,0.82,0.55);
        vec3 col;
        if(light<0.25)col=mix(c1,c2,light/0.25);
        else if(light<0.55)col=mix(c2,c3,(light-0.25)/0.30);
        else if(light<0.82)col=mix(c3,c4,(light-0.55)/0.27);
        else col=mix(c4,vec3(1.0,0.95,0.80),(light-0.82)/0.18);
        vec2 vign=uv*(1.0-uv.yx);float v=pow(vign.x*vign.y*16.0,0.3);
        col*=mix(0.12,1.0,v);col+=vec3(0.04,0.022,0.005)*(1.0-uv.y)*0.4;
        gl_FragColor=vec4(col,1.0);}`;
        function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog); gl.useProgram(prog);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        const uRes = gl.getUniformLocation(prog, 'u_res'), uTime = gl.getUniformLocation(prog, 'u_time'), uMouse = gl.getUniformLocation(prog, 'u_mouse');
        let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
        const onMove = e => { const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = 1.0 - (e.clientY - r.top) / r.height; };
        canvas.parentElement?.addEventListener('mousemove', onMove);
        function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; gl.viewport(0, 0, canvas.width, canvas.height); }
        resize(); const ro = new ResizeObserver(resize); ro.observe(canvas);
        const t0 = performance.now(); let raf;
        function render() {
            const t = (performance.now() - t0) / 1000; smx += (mx - smx) * 0.045; smy += (my - smy) * 0.045;
            gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, t); gl.uniform2f(uMouse, smx, smy);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); raf = requestAnimationFrame(render);
        }
        render();
        return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.parentElement?.removeEventListener('mousemove', onMove); gl.deleteProgram(prog); gl.deleteBuffer(buf); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 0 }} />;
}

/* ════════════════════════════════════════════════════════
   3. GLOWING FIELD — ambient amber bloom on focus
      ReactBits-style layered box-shadow glow ring
════════════════════════════════════════════════════════ */
function Field({ label, name, type = 'text', placeholder, value, onChange, error, required, hint }) {
    const [focused, setFocused] = useState(false);
    const hasVal = value && value.length > 0;
    return (
        <div style={{ position: 'relative', marginBottom: '1.35rem' }}>
            <label style={{
                display: 'block', fontFamily: "'Mulish',sans-serif",
                fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
                color: focused ? '#d28c3c' : 'rgba(245,239,230,.45)',
                marginBottom: '.45rem', transition: 'color .25s',
            }}>
                {label}{required && <span style={{ color: '#d28c3c', marginLeft: '.2rem' }}>*</span>}
            </label>

            {/* Glow bloom — behind the input */}
            <div style={{
                position: 'absolute', inset: '-1px', borderRadius: '4px', zIndex: 0, pointerEvents: 'none',
                boxShadow: focused
                    ? '0 0 0 3px rgba(210,140,60,.11), 0 0 20px rgba(210,140,60,.2), 0 0 40px rgba(210,140,60,.07)'
                    : 'none',
                transition: 'box-shadow .4s cubic-bezier(.22,1,.36,1)',
            }} />

            <input
                type={type} name={name} placeholder={placeholder} value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete={type === 'password' ? 'new-password' : 'on'}
                style={{
                    position: 'relative', zIndex: 1,
                    width: '100%', padding: '.82rem 1.1rem',
                    background: focused ? 'rgba(210,140,60,.055)' : 'rgba(245,239,230,.03)',
                    border: `1px solid ${error ? 'rgba(220,80,60,.6)' : focused ? 'rgba(210,140,60,.6)' : 'rgba(245,239,230,.12)'}`,
                    color: '#f5efe6', fontFamily: "'Mulish',sans-serif",
                    fontSize: '.9rem', fontWeight: 300, outline: 'none',
                    transition: 'border-color .25s, background .25s', borderRadius: '2px',
                }}
            />
            {/* Bottom underline */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, height: '2px', zIndex: 2,
                width: focused || hasVal ? '100%' : '0%',
                background: error ? 'rgba(220,80,60,.8)' : 'linear-gradient(to right, #d28c3c, #e8a055)',
                transition: 'width .35s cubic-bezier(.22,1,.36,1)',
            }} />
            {error && <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(220,80,60,.85)', marginTop: '.35rem' }}>{error}</div>}
            {hint && !error && <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.68rem', color: 'rgba(245,239,230,.28)', marginTop: '.3rem' }}>{hint}</div>}
        </div>
    );
}

function RoleSelector({ value, onChange }) {
    const roles = [
        { id: 'player', icon: '🏏', label: 'Player', sub: 'Book courts & play' },
        { id: 'owner', icon: '🏟️', label: 'Owner', sub: 'List & manage facilities' },
    ];
    return (
        <div style={{ marginBottom: '1.35rem' }}>
            <label style={{ display: 'block', fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(245,239,230,.45)', marginBottom: '.45rem' }}>
                I am a <span style={{ color: '#d28c3c' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
                {roles.map(r => (
                    <button key={r.id} type="button" onClick={() => onChange(r.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.85rem 1.1rem',
                        background: value === r.id ? 'rgba(210,140,60,.1)' : 'rgba(245,239,230,.03)',
                        border: `1px solid ${value === r.id ? 'rgba(210,140,60,.55)' : 'rgba(245,239,230,.12)'}`,
                        boxShadow: value === r.id ? '0 0 16px rgba(210,140,60,.14)' : 'none',
                        cursor: 'pointer', textAlign: 'left', transition: 'all .25s', borderRadius: '2px',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {value === r.id && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right,#d28c3c,#e8a055)' }} />}
                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{r.icon}</span>
                        <div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.88rem', color: value === r.id ? '#f5efe6' : 'rgba(245,239,230,.5)', transition: 'color .25s' }}>{r.label}</div>
                            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.68rem', color: value === r.id ? 'rgba(245,239,230,.5)' : 'rgba(245,239,230,.25)', transition: 'color .25s', marginTop: '.12rem' }}>{r.sub}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PasswordMeter({ password }) {
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    const strength = checks.filter(Boolean).length;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#e05050', '#d4a030', '#7db86c', '#50c878'];
    if (!password) return null;
    return (
        <div style={{ marginTop: '.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '.35rem' }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? colors[strength] : 'rgba(245,239,230,.1)', transition: 'background .35s' }} />)}
            </div>
            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', color: colors[strength], letterSpacing: '.08em' }}>{labels[strength]}</div>
        </div>
    );
}

function SuccessPanel({ name }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 0', animation: 'fadeSlideUp .6s cubic-bezier(.22,1,.36,1) forwards' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(210,140,60,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'ringPulse 2s ease-in-out infinite' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(210,140,60,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>✓</div>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-.03em', color: '#f5efe6', marginBottom: '.6rem' }}>
                Welcome, <span style={{ color: '#d28c3c' }}>{name}.</span>
            </h2>
            <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.92rem', color: 'rgba(245,239,230,.5)', lineHeight: 1.7, maxWidth: '320px', marginBottom: '2.2rem' }}>
                Your Maidan account is ready. Time to find your court.
            </p>
            <Link href="/venues" style={{ display: 'inline-block', padding: '.82rem 2.4rem', background: '#d28c3c', color: '#0f0a06', fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', fontWeight: 600, letterSpacing: '.13em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Browse Venues →
            </Link>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   4. DOB PICKER — drum-scroll with morphing dropdown
      Panel opens with scaleY + opacity spring, collapses
      with a quick ease-in snap. Focus glow on trigger too.
════════════════════════════════════════════════════════ */
const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_H = 40;
const rangeArr = (min, max) => { const a = []; for (let i = min; i <= max; i++) a.push(i); return a; };
const daysInMonth = (m, y) => (!m || !y) ? 31 : new Date(y, m, 0).getDate();

function Wheel({ label, items, value, onChange, formatter }) {
    const listRef = useRef(null);
    const drag = useRef(false), sy = useRef(0), ss = useRef(0);

    const scrollTo = useCallback((val, smooth = true) => {
        const idx = items.indexOf(val);
        if (idx === -1 || !listRef.current) return;
        listRef.current.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' });
    }, [items]);

    useEffect(() => { scrollTo(value, false); }, [value, scrollTo]);

    const onScroll = useCallback(() => {
        if (!listRef.current) return;
        const idx = Math.round(listRef.current.scrollTop / ITEM_H);
        const snapped = Math.max(0, Math.min(idx, items.length - 1));
        if (items[snapped] !== value) onChange(items[snapped]);
    }, [items, value, onChange]);

    useEffect(() => {
        const el = listRef.current; if (!el) return;
        let t; const h = () => { clearTimeout(t); t = setTimeout(onScroll, 80); };
        el.addEventListener('scroll', h, { passive: true });
        return () => { el.removeEventListener('scroll', h); clearTimeout(t); };
    }, [onScroll]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(210,140,60,.55)', marginBottom: '.4rem' }}>{label}</div>
            <div style={{ position: 'relative', height: `${ITEM_H * 3}px`, overflow: 'hidden', width: '100%' }}>
                {/* Selection highlight bar */}
                <div style={{ position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H, background: 'rgba(210,140,60,.07)', borderRadius: '3px', borderTop: '1px solid rgba(210,140,60,.2)', borderBottom: '1px solid rgba(210,140,60,.2)', pointerEvents: 'none', zIndex: 2 }} />
                <div ref={listRef} style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingTop: ITEM_H, paddingBottom: ITEM_H }}
                    onMouseDown={e => { drag.current = true; sy.current = e.clientY; ss.current = listRef.current.scrollTop; }}
                    onMouseMove={e => { if (!drag.current) return; listRef.current.scrollTop = ss.current - (e.clientY - sy.current); }}
                    onMouseUp={() => { drag.current = false; onScroll(); }}
                    onMouseLeave={() => { if (drag.current) { drag.current = false; onScroll(); } }}
                >
                    <style>{`div::-webkit-scrollbar{display:none}`}</style>
                    {items.map(item => {
                        const active = item === value;
                        return (
                            <div key={item} onClick={() => { onChange(item); scrollTo(item); }}
                                style={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: active ? 700 : 400, fontSize: active ? '.92rem' : '.8rem', color: active ? '#f5efe6' : 'rgba(245,239,230,.28)', scrollSnapAlign: 'start', cursor: 'pointer', transition: 'color .2s,font-size .2s', userSelect: 'none' }}>
                                {formatter(item)}
                            </div>
                        );
                    })}
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H, background: 'linear-gradient(to bottom,rgba(10,7,4,.97),transparent)', pointerEvents: 'none', zIndex: 3 }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H, background: 'linear-gradient(to top,rgba(10,7,4,.97),transparent)', pointerEvents: 'none', zIndex: 3 }} />
            </div>
        </div>
    );
}

function TermsCheck({ agreed, onChange }) {
    return (
        <div className="check-row">
            <div className={`check-box${agreed ? ' checked' : ''}`} onClick={() => onChange(!agreed)} role="checkbox" aria-checked={agreed} tabIndex={0} onKeyDown={e => e.key === ' ' && onChange(!agreed)}>
                {agreed && <span style={{ color: '#d28c3c', fontSize: '.7rem', lineHeight: 1 }}>✓</span>}
            </div>
            <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.78rem', color: 'rgba(245,239,230,.42)', lineHeight: 1.6 }}>
                I agree to Maidan&apos;s{' '}
                <Link href="/terms" style={{ color: '#d28c3c', textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" style={{ color: '#d28c3c', textDecoration: 'none' }}>Privacy Policy</Link>
            </p>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', cnic: '',
        dob: { day: 1, month: 1, year: 2000 },
        password: '', confirm: '', role: 'player'
    });
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [submitting, setSub] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.includes('@')) e.email = 'Enter a valid email';
        if (!form.phone || form.phone.replace(/\D/g, '').length !== 10) e.phone = 'Enter a valid 10-digit number';
        if (!form.cnic || form.cnic.length !== 15) e.cnic = 'Enter a valid 15-character CNIC (00000-0000000-0)';
        if (!form.dob.day || !form.dob.month || !form.dob.year) e.dob = 'Select your date of birth';
        else if (!isAtLeast16(form.dob)) e.dob = 'You must be at least 16 years old to register';
        if (step === 2) {
            if (form.password.length < 8) e.password = 'At least 8 characters';
            if (form.password !== form.confirm) e.confirm = "Passwords don't match";
            if (!termsAgreed) e.terms = 'You must agree to the Terms and Privacy Policy';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleNext(e) {
        e.preventDefault();
        if (!validate()) return;

        if (step === 1) {
            setStep(2);
            return;
        }

        setSub(true);

        try {
            // Format DOB as YYYY-MM-DD
            const dobString = `${form.dob.year}-${String(form.dob.month).padStart(2, '0')}-${String(form.dob.day).padStart(2, '0')}`;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Email: form.email,
                    CNIC: form.cnic,
                    Password: form.password,
                    FullName: form.name,
                    PhoneNumber: form.phone,
                    Role: form.role === 'player' ? 'Player' : 'Owner',
                    DateOfBirth: dobString  // ← Add this
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            setStep(3);

        } catch (error) {
            alert(error.message);
        } finally {
            setSub(false);
        }
    }

    const firstName = form.name.trim().split(' ')[0] || 'Champ';

    return (
        <>
            <style>{`
        @keyframes ringPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(210,140,60,0);border-color:rgba(210,140,60,.35)}50%{box-shadow:0 0 0 8px rgba(210,140,60,.06);border-color:rgba(210,140,60,.6)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer     { from{transform:translateX(-100%)}to{transform:translateX(100%)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes dotPulse2   { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.55)} }
        @keyframes cardFadeIn  { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        .reg-page{min-height:100vh;background:#0f0a06;display:grid;grid-template-columns:1fr 1fr;position:relative;}
        .reg-page::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(210,140,60,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(210,140,60,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0;opacity:.35;}

        .reg-left{position:relative;overflow:hidden;min-height:100vh;background:#080503;}
        .reg-left::after{content:'';position:absolute;top:0;right:-1px;width:1px;height:100%;background:linear-gradient(to bottom,transparent 0%,rgba(210,140,60,.45) 25%,rgba(210,140,60,.7) 55%,transparent 100%);z-index:5;}
        .reg-left-content{position:absolute;bottom:0;left:0;right:0;z-index:4;padding:3.5rem 4rem;background:linear-gradient(to top,rgba(8,5,3,0.92) 0%,rgba(8,5,3,0.65) 50%,transparent 100%);}
        .reg-left-text{position:relative;margin-bottom:400px;}


        /* Stat cards */
        .stat-cards-row{display:flex;gap:.75rem;flex-wrap:wrap;}
        .stat-cards-row>*{animation:cardFadeIn .5s cubic-bezier(.22,1,.36,1) both;}
        .stat-cards-row>*:nth-child(1){animation-delay:.1s;}
        .stat-cards-row>*:nth-child(2){animation-delay:.22s;}
        .stat-cards-row>*:nth-child(3){animation-delay:.34s;}

        .reg-right{position:relative;display:flex;align-items:center;justify-content:center;padding:6rem 5rem;z-index:2;min-height:100vh;overflow-y:auto;}
        .reg-form-wrap{width:100%;max-width:440px;padding-bottom:150px;}
        .step-dots{display:flex;align-items:center;gap:.5rem;margin-bottom:2.5rem;}
        .step-dot{height:2px;border-radius:2px;transition:all .4s cubic-bezier(.22,1,.36,1);}

        /* Magnetic submit */
        .btn-submit{position:relative;overflow:hidden;width:100%;padding:.92rem;background:#d28c3c;color:#0f0a06;font-family:'Mulish',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;border:none;cursor:pointer;transition:background .3s,box-shadow .3s;border-radius:2px;margin-top:.5rem;}
        .btn-submit:hover:not(:disabled){background:#e8a055;box-shadow:0 6px 28px rgba(210,140,60,.38),0 2px 10px rgba(210,140,60,.22);}
        .btn-submit:disabled{opacity:.7;cursor:not-allowed;}
        .btn-submit::after{content:'';position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,.18),transparent);transform:translateX(-100%);}
        .btn-submit.loading::after{animation:shimmer .9s ease infinite;}

        .btn-back{background:rgba(210,140,60,.1);border:1px solid rgba(210,140,60,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6rem;width:fit-content;padding:.6rem 1.2rem;font-family:'Mulish',sans-serif;font-size:.75rem;font-weight:500;color:#d28c3c;letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.8rem;transition:all .25s ease;border-radius:2px;}
        .btn-back:hover{background:rgba(210,140,60,.2);border-color:#d28c3c;transform:translateX(-2px);}

        .social-btn{display:flex;align-items:center;justify-content:center;gap:.7rem;width:100%;padding:.72rem;background:rgba(245,239,230,.04);border:1px solid rgba(245,239,230,.1);color:rgba(245,239,230,.65);font-family:'Mulish',sans-serif;font-size:.78rem;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:border-color .25s,background .25s,color .25s;}
        .social-btn:hover{border-color:rgba(210,140,60,.35);background:rgba(210,140,60,.05);color:rgba(245,239,230,.9);}

        .divider-row{display:flex;align-items:center;gap:1rem;margin:1.4rem 0;}
        .divider-line{flex:1;height:1px;background:rgba(245,239,230,.08);}
        .divider-txt{font-family:'Mulish',sans-serif;font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(245,239,230,.28);white-space:nowrap;}

        .spinner{width:16px;height:16px;border:2px solid rgba(15,10,6,.3);border-top-color:#0f0a06;border-radius:50%;animation:spin .6s linear infinite;display:inline-block;}

        .check-row{display:flex;align-items:flex-start;gap:.75rem;margin:1rem 0 1.4rem;}
        .check-box{width:16px;height:16px;flex-shrink:0;border:1px solid rgba(245,239,230,.2);border-radius:2px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:.1rem;transition:border-color .25s,background .25s;background:rgba(245,239,230,.03);}
        .check-box.checked{border-color:#d28c3c;background:rgba(210,140,60,.15);}

        @media(max-width:900px){.reg-page{grid-template-columns:1fr;}.reg-left{display:none;}.reg-right{padding:5rem 1.5rem;}}
        @media(max-width:480px){.reg-right{padding:5rem 1.25rem 3rem;}}

        input:-webkit-autofill,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #120d07 inset !important;-webkit-text-fill-color:#f5efe6 !important;caret-color:#f5efe6;}
        input::placeholder{color:rgba(245,239,230,.2);}
      `}</style>

            <Navbar />

            <div className="reg-page">

                {/* ═══ LEFT ═══ */}
                <div className="reg-left">
                    <ElectricBorder color="#d28c3c"
                        speed={2}
                        chaos={0.3}
                        borderRadius={4}
                        className="w-full h-full"> <SilkShader />
                    </ElectricBorder>
                    <div className="reg-left-content">
                        <div className="reg-left-text">
                            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                <span style={{ width: '20px', height: '1px', background: '#d28c3c', display: 'block' }} />
                                Lahore · Indoor Sports
                            </div>
                            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(2rem,3.5vw,3.2rem)', lineHeight: .96, letterSpacing: '-.03em', color: '#f5efe6', marginBottom: '1rem' }}>
                                Your court is<br />
                                <span style={{ color: '#d28c3c' }}>one tap away.</span>
                            </h2>
                            <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.88rem', fontWeight: 300, color: 'rgba(245,239,230,.48)', lineHeight: 1.78, maxWidth: '300px', marginBottom: '2rem' }}>
                                Join thousands of players and facility owners already booking smarter across Lahore.
                            </p>

                            {/* ── Glassy Stat Cards ── */}
                            <div className="stat-cards-row">
                                <StatCard value="10k+" label="Bookings" />
                                <StatCard value="120+" label="Venues" />
                                <StatCard value="Free" label="Always" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT ═══ */}

                <div className="reg-right">
                    <div className="reg-form-wrap">

                        {step === 3 ? <SuccessPanel name={firstName} /> : (
                            <>
                                <div className="step-dots">
                                    {[1, 2].map(s => (
                                        <div key={s} className="step-dot" style={{ width: step === s ? '24px' : '7px', background: step >= s ? '#d28c3c' : 'rgba(210,140,60,.18)' }} />
                                    ))}
                                    <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,239,230,.3)', marginLeft: '.3rem' }}>
                                        Step {step} of 2
                                    </span>
                                </div>

                                <div style={{ marginBottom: '2.2rem' }}>
                                    <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '.7rem', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                                        <span style={{ width: '16px', height: '1px', background: '#d28c3c', display: 'block' }} />
                                        {step === 1 ? 'Create account' : 'Secure your account'}
                                    </div>
                                    <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,3vw,2.4rem)', lineHeight: .97, letterSpacing: '-.03em', color: '#f5efe6' }}>
                                        {step === 1 ? <>Join <span style={{ color: '#d28c3c' }}>Maidan.</span></> : <>Set your <span style={{ color: '#d28c3c' }}>password.</span></>}
                                    </h1>
                                    {step === 1 && (
                                        <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.86rem', fontWeight: 300, color: 'rgba(245,239,230,.42)', lineHeight: 1.7, marginTop: '.7rem' }}>
                                            Already have an account?{' '}
                                            <Link href="/login" style={{ color: '#d28c3c', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
                                        </p>
                                    )}
                                </div>

                                {step === 1 && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
                                            <button type="button" className="social-btn">
                                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                                Google
                                            </button>
                                            <button type="button" className="social-btn">
                                                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                Facebook
                                            </button>
                                        </div>
                                        <div className="divider-row">
                                            <div className="divider-line" />
                                            <span className="divider-txt">or continue with email</span>
                                            <div className="divider-line" />
                                        </div>
                                    </>
                                )}

                                {step === 2 && <button className="btn-back" type="button" onClick={() => setStep(1)}>← Back</button>}

                                <form onSubmit={handleNext} noValidate>
                                    {step === 1 && (
                                        <>
                                            <RoleSelector value={form.role} onChange={v => set('role', v)} />
                                            <Field label="Full Name" name="name" placeholder="e.g. Hassan Raza" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} required />
                                            <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} required />
                                            <PhoneField value={form.phone} onChange={v => set('phone', v)} error={errors.phone} />
                                            <CNICField value={form.cnic} onChange={v => set('cnic', v)} error={errors.cnic} />
                                            <DOBPicker
                                                value={form.dob}
                                                onChange={v => set('dob', v)}
                                                error={errors.dob}
                                            />
                                        </>
                                    )}
                                    {step === 2 && (
                                        <>
                                            <Field label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} required />
                                            <PasswordMeter password={form.password} />
                                            <Field label="Confirm Password" name="confirm" type="password" placeholder="Re-enter your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} error={errors.confirm} required />
                                            <TermsCheck agreed={termsAgreed} onChange={setTermsAgreed} />
                                            {errors.terms && <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(220,80,60,.85)', marginTop: '-.5rem', marginBottom: '1rem' }}>{errors.terms}</div>}
                                        </>
                                    )}

                                    {/* ── Magnetic Submit Button ── */}
                                    <MagneticButton
                                        type="submit"
                                        className={`btn-submit${submitting ? ' loading' : ''}`}
                                        disabled={submitting}
                                        strength={0.28}
                                    >
                                        {submitting
                                            ? <><span className="spinner" /><span style={{ marginLeft: '.6rem' }}>Creating account…</span></>
                                            : step === 1 ? 'Continue →' : 'Create My Account'}
                                    </MagneticButton>
                                </form>
                            </>
                        )}

                        <div style={{ marginTop: step === 3 ? '1.5rem' : '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(210,140,60,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.15rem', letterSpacing: '.08em', color: '#f5efe6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.05rem' }}>
                                MAIDA<span style={{ color: '#d28c3c' }}>N</span>
                                <span style={{ width: '6px', height: '6px', background: '#d28c3c', borderRadius: '50%', marginLeft: '.12rem', marginBottom: '.28rem', flexShrink: 0, animation: 'dotPulse2 2.5s ease-in-out infinite', display: 'inline-block' }} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}