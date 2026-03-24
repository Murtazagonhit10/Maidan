'use client';
import { useState } from 'react';

/* ════════════════════════════════════════════════════════
   PhoneField
   Prefix +92 is non-editable. User types remaining 10 digits.
   Parent receives only the 10 digits via onChange.
════════════════════════════════════════════════════════ */
export default function PhoneField({ value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const isComplete = value.replace(/\D/g, '').length === 10;
    const showOk = isComplete && !error;

    function handleChange(e) {
        /* Strip non-digits, cap at 10 */
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        onChange(digits);
    }

    /* Display with a space after 3rd digit for readability: 300 1234567 */
    function display(raw) {
        const d = raw.replace(/\D/g, '');
        if (d.length <= 3) return d;
        return d.slice(0, 3) + ' ' + d.slice(3);
    }

    return (
        <div style={{ position: 'relative', marginBottom: '1.35rem' }}>
            <label style={{
                display: 'block', fontFamily: "'Mulish',sans-serif",
                fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: focused ? '#d28c3c' : 'rgba(245,239,230,.45)',
                marginBottom: '.45rem', transition: 'color .25s',
            }}>
                Phone Number <span style={{ color: '#d28c3c' }}>*</span>
            </label>

            <div style={{
                display: 'flex',
                border: `1px solid ${error ? 'rgba(220,80,60,.6)' : focused ? 'rgba(210,140,60,.55)' : 'rgba(245,239,230,.12)'}`,
                background: focused ? 'rgba(210,140,60,.06)' : 'rgba(245,239,230,.03)',
                borderRadius: '2px',
                overflow: 'hidden',
                transition: 'border-color .25s, background .25s',
                position: 'relative',
            }}>
                {/* Non-editable +92 prefix */}
                <div style={{
                    padding: '.82rem .85rem .82rem 1.1rem',
                    fontFamily: "'Mulish',sans-serif", fontSize: '.9rem',
                    fontWeight: 600, color: '#d28c3c',
                    borderRight: '1px solid rgba(210,140,60,.2)',
                    background: 'rgba(210,140,60,.05)',
                    letterSpacing: '.04em',
                    flexShrink: 0,
                    userSelect: 'none',
                }}>
                    +92
                </div>

                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="300 0000000"
                    value={display(value)}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    maxLength={11} /* 10 digits + 1 space */
                    style={{
                        flex: 1, padding: '.82rem 2.4rem .82rem .85rem',
                        background: 'transparent',
                        border: 'none', outline: 'none',
                        color: '#f5efe6', fontFamily: "'Mulish',sans-serif",
                        fontSize: '.9rem', fontWeight: 300,
                        letterSpacing: '.04em',
                    }}
                />

                {showOk && (
                    <span style={{
                        position: 'absolute', right: '.85rem', top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#50c878', fontSize: '.85rem',
                    }}>✓</span>
                )}
            </div>

            {/* Glow bloom — behind the input */}
            <div style={{
                position: 'absolute', inset: '-1px', borderRadius: '4px', zIndex: 0, pointerEvents: 'none',
                boxShadow: focused
                    ? '0 0 0 3px rgba(210,140,60,.11), 0 0 20px rgba(210,140,60,.2), 0 0 40px rgba(210,140,60,.07)'
                    : 'none',
                transition: 'box-shadow .4s cubic-bezier(.22,1,.36,1)',
            }} />

            {/* Animated underline */}
            <div style={{
                position: 'absolute', bottom: error ? '1.4rem' : 0,
                left: 0, height: '2px',
                width: focused || hasValue ? '100%' : '0%',
                background: error ? 'rgba(220,80,60,.8)' : 'linear-gradient(to right, #d28c3c, #e8a055)',
                transition: 'width .35s cubic-bezier(.22,1,.36,1)',
            }} />

            {error && (
                <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(220,80,60,.85)', marginTop: '.35rem' }}>
                    {error}
                </div>
            )}
        </div>
    );
}