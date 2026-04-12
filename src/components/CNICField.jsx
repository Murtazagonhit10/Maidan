'use client';
import { useState } from 'react';

/* ════════════════════════════════════════════════════════
   CNICField
   Auto-inserts dashes at positions 5 and 13 (0-indexed)
   as user types. Final format: 00000-0000000-0
   Raw digits stored in parent as plain string via onDigitsChange.
════════════════════════════════════════════════════════ */
export default function CNICField({ value, onChange, error }) {
    const [focused, setFocused] = useState(false);
    const hasValue = value && value.length > 0;

    /* Format raw digits → 00000-0000000-0 */
    function applyMask(raw) {
        const digits = raw.replace(/\D/g, '').slice(0, 13);
        let out = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 5 || i === 12) out += '-';
            out += digits[i];
        }
        return out;
    }

    function handleChange(e) {
        const raw = e.target.value;
        const prev = value;

        /* Allow backspacing over a dash gracefully */
        const digits = raw.replace(/\D/g, '');
        const masked = applyMask(digits);
        onChange(masked);
    }

    /* Validate: 15 chars including 2 dashes */
    const isComplete = value.length === 15;
    const showOk = isComplete && !error;

    return (
        <div style={{ position: 'relative', marginBottom: '1.35rem' }}>
            <label style={{
                display: 'block', fontFamily: "'Mulish',sans-serif",
                fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: focused ? '#d28c3c' : 'rgba(245,239,230,.45)',
                marginBottom: '.45rem', transition: 'color .25s',
            }}>
                CNIC <span style={{ color: '#d28c3c' }}>*</span>
            </label>

            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="00000-0000000-0"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    maxLength={15}
                    style={{
                        width: '100%', padding: '.82rem 2.6rem .82rem 1.1rem',
                        background: focused ? 'rgba(210,140,60,.06)' : 'rgba(245,239,230,.03)',
                        border: `1px solid ${error ? 'rgba(220,80,60,.6)' : focused ? 'rgba(210,140,60,.55)' : 'rgba(245,239,230,.12)'}`,
                        color: '#f5eff6', fontFamily: "'Mulish',sans-serif",
                        fontSize: '.9rem', fontWeight: 300, outline: 'none',
                        transition: 'border-color .25s, background .25s',
                        borderRadius: '2px', letterSpacing: '.06em',
                        boxSizing: 'border-box',
                    }}
                />

                {/* Glow bloom — behind the input */}
                <div style={{
                    position: 'absolute', inset: '-1px', borderRadius: '4px', zIndex: 0, pointerEvents: 'none',
                    boxShadow: focused
                        ? '0 0 0 3px rgba(210,140,60,.11), 0 0 20px rgba(210,140,60,.2), 0 0 40px rgba(210,140,60,.07)'
                        : 'none',
                    transition: 'box-shadow .4s cubic-bezier(.22,1,.36,1)',
                }} />

                {/* Progress indicator — lights up each segment */}
                {focused && (
                    <div style={{
                        position: 'absolute', right: '.85rem', top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex', gap: '3px', alignItems: 'center',
                    }}>
                        {[5, 7, 1].map((seg, idx) => {
                            const digits = value.replace(/\D/g, '');
                            const filled = idx === 0
                                ? Math.min(digits.length, 5) === 5
                                : idx === 1
                                    ? Math.min(digits.length - 5, 7) === 7
                                    : digits.length === 13;
                            return (
                                <div key={idx} style={{
                                    width: idx === 1 ? '18px' : '6px',
                                    height: '3px', borderRadius: '2px',
                                    background: filled ? '#d28c3c' : 'rgba(245,239,230,.15)',
                                    transition: 'background .2s',
                                }} />
                            );
                        })}
                    </div>
                )}
                {showOk && (
                    <span style={{
                        position: 'absolute', right: '.85rem', top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#50c878', fontSize: '.85rem',
                    }}>✓</span>
                )}
            </div>

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