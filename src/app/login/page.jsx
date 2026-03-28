'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ElectricBorder from '@/components/ElectricBorder.jsx';
import '@/components/ElectricBorder.css';
import '@/app/tokens.css';
import CountUp from '@/components/CountUp';
import MagneticButton from '@/components/MagneticButton';

/* ════════════════════════════════════════════════════════
   BLUR TEXT — ReactBits BlurText pattern
   Words enter one-by-one: blur(8px) → blur(0)
   Pure CSS keyframe, no GSAP/Framer needed.
════════════════════════════════════════════════════════ */
function BlurText({ text, className, style, staggerMs = 80, delayMs = 0 }) {
    const words = text.split(' ');
    return (
        <span className={className} style={{ display: 'inline', ...style }}>
            <style>{`
                @keyframes blurReveal {
                    from { opacity:0; filter:blur(10px); transform:translateY(6px); }
                    to   { opacity:1; filter:blur(0);    transform:translateY(0); }
                }
            `}</style>
            {words.map((word, i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        animation: `blurReveal .65s cubic-bezier(.22,1,.36,1) both`,
                        animationDelay: `${delayMs + i * staggerMs}ms`,
                        marginRight: i < words.length - 1 ? '0.28em' : 0,
                    }}
                >
                    {word}
                </span>
            ))}
        </span>
    );
}

/* ════════════════════════════════════════════════════════
   STAT CARD — glassy card with hover lift + amber glow
════════════════════════════════════════════════════════ */
function StatCard({ end, suffix = '', label, delay = 0 }) {
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
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0,
                left: hov ? '15%' : '45%', right: hov ? '15%' : '45%',
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
            }}>
                <CountUp end={end} suffix={suffix} duration={1600} delay={delay} />
            </div>
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
   GLOWING FIELD — ambient amber bloom on focus
   + optional right-side password visibility toggle
════════════════════════════════════════════════════════ */
function Field({ label, name, type = 'text', placeholder, value, onChange, error, required, hint, showToggle = false }) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false); /* password show/hide */
    const hasVal = value && value.length > 0;
    const inputType = showToggle ? (visible ? 'text' : 'password') : type;

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

            {/* Amber glow bloom */}
            <div style={{
                position: 'absolute', inset: '-1px', borderRadius: '4px', zIndex: 0, pointerEvents: 'none',
                boxShadow: focused
                    ? '0 0 0 3px rgba(210,140,60,.11), 0 0 20px rgba(210,140,60,.2), 0 0 40px rgba(210,140,60,.07)'
                    : 'none',
                transition: 'box-shadow .4s cubic-bezier(.22,1,.36,1)',
            }} />

            <input
                type={inputType} name={name} placeholder={placeholder} value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete={type === 'password' ? 'current-password' : 'on'}
                style={{
                    position: 'relative', zIndex: 1,
                    width: '100%',
                    padding: showToggle ? '.82rem 2.8rem .82rem 1.1rem' : '.82rem 1.1rem',
                    background: focused ? 'rgba(210,140,60,.055)' : 'rgba(245,239,230,.03)',
                    border: `1px solid ${error ? 'rgba(220,80,60,.6)' : focused ? 'rgba(210,140,60,.6)' : 'rgba(245,239,230,.12)'}`,
                    color: '#f5efe6', fontFamily: "'Mulish',sans-serif",
                    fontSize: '.9rem', fontWeight: 300, outline: 'none',
                    transition: 'border-color .25s, background .25s', borderRadius: '2px',
                    boxSizing: 'border-box',
                }}
            />

            {/* Password visibility toggle */}
            {showToggle && (
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setVisible(v => !v)}
                    style={{
                        position: 'absolute', right: '.75rem',
                        top: '50%', transform: 'translateY(-50%)',
                        zIndex: 2, background: 'none', border: 'none',
                        cursor: 'pointer', padding: '.2rem',
                        color: visible ? '#d28c3c' : 'rgba(245,239,230,.3)',
                        transition: 'color .2s',
                        display: 'flex', alignItems: 'center',
                        marginTop: '0.55rem', /* align with input, not label */
                    }}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? (
                        /* Eye-off icon */
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    ) : (
                        /* Eye icon */
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            )}

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

