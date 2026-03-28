'use client';
import { useRef, useEffect, useState } from 'react';

function useReveal() {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
            { threshold: 0.12 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return [ref, vis];
}

function InfoChip({ icon, label, value, href }) {
    const content = (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '.65rem',
            padding: '.7rem 1rem',
            background: 'rgba(210,140,60,.05)',
            border: '1px solid rgba(210,140,60,.12)',
            borderRadius: '2px',
            transition: 'border-color .25s, background .25s',
        }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(210,140,60,.3)'; e.currentTarget.style.background = 'rgba(210,140,60,.09)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(210,140,60,.12)'; e.currentTarget.style.background = 'rgba(210,140,60,.05)'; }}
        >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
            <div>
                <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.58rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,239,230,.3)', lineHeight: 1, marginBottom: '.18rem' }}>{label}</div>
                <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.82rem', color: '#f5efe6', lineHeight: 1.3 }}>{value}</div>
            </div>
        </div>
    );
    if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{content}</a>;
    return content;
}

export default function VenueInfo({ venue }) {
    const [descRef, descVis] = useReveal();
    const [infoRef, infoVis] = useReveal();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: '2.5rem' }}
            className="venue-info-grid">
            {/* Description */}
            <div
                ref={descRef}
                style={{
                    opacity: descVis ? 1 : 0,
                    transform: descVis ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1)',
                }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.45rem',
                    fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                    fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase',
                    color: '#d28c3c', marginBottom: '.9rem',
                }}>
                    <span style={{ width: 16, height: 1, background: '#d28c3c', display: 'block' }} />
                    About this Venue
                </div>
                <p style={{
                    fontFamily: "'Mulish',sans-serif", fontWeight: 300,
                    fontSize: 'clamp(.88rem, 1.2vw, 1rem)',
                    color: 'rgba(245,239,230,.6)', lineHeight: 1.88,
                    margin: 0,
                }}>
                    {venue.Description || 'A premium indoor sports facility offering world-class courts and amenities for players of all levels.'}
                </p>

                {/* Location map link */}
                {venue.LocationURL && (
                    <a href={venue.LocationURL} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                            marginTop: '1.4rem',
                            padding: '.6rem 1.2rem',
                            background: 'rgba(210,140,60,.1)',
                            border: '1px solid rgba(210,140,60,.3)',
                            borderRadius: '2px',
                            fontFamily: "'Mulish',sans-serif", fontSize: '.72rem',
                            fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
                            color: '#d28c3c', textDecoration: 'none',
                            transition: 'all .25s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(210,140,60,.2)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(210,140,60,.1)'; }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        View on Map
                    </a>
                )}
            </div>

            {/* Contact & info chips */}
            <div
                ref={infoRef}
                style={{
                    opacity: infoVis ? 1 : 0,
                    transform: infoVis ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'opacity .65s cubic-bezier(.22,1,.36,1) .1s, transform .65s cubic-bezier(.22,1,.36,1) .1s',
                    display: 'flex', flexDirection: 'column', gap: '.65rem',
                }}
            >
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.45rem',
                    fontFamily: "'Mulish',sans-serif", fontSize: '.62rem',
                    fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase',
                    color: '#d28c3c', marginBottom: '.25rem',
                }}>
                    <span style={{ width: 16, height: 1, background: '#d28c3c', display: 'block' }} />
                    Contact & Location
                </div>

                {venue.ContactNumber && (
                    <InfoChip
                        icon="📞" label="Contact" value={venue.ContactNumber}
                        href={`tel:${venue.ContactNumber}`}
                    />
                )}
                <InfoChip icon="📍" label="Address" value={`${venue.Location}, ${venue.City}`} />
                {venue.OwnerName && (
                    <InfoChip icon="👤" label="Managed by" value={venue.OwnerName} />
                )}
                {venue.RegistrationDate && (
                    <InfoChip
                        icon="📅" label="Member since"
                        value={new Date(venue.RegistrationDate).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
                    />
                )}
            </div>

            <style>{`
        @media(max-width:768px){
        .venue-info-grid{grid-template-columns:1fr!important;}
        }
    `}</style>
        </div>
    );
}