/* ════════════════════════════════════════════════════════
   ERROR TOAST — slides in from top-right on bad credentials
   ReactBits-style notification with auto-dismiss
════════════════════════════════════════════════════════ */
function ErrorToast({ message, onDismiss }) {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setLeaving(true), 3200);
        const t2 = setTimeout(() => onDismiss(), 3600);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div style={{
            position: 'fixed', top: '1.5rem', right: '1.5rem',
            zIndex: 99999,
            display: 'flex', alignItems: 'flex-start', gap: '.75rem',
            padding: '.85rem 1.1rem',
            background: 'rgba(10,6,3,0.96)',
            border: '1px solid rgba(220,80,60,.45)',
            borderRadius: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(220,80,60,.1) inset',
            backdropFilter: 'blur(16px)',
            maxWidth: '320px',
            animation: leaving
                ? 'toastOut .35s cubic-bezier(.22,1,.36,1) forwards'
                : 'toastIn .45s cubic-bezier(.22,1,.36,1) forwards',
        }}>
            {/* Red top bar */}
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1.5px', background: 'linear-gradient(to right, transparent, rgba(220,80,60,.8), transparent)' }} />

            {/* Icon */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(220,80,60,.12)', border: '1px solid rgba(220,80,60,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '.05rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,80,60,.9)" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '.8rem', color: '#f5efe6', marginBottom: '.2rem', letterSpacing: '-.01em' }}>
                    Sign in failed
                </div>
                <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', color: 'rgba(245,239,230,.5)', lineHeight: 1.55 }}>
                    {message}
                </div>
            </div>

            {/* Dismiss */}
            <button
                type="button"
                onClick={() => { setLeaving(true); setTimeout(onDismiss, 350); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,239,230,.3)', padding: '.1rem', flexShrink: 0, marginTop: '.1rem', transition: 'color .2s' }}
                onMouseOver={e => e.currentTarget.style.color = 'rgba(245,239,230,.7)'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(245,239,230,.3)'}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Progress bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', borderRadius: '0 0 6px 6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(to right, rgba(220,80,60,.6), rgba(220,80,60,.3))', animation: 'toastProgress 3.2s linear forwards' }} />
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   SUCCESS PANEL — shown after successful login
════════════════════════════════════════════════════════ */
function SuccessPanel({ email }) {
    const name = email.split('@')[0] || 'Player';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 0', animation: 'fadeSlideUp .6s cubic-bezier(.22,1,.36,1) forwards' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(210,140,60,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'ringPulse 2s ease-in-out infinite' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(210,140,60,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>✓</div>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-.03em', color: '#f5efe6', marginBottom: '.6rem' }}>
                You&apos;re in. <span style={{ color: '#d28c3c' }}>Welcome back.</span>
            </h2>
            <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.92rem', color: 'rgba(245,239,230,.5)', lineHeight: 1.7, maxWidth: '320px', marginBottom: '2.2rem' }}>
                Signed in as <span style={{ color: 'rgba(245,239,230,.75)' }}>{email}</span>. Your courts are waiting.
            </p>
            <Link href="/venues" style={{ display: 'inline-block', padding: '.82rem 2.4rem', background: '#d28c3c', color: '#0f0a06', fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', fontWeight: 600, letterSpacing: '.13em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px' }}>
                Browse Venues →
            </Link>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   REMEMBER ME CHECKBOX — styled to match register page
════════════════════════════════════════════════════════ */
function RememberMe({ checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => onChange(!checked)}>
            <div style={{
                width: 16, height: 16, flexShrink: 0,
                border: `1px solid ${checked ? '#d28c3c' : 'rgba(245,239,230,.2)'}`,
                borderRadius: '2px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: checked ? 'rgba(210,140,60,.15)' : 'rgba(245,239,230,.03)',
                transition: 'border-color .25s, background .25s',
                boxShadow: checked ? '0 0 8px rgba(210,140,60,.2)' : 'none',
            }}>
                {checked && <span style={{ color: '#d28c3c', fontSize: '.7rem', lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.78rem', color: 'rgba(245,239,230,.42)' }}>
                Keep me signed in
            </span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSub] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [toast, setToast] = useState(null);   /* { message } | null */
    const [shaking, setShaking] = useState(false);  /* form shake on error */
    const formRef = useRef(null);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    function validate() {
        const e = {};
        if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email address';
        if (!form.password || form.password.length < 1) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    /* Shake the form + show toast on credential error */
    function triggerError(message) {
        setShaking(true);
        setToast({ message });
        setTimeout(() => setShaking(false), 600);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSub(true);

        try {
            const response = await fetch('/api/auth/login', {  // ← Changed here
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Email: form.email,
                    Password: form.password,
                    remember: remember
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            setLoggedIn(true);

        } catch (error) {
            triggerError(error.message);
        } finally {
            setSub(false);
        }
    }

    return (
        <>
            {/* Toast notification */}
            {toast && (
                <ErrorToast
                    message={toast.message}
                    onDismiss={() => setToast(null)}
                />
            )}

            <style>{`
        @keyframes ringPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(210,140,60,0);border-color:rgba(210,140,60,.35)}50%{box-shadow:0 0 0 8px rgba(210,140,60,.06);border-color:rgba(210,140,60,.6)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer     { from{transform:translateX(-100%)}to{transform:translateX(100%)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes dotPulse2   { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.55)} }
        @keyframes cardFadeIn  { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        /* Toast animations */
        @keyframes toastIn       { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes toastOut      { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(24px)} }
        @keyframes toastProgress { from{width:100%} to{width:0%} }

        /* Form shake — fires when shaking state is true */
        @keyframes formShake {
            0%,100%{ transform:translateX(0); }
            15%    { transform:translateX(-7px); }
            30%    { transform:translateX(7px); }
            45%    { transform:translateX(-5px); }
            60%    { transform:translateX(5px); }
            75%    { transform:translateX(-3px); }
            90%    { transform:translateX(3px); }
        }
        .form-shake { animation:formShake .55s cubic-bezier(.36,.07,.19,.97) both; }

        /* Page layout */
        .login-page{min-height:100vh;background:#0f0a06;display:grid;grid-template-columns:1fr 1fr;position:relative;}
        .login-page::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(210,140,60,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(210,140,60,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0;opacity:.35;}

        /* Left */
        .login-left{position:relative;overflow:hidden;min-height:100vh;background:#080503;}
        .login-left::after{content:'';position:absolute;top:0;right:-1px;width:1px;height:100%;background:linear-gradient(to bottom,transparent 0%,rgba(210,140,60,.45) 25%,rgba(210,140,60,.7) 55%,transparent 100%);z-index:5;}
        .login-left-content{position:absolute;bottom:0;left:0;right:0;z-index:4;padding:3.5rem 4rem;background:linear-gradient(to top,rgba(8,5,3,0.92) 0%,rgba(8,5,3,0.65) 50%,transparent 100%);}
        .login-left-text{position:relative;margin-bottom:400px;}

        /* Stat cards */
        .stat-cards-row{display:flex;gap:.75rem;flex-wrap:wrap;}
        .stat-cards-row>*{animation:cardFadeIn .5s cubic-bezier(.22,1,.36,1) both;}
        .stat-cards-row>*:nth-child(1){animation-delay:.1s;}
        .stat-cards-row>*:nth-child(2){animation-delay:.22s;}
        .stat-cards-row>*:nth-child(3){animation-delay:.34s;}

        /* Right */
        .login-right{position:relative;display:flex;align-items:center;justify-content:center;padding:6rem 5rem;z-index:2;min-height:100vh;overflow-y:auto;}
        .login-form-wrap{width:100%;max-width:420px;}

        /* Magnetic submit */
        .btn-submit{position:relative;overflow:hidden;width:100%;padding:.92rem;background:#d28c3c;color:#0f0a06;font-family:'Mulish',sans-serif;font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;border:none;cursor:pointer;transition:background .3s,box-shadow .3s;border-radius:2px;margin-top:.5rem;}
        .btn-submit:hover:not(:disabled){background:#e8a055;box-shadow:0 6px 28px rgba(210,140,60,.38),0 2px 10px rgba(210,140,60,.22);}
        .btn-submit:disabled{opacity:.7;cursor:not-allowed;}
        .btn-submit::after{content:'';position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,.18),transparent);transform:translateX(-100%);}
        .btn-submit.loading::after{animation:shimmer .9s ease infinite;}

        .social-btn{display:flex;align-items:center;justify-content:center;gap:.7rem;width:100%;padding:.72rem;background:rgba(245,239,230,.04);border:1px solid rgba(245,239,230,.1);color:rgba(245,239,230,.65);font-family:'Mulish',sans-serif;font-size:.78rem;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:border-color .25s,background .25s,color .25s;}
        .social-btn:hover{border-color:rgba(210,140,60,.35);background:rgba(210,140,60,.05);color:rgba(245,239,230,.9);}

        .divider-row{display:flex;align-items:center;gap:1rem;margin:1.4rem 0;}
        .divider-line{flex:1;height:1px;background:rgba(245,239,230,.08);}
        .divider-txt{font-family:'Mulish',sans-serif;font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(245,239,230,.28);white-space:nowrap;}

        .spinner{width:16px;height:16px;border:2px solid rgba(15,10,6,.3);border-top-color:#0f0a06;border-radius:50%;animation:spin .6s linear infinite;display:inline-block;}

        @media(max-width:900px){.login-page{grid-template-columns:1fr;}.login-left{display:none;}.login-right{padding:5rem 1.5rem;}}
        @media(max-width:480px){.login-right{padding:5rem 1.25rem 3rem;}}

        input:-webkit-autofill,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #120d07 inset !important;-webkit-text-fill-color:#f5efe6 !important;caret-color:#f5efe6;}
        input::placeholder{color:rgba(245,239,230,.2);}
      `}</style>

            <Navbar />

            <div className="login-page">

                {/* ═══════════════════════════════════
                    LEFT — Silk shader + copy
                ═══════════════════════════════════ */}
                <div className="login-left">
                    <ElectricBorder color="#d28c3c" speed={2} chaos={0.3} borderRadius={4} className="w-full h-full">
                        <SilkShader />
                    </ElectricBorder>

                    <div className="login-left-content">
                        <div className="login-left-text">

                            {/* Label */}
                            <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                <span style={{ width: '20px', height: '1px', background: '#d28c3c', display: 'block' }} />
                                Lahore · Indoor Sports
                            </div>

                            {/* BlurText headline — different copy from register */}
                            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(2rem,3.5vw,3.2rem)', lineHeight: .96, letterSpacing: '-.03em', marginBottom: '1rem', margin: '0 0 1rem' }}>
                                <BlurText
                                    text="Welcome"
                                    style={{ color: '#f5efe6', display: 'block' }}
                                    staggerMs={90}
                                    delayMs={100}
                                />
                                <BlurText
                                    text="back."
                                    style={{ color: '#d28c3c', display: 'block' }}
                                    staggerMs={110}
                                    delayMs={280}
                                />
                            </h2>

                            <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.88rem', fontWeight: 300, color: 'rgba(245,239,230,.48)', lineHeight: 1.78, maxWidth: '300px', marginBottom: '2rem', marginTop: '1rem' }}>
                                Your courts are waiting. Sign in to book instantly across Lahore&apos;s top indoor facilities.
                            </p>

                            {/* CountUp Stat Cards */}
                            <div className="stat-cards-row">
                                <StatCard end={10} suffix="k+" label="Bookings" delay={200} />
                                <StatCard end={120} suffix="+" label="Venues" delay={350} />
                                <StatCard end={100} suffix="%" label="Free" delay={500} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════
                    RIGHT — Login form
                ═══════════════════════════════════ */}
                <div className="login-right">
                    <div className="login-form-wrap">

                        {loggedIn ? <SuccessPanel email={form.email} /> : (
                            <>
                                {/* Header */}
                                <div style={{ marginBottom: '2.4rem' }}>
                                    <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.65rem', fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#d28c3c', marginBottom: '.7rem', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                                        <span style={{ width: '16px', height: '1px', background: '#d28c3c', display: 'block' }} />
                                        Sign in
                                    </div>
                                    <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(1.7rem,3vw,2.4rem)', lineHeight: .97, letterSpacing: '-.03em', color: '#f5efe6', marginBottom: '.7rem' }}>
                                        Back to <span style={{ color: '#d28c3c' }}>Maidan.</span>
                                    </h1>
                                    <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.86rem', fontWeight: 300, color: 'rgba(245,239,230,.42)', lineHeight: 1.7 }}>
                                        New here?{' '}
                                        <Link href="/register" style={{ color: '#d28c3c', textDecoration: 'none', fontWeight: 500 }}>
                                            Create an account →
                                        </Link>
                                    </p>
                                </div>

                                {/* Social login */}
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
                                    <span className="divider-txt">or sign in with email</span>
                                    <div className="divider-line" />
                                </div>

                                {/* Form with shake-on-error */}
                                <div
                                    ref={formRef}
                                    className={shaking ? 'form-shake' : ''}
                                    onAnimationEnd={() => setShaking(false)}
                                >
                                    <form onSubmit={handleSubmit} noValidate>
                                        <Field
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={e => set('email', e.target.value)}
                                            error={errors.email}
                                            required
                                        />
                                        <Field
                                            label="Password"
                                            name="password"
                                            type="password"
                                            placeholder="Your password"
                                            value={form.password}
                                            onChange={e => set('password', e.target.value)}
                                            error={errors.password}
                                            required
                                            showToggle
                                        />

                                        {/* Remember me + Forgot password row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.6rem', marginTop: '-.2rem' }}>
                                            <RememberMe checked={remember} onChange={setRemember} />
                                            <Link
                                                href="/forgot-password"
                                                style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.75rem', color: 'rgba(210,140,60,.7)', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
                                                onMouseOver={e => e.currentTarget.style.color = '#d28c3c'}
                                                onMouseOut={e => e.currentTarget.style.color = 'rgba(210,140,60,.7)'}
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        {/* Magnetic Submit */}
                                        <MagneticButton
                                            type="submit"
                                            className={`btn-submit${submitting ? ' loading' : ''}`}
                                            disabled={submitting}
                                            strength={0.28}
                                        >
                                            {submitting
                                                ? <><span className="spinner" /><span style={{ marginLeft: '.6rem' }}>Signing in…</span></>
                                                : 'Sign In →'}
                                        </MagneticButton>
                                    </form>
                                </div>

                                {/* Terms notice */}
                                <p style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(245,239,230,.22)', lineHeight: 1.65, marginTop: '1.4rem', textAlign: 'center' }}>
                                    By signing in you agree to our{' '}
                                    <Link href="/terms" style={{ color: 'rgba(210,140,60,.55)', textDecoration: 'none' }}>Terms</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" style={{ color: 'rgba(210,140,60,.55)', textDecoration: 'none' }}>Privacy Policy</Link>
                                </p>
                            </>
                        )}

                        {/* Brand footer */}
                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(210,140,60,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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