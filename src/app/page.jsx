'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroScene from '@/components/HeroScene';
import { RevealText } from '@/components/Motion';
import { SpotlightCard, TiltCard, MagBtn, AnimCounter, Marquee, ImageStrip, TextRibbon } from '@/components/Ui';
import ScrollStackHIW from '@/components/ScrollStackHIW';
import MagneticButton from '@/components/MagneticButton';
import '@/app/tokens.css';

/* ── Data ── */
const sports = [
  {
    title: 'Cricket',
    tag: 'Nets & Turf',
    desc: "Full-length nets, premium turf, floodlit courts. Lahore's best cricket facilities — instantly bookable.",
    image: '/pictures/sports/cricket.jpg',
    count: '47 venues'
  },
  {
    title: 'Futsal',
    tag: 'Indoor Courts',
    desc: 'Fast-paced high-energy indoor courts built for serious players. Find your match, book your lane.',
    image: '/pictures/sports/futsal.jpg',
    count: '38 venues'
  },
  {
    title: 'Padel',
    tag: 'Glass Enclosures',
    desc: "Lahore's fastest-growing sport. Glass-walled enclosures, professional equipment, elite atmosphere.",
    image: '/pictures/sports/padel.jpg',
    count: '21 venues'
  },
];
const features = [
  { n: '01', title: 'Live Availability', desc: "Every slot refreshed in real time across 120+ venues. No stale data, no surprises." },
  { n: '02', title: 'Instant Booking', desc: 'Confirm and pay in under 60 seconds. Confirmation hits your inbox immediately.' },
  { n: '03', title: 'Secure Payments', desc: 'JazzCash, Easypaisa, debit and credit. End-to-end encrypted. Automated refunds.' },
  { n: '04', title: 'Owner Dashboard', desc: 'Earnings charts, occupancy heatmaps, payout management. Run your facility like a business.' },
  { n: '05', title: 'Verified Reviews', desc: 'Ratings only from confirmed bookings. Honest scores on lighting, kit and cleanliness.' },
  { n: '06', title: 'Smart Waitlist', desc: 'Join a queue for any full slot. Auto-notified the instant a cancellation opens it up.' },
];
const steps = [
  { num: '01', title: 'Search', desc: 'Filter by sport, area of Lahore, date, time and budget. Every result updates in real-time.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=700&q=80' },
  { num: '02', title: 'Book', desc: 'Pick your slot, confirm your details, pay securely. Confirmation lands in your inbox instantly.', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80' },
  { num: '03', title: 'Play', desc: 'Show up, scan your QR at the gate. The court is yours. The whole process took under a minute.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700&q=80' },
];
const reviews = [
  { name: 'Hassan R.', loc: 'DHA Phase 5', sport: 'Futsal', stars: 5, text: 'Booked a court in under two minutes. The slot calendar is the cleanest UI I have seen on any Pakistani platform.' },
  { name: 'Zara K.', loc: 'Gulberg III', sport: 'Padel', stars: 5, text: 'Real-time availability changed everything. No more calling five venues to find one free slot on a Saturday.' },
  { name: 'Bilal M.', loc: 'Johar Town', sport: 'Cricket', stars: 5, text: 'Cancelled at 11pm, refund was in my account by morning. Genuinely did not expect that level of polish.' },
  { name: 'Areeba S.', loc: 'Model Town', sport: 'Padel', stars: 5, text: 'The owner dashboard is incredible. I reduced my admin time by 80% in the very first week.' },
];
const venues = [
  { name: 'The Sports Complex', area: 'DHA Phase 6', img: '/pictures/venues/venue1.jpg', r: '4.9', sport: 'Cricket' },
  { name: 'Arena Futsal Club', area: 'Gulberg III', img: '/pictures/venues/venue2.jpg', r: '4.8', sport: 'Futsal' },
  { name: 'Elite Padel Lahore', area: 'Bahria Town', img: '/pictures/venues/venue3.jpg', r: '4.9', sport: 'Padel' },
  { name: 'Punjab Sports Arena', area: 'Model Town', img: '/pictures/venues/venue4.jpg', r: '4.7', sport: 'Cricket' },
];

/* ══════════════════════════════════════════════
   SCROLL STACK HOW-IT-WORKS SECTION
   Cards stack like a queue — scroll down reveals
   each card forward, scroll up sends them back
══════════════════════════════════════════════ */

/* ── Hooks ── */
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('sr-in'); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll('.sr').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}
function useGlobalParallax() {
  useEffect(() => {
    const tick = () => {
      if (window.innerWidth < 768) return;
      const y = window.scrollY;
      document.querySelectorAll('[data-speed]').forEach(el => {
        el.style.transform = `translateY(${y * parseFloat(el.dataset.speed)}px)`;
      });
    };
    window.addEventListener('scroll', tick, { passive: true });
    return () => window.removeEventListener('scroll', tick);
  }, []);
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function Home() {
  useScrollReveal();
  useGlobalParallax();

  return (
    <>
      <style>{`
        .page-sec {
          position: relative;
          z-index: 1;
          overflow: hidden;
          width: 100%;
        }

        /* ── Ticker ── */
        .ticker-sec {
          background: var(--card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: .65rem 0;
        }

        /* ── Philosophy ── */
        .phil-sec { background: var(--surface); padding: 8rem 0; }
        .phil-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }
        .phil-body p {
          color: var(--muted);
          font-size: .96rem; line-height: 1.9;
          margin-top: 1rem;
        }
        .phil-pull {
          margin: 1.8rem 0;
          padding: 1.4rem 1.8rem;
          border-left: 2px solid var(--amber);
          background: rgba(210,140,60,.04);
        }
        .phil-pull p {
          font-family: var(--body); font-style: italic;
          font-size: 1.05rem; color: var(--cream); line-height: 1.55;
          margin: 0 !important; opacity: .88;
        }
        .phil-btns { display: flex; gap: .9rem; flex-wrap: wrap; margin-top: .8rem; }

        /* ── FIXED: image stack uses relative height, not absolute children ── */
        .phil-images {
          position: relative;
          height: 520px;
          /* No overflow:hidden here — children are absolute and need room */
        }
        .phil-img-main {
          position: absolute;
          top: 0; left: 0;
          width: 78%; height: 82%;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.5);
        }
        .phil-img-main img {
          width: 100%; height: 120%;
          object-fit: cover;
          filter: saturate(.82) brightness(.78);
          display: block;
        }
        .phil-img-accent {
          position: absolute;
          bottom: -100px; right: -100px;
          width: 70%; height: 60%;
          overflow: hidden;
          border: 3px solid var(--surface);
          box-shadow: 0 10px 40px rgba(0,0,0,.45);
        }
        .phil-img-accent img {
          width: 100%; height: 130%;
          object-fit: cover;
          filter: saturate(.78) brightness(.75);
          display: block;
        }
        .phil-badge {
          position: absolute; top: 1.8rem; right: -1rem;
          background: var(--amber); color: var(--bg);
          font-family: var(--body); font-size: .58rem; font-weight: 600;
          letter-spacing: .2em; text-transform: uppercase;
          padding: .45rem .85rem; writing-mode: vertical-rl; z-index: 2;
        }
        .float-badge {
          position: absolute;
          display: flex; align-items: center; gap: .45rem;
          padding: .48rem .88rem;
          background: rgba(20,12,6,.94);
          box-shadow: 0 6px 24px rgba(0,0,0,.5);
          border: 1px solid var(--border);
          font-family: var(--body); font-size: .66rem; font-weight: 500;
          color: var(--cream); z-index: 3;
        }
        .float-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--amber); }
        .fb-a { animation: fbFloat 4s ease-in-out infinite alternate; }
        .fb-b { animation: fbFloat 5s ease-in-out .8s infinite alternate; }
        @keyframes fbFloat { from{transform:translateY(0)} to{transform:translateY(-10px)} }

        /* ── Scroll stack card ── */
        .how-section {
          width: 100%;
          background: var(--bg);
          padding: 0;
          position: relative;
          overflow: visible;
        }

        .how-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 5rem;
          width: 100%;
          position: relative;
        }

        /* Force the sticky container to stay within bounds */
        .how-container .hiw-sticky {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          position: sticky;
          left: auto;
          right: auto;
        }
              
        /* Keep the right panel cards in their original position */
        .how-container .hiw-right {
          position: relative;
          width: 100%;
          padding: 0 2rem 0 2rem;
        }
              
        .how-container .hiw-stack {
          width: 100%;
          max-width: 880px;
          margin-left: auto; /* Push to the right side like before */
          margin-right: 0;
        }
        /* ── Stats ── */
        .stats-sec {
          background: var(--card);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat-cell {
          text-align: center;
          padding: 2rem 1rem;
          border-right: 1px solid var(--border);
          position: relative;
        }
        .stat-cell:last-child { border-right: none; }
        .stat-cell::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: var(--amber);
          transform: scaleX(0); transition: transform .4s cubic-bezier(.22,1,.36,1);
        }
        .stat-cell:hover::after { transform: scaleX(1); }
        .stat-num {
          display: block;
          font-family: var(--serif); font-weight: 800;
          font-size: clamp(2rem, 3.5vw, 3.5rem);
          color: var(--cream); line-height: 1;
          margin-bottom: .35rem; letter-spacing: -.04em;
        }
        .stat-label {
          font-family: var(--body); font-size: .66rem; font-weight: 500;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--muted); display: block;
        }

        /* ── Sports ── */
        .sports-sec { background: var(--bg); padding: 8rem 0; }
        .sports-head {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 3rem;
          gap: 1rem; flex-wrap: wrap;
        }
        .sports-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .sport-card { background: var(--card); overflow: hidden; }
        .sport-img-wrap { position: relative; height: 260px; overflow: hidden; }
        .sport-img-wrap img {
          width: 100%; height: 120%; object-fit: cover; display: block;
          filter: saturate(.65) brightness(.7); transform: scale(1.05);
          transition: transform .75s cubic-bezier(.22,1,.36,1), filter .5s;
        }
        .sport-card:hover .sport-img-wrap img { transform: scale(1); filter: saturate(.88) brightness(.78); }
        .sport-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,10,6,.95) 0%, transparent 60%); }
        .sport-info { padding: 1.6rem 1.8rem 2rem; }
        .sport-tag { display: inline-block; font-size: .58rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--amber); border: 1px solid var(--border); padding: .15rem .55rem; margin-bottom: .7rem; }
        .sport-name { font-family: var(--serif); font-weight: 800; font-size: 1.85rem; letter-spacing: -.03em; color: var(--cream); margin-bottom: .45rem; }
        .sport-desc { font-size: .84rem; color: var(--muted); line-height: 1.7; }
        .sport-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        .sport-count { font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; color: var(--amber); font-weight: 600; }
        .sport-arr { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid var(--border); color: var(--amber); font-size: .85rem; text-decoration: none; transition: background .3s, border-color .3s, transform .3s; flex-shrink: 0; }
        .sport-card:hover .sport-arr { background: var(--amber); border-color: var(--amber); color: var(--bg); transform: translateX(3px); }

        /* ── Features ── */
        .features-sec { background: var(--surface); padding: 8rem 0; }
        .features-top { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: end; margin-bottom: 4rem; }
        .features-top p { color: var(--muted); font-size: .95rem; line-height: 1.82; }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
        .feat-cell { padding: 2.4rem 2rem; background: var(--card); position: relative; overflow: hidden; transition: background .35s; }
        .feat-cell:hover { background: rgba(210,140,60,.04); }
        .feat-num { font-family: var(--serif); font-size: 2.8rem; font-weight: 800; color: rgba(210,140,60,.08); line-height: 1; margin-bottom: .45rem; transition: color .35s; }
        .feat-cell:hover .feat-num { color: rgba(210,140,60,.18); }
        .feat-ttl { font-family: var(--serif); font-weight: 700; font-size: 1.08rem; color: var(--cream); margin-bottom: .5rem; }
        .feat-dsc { font-size: .84rem; color: var(--muted); line-height: 1.8; }
        .feat-bar { position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: var(--amber); transition: width .5s cubic-bezier(.22,1,.36,1); }
        .feat-cell:hover .feat-bar { width: 100%; }

        /* ── Venues ── */
        .venues-sec { background: var(--surface); padding: 8rem 0; }
        .venues-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 1rem; flex-wrap: wrap; }
        .venues-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
        .venue-card { background: var(--card); overflow: hidden; transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s; }
        .venue-card:hover { transform: translateY(-5px); box-shadow: 0 20px 55px rgba(0,0,0,.55); }
        .venue-img-wrap { position: relative; height: 165px; overflow: hidden; }
        .venue-img-wrap img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.65) brightness(.72); display: block; transition: filter .5s, transform .6s cubic-bezier(.22,1,.36,1); }
        .venue-card:hover .venue-img-wrap img { filter: saturate(.88) brightness(.82); transform: scale(1.06); }
        .venue-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(15,10,6,.7) 0%,transparent 60%); opacity: 0; transition: opacity .4s; display: flex; align-items: flex-end; padding: .8rem; }
        .venue-overlay span { font-family: var(--body); font-style: italic; font-size: .82rem; color: rgba(245,239,230,.8); }
        .venue-card:hover .venue-overlay { opacity: 1; }
        .venue-info { padding: 1rem 1.1rem 1.25rem; }
        .venue-sport { font-size: .56rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--amber); margin-bottom: .3rem; display: block; }
        .venue-name { font-family: var(--serif); font-weight: 700; font-size: .96rem; color: var(--cream); margin-bottom: .18rem; line-height: 1.25; }
        .venue-area { font-size: .76rem; color: var(--muted); }
        .venue-foot { display: flex; align-items: center; justify-content: space-between; margin-top: .7rem; }
        .venue-rating { font-family: var(--serif); font-weight: 700; font-size: .88rem; color: var(--cream); }
        .venue-rating span { color: #c9a84c; font-size: .7rem; margin-right: .12rem; }

        /* ── Reviews ── */
        .reviews-sec { background: var(--bg); padding: 8rem 0; }
        .reviews-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3.5rem; gap: 2rem; flex-wrap: wrap; }
        .reviews-agg { text-align: right; flex-shrink: 0; }
        .reviews-agg-val { font-family: var(--serif); font-weight: 800; font-size: 5rem; color: var(--cream); line-height: 1; letter-spacing: -.05em; }
        .reviews-agg-stars { color: #c9a84c; font-size: .88rem; letter-spacing: .12em; }
        .reviews-agg-lbl { font-size: .64rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); margin-top: .25rem; }
        .reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .review-card { background: var(--card); padding: 2.2rem 2rem; border: 1px solid var(--border); position: relative; overflow: hidden; transition: border-color .35s, transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s; }
        .review-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right,var(--amber-d),var(--amber)); transform: scaleX(0); transform-origin: left; transition: transform .5s cubic-bezier(.22,1,.36,1); }
        .review-card:hover { border-color: rgba(210,140,60,.3); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,.45); }
        .review-card:hover::before { transform: scaleX(1); }
        .review-stars { color: #c9a84c; font-size: .78rem; letter-spacing: .08em; margin-bottom: .8rem; }
        .review-quote { font-family: var(--serif); font-size: 3rem; color: var(--amber); line-height: .8; margin-bottom: .45rem; opacity: .35; }
        .review-text { font-family: var(--body); font-style: italic; font-size: .98rem; color: rgba(245,239,230,.78); line-height: 1.72; margin-bottom: 1.6rem; }
        .review-author { display: flex; align-items: center; gap: .8rem; flex-wrap: wrap; }
        .review-av { width: 34px; height: 34px; background: var(--amber-d); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-weight: 700; font-size: .88rem; color: var(--cream); flex-shrink: 0; }
        .review-name { font-family: var(--body); font-size: .8rem; font-weight: 600; color: var(--cream); }
        .review-loc { font-size: .68rem; color: var(--muted); }
        .review-sport { margin-left: auto; font-size: .58rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--amber); padding: .18rem .6rem; border: 1px solid var(--border); }

        /* ── CTA ── */
        .cta-sec { position: relative; padding: 10rem 0; text-align: center; overflow: hidden; background: var(--bg); }
        .cta-bg { position: absolute; inset: -20%; z-index: 0; }
        .cta-bg img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.15) saturate(.4); will-change: transform; }
        .cta-overlay { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 65% 55% at 50% 50%, rgba(210,140,60,.1) 0%, transparent 70%), linear-gradient(to bottom,var(--bg) 0%,transparent 18%,transparent 82%,var(--bg) 100%); }
        .cta-body { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
        .cta-title { font-family: var(--serif); font-weight: 800; font-size: clamp(2.2rem, 5vw, 5rem); letter-spacing: -.04em; line-height: .97; color: var(--cream); margin-bottom: 1.4rem; }
        .cta-title .stroke { -webkit-text-stroke: 1.5px var(--amber); color: transparent; }
        .cta-sub { color: var(--muted); font-size: .96rem; line-height: 1.78; margin-bottom: 2.8rem; }
        .cta-actions { display: flex; gap: .9rem; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ── */
        .footer-sec { background: var(--surface); border-top: 1px solid var(--border); padding: 5rem 0 2.5rem; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3.5rem; padding-bottom: 3.5rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
        .footer-logo { font-family: var(--serif); font-weight: 800; font-size: 1.9rem; letter-spacing: .06em; color: var(--cream); }
        .footer-logo span { color: var(--amber); }
        .footer-tagline { color: var(--muted); font-size: .83rem; line-height: 1.72; margin-top: .65rem; max-width: 240px; }
        .footer-col h5 { font-family: var(--body); font-size: .62rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--amber); margin-bottom: 1rem; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: .55rem; }
        .footer-col ul a { font-size: .83rem; color: var(--muted); text-decoration: none; transition: color .25s; }
        .footer-col ul a:hover { color: var(--cream); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .5rem; font-size: .7rem; color: rgba(245,239,230,.22); letter-spacing: .06em; }

        /* ══════════════════ RESPONSIVE ══════════════════ */
        @media (max-width: 960px) {
          .phil-grid, .features-top { grid-template-columns: 1fr; gap: 3rem; }
          .phil-images { height: 380px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2.5rem; }
          .phil-sec, .sports-sec, .features-sec, .venues-sec, .reviews-sec { padding: 6rem 0; }
          .cta-sec { padding: 7rem 0; }
          .footer-sec { padding: 4rem 0 2rem; }
        }
        @media (max-width: 768px) {
          .sports-grid { grid-template-columns: 1fr; }
          .feat-grid { grid-template-columns: 1fr 1fr; }
          .venues-grid { grid-template-columns: 1fr 1fr; }
          .reviews-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-cell:nth-child(2) { border-right: none; }
          .float-badge { display: none; }
        }
        @media (max-width: 600px) {
          .feat-grid { grid-template-columns: 1fr; }
          .phil-images { height: 260px; }
          .phil-img-accent { display: none; }
          .phil-img-main { width: 100%; height: 100%; }
          .phil-badge { display: none; }
          .cta-title { font-size: clamp(1.9rem, 8vw, 2.8rem); }
        }
        @media (max-width: 480px) {
          .venues-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
          .reviews-agg-val { font-size: 3.5rem; }
        }

        .scroll-3d-container {
  position: fixed;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  pointer-events: none;
}

@media (max-width: 900px) {
  .scroll-3d-container {
    display: none;
  }
}
      `}</style>

      <Navbar />
      <HeroScene />

      {/* Ticker */}
      <div className="page-sec ticker-sec">
        <Marquee items={['Cricket Nets', 'Futsal Courts', 'Padel Arenas', 'Real-Time Booking', 'Instant Confirmation', '120+ Venues Lahore']} speed={30} />
      </div>

      {/* Philosophy — FIXED images */}
      <section className="page-sec phil-sec">
        <div className="container">
          <div className="phil-grid">
            <RevealText from="left">
              <div className="phil-body">
                <span className="eyebrow">Why Maidan</span>
                <h2 className="display">
                  Sport deserves<br />better than a<br /><span className="stroke">phone call.</span>
                </h2>
                <div className="rule" />
                <p>Pakistan's indoor sports scene is thriving — cricket nets, futsal arenas and padel courts are booked solid every weekend. But the infrastructure behind them is stuck in 2005: phone calls, paper registers, gut-feel scheduling.</p>
                <p>Maidan fixes that. A transparent, centralized marketplace built for Pakistan's players and facility owners.</p>
                <div className="phil-pull">
                  <p>No double bookings. No wasted trips. No lost revenue. Just sport.</p>
                </div>
                <div className="phil-btns">
                  <MagneticButton asLink href="/venues" className="btn-fill" strength={0.28}>Explore Venues</MagneticButton>
                  <MagBtn href="/register" className="btn-outline">List Your Facility</MagBtn>
                </div>
              </div>
            </RevealText>

            <RevealText from="right" delay={0.15}>
              {/* phil-images has a defined height; children are position:absolute inside it */}
              <div className="phil-images">
                <div className="phil-img-main">
                  <img
                    src="/pictures/whymaidan/big.jpg"
                    alt="Futsal"
                  />
                </div>
                {/* Accent image */}
                <div className="phil-img-accent">
                  <img
                    src="/pictures/whymaidan/small.jpg"
                    alt="Cricket"
                  />
                </div>
                <span className="phil-badge">Est. 2025 · Lahore</span>
                <div className="float-badge fb-a" style={{ bottom: '67%', left: '-2.2rem' }}>
                  <span className="float-badge-dot" /><span>120+ Active Venues</span>
                </div>
                <div className="float-badge fb-b" style={{ bottom: '19%', right: '-12rem' }}>
                  <span className="float-badge-dot" /><span>Book in 60 seconds</span>
                </div>
              </div>
            </RevealText>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="page-sec stats-sec">
        <div className="container">
          <div className="stats-grid">
            {[{ to: 120, s: '+', l: 'Venues in Lahore' }, { to: 10, s: 'k+', l: 'Bookings Made' }, { to: 4.9, s: '', l: 'Average Rating', d: true }, { to: 3, s: '', l: 'Sports Covered' }].map(({ to, s, l, d }) => (
              <div className="stat-cell" key={l}>
                <span className="stat-num"><AnimCounter to={to} suffix={s} dec={d} /></span>
                <span className="stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="page-sec sports-sec">
        <div className="container">
          <div className="sports-head">
            <RevealText>
              <span className="eyebrow">What We Cover</span>
              <h2 className="display">Three sports.<br /><span className="amber">One platform.</span></h2>
            </RevealText>
            <RevealText from="right">
              <MagBtn href="/courts" className="btn-outline">All Courts →</MagBtn>
            </RevealText>
          </div>
          <div className="sports-grid">
            {sports.map((s, i) => (
              <TiltCard key={s.title} className={`sport-card sr d${i + 1}`}>
                <div className="sport-img-wrap">
                  <img src={s.image} alt={s.title} />
                  <div className="sport-img-overlay" />
                </div>
                <div className="sport-info">
                  <span className="sport-tag">{s.tag}</span>
                  <div className="sport-name">{s.title}</div>
                  <p className="sport-desc">{s.desc}</p>
                  <div className="sport-foot">
                    <span className="sport-count">{s.count}</span>
                    <Link href={`/courts?sport=${s.title.toLowerCase()}`} className="sport-arr">→</Link>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <div className="page-sec" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <ImageStrip />
      </div>

      {/* Text ribbon */}
      <div className="page-sec" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <TextRibbon words={['Book', 'Play', 'Win', 'Repeat', 'Maidan', 'Lahore', 'Cricket', 'Futsal', 'Padel']} />
      </div>

      {/* Features */}
      <section className="page-sec features-sec">
        <div className="container">
          <div className="features-top sr">
            <div>
              <span className="eyebrow">Platform</span>
              <h2 className="display">Built for<br /><span className="stroke">players</span><br />& owners.</h2>
            </div>
            <div>
              <p>Every feature on Maidan was designed around one question: what makes booking a sports court feel completely effortless? Six answers, below.</p>
            </div>
          </div>
          <div className="feat-grid">
            {features.map((f, i) => (
              <SpotlightCard key={f.n} className={`feat-cell sr d${(i % 3) + 1}`}>
                <div className="feat-num">{f.n}</div>
                <div className="feat-ttl">{f.title}</div>
                <p className="feat-dsc">{f.desc}</p>
                <div className="feat-bar" />
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Electric Border Scroll Stack */}
      <section className="how-section">
        <div className="how-inner">
          <ScrollStackHIW />
        </div>
      </section>

      {/* Venues */}
      <section className="page-sec venues-sec">
        <div className="container">
          <div className="venues-head">
            <RevealText>
              <span className="eyebrow">Top Rated</span>
              <h2 className="display">Featured <span className="amber">venues.</span></h2>
            </RevealText>
            <RevealText from="right">
              <MagBtn href="/venues" className="btn-outline">View All →</MagBtn>
            </RevealText>
          </div>
          <div className="venues-grid">
            {venues.map((v, i) => (
              <div className={`venue-card sr d${i + 1}`} key={v.name}>
                <div className="venue-img-wrap">
                  <img src={v.img} alt={v.name} />
                  <div className="venue-overlay"><span>View availability →</span></div>
                </div>
                <div className="venue-info">
                  <span className="venue-sport">{v.sport}</span>
                  <div className="venue-name">{v.name}</div>
                  <div className="venue-area">{v.area}</div>
                  <div className="venue-foot">
                    <div className="venue-rating"><span>★</span>{v.r}</div>
                    <MagneticButton asLink href="/venues" className="btn-fill" style={{ padding: '.38rem .85rem', fontSize: '.62rem' }} strength={0.28}>Book →</MagneticButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="page-sec reviews-sec">
        <div className="container">
          <div className="reviews-head">
            <RevealText>
              <span className="eyebrow">Testimonials</span>
              <h2 className="display">Heard on<br /><span className="amber">the court.</span></h2>
            </RevealText>
            <div className="reviews-agg sr d2">
              <div className="reviews-agg-val">4.9</div>
              <div className="reviews-agg-stars">★★★★★</div>
              <div className="reviews-agg-lbl">Average across all venues</div>
            </div>
          </div>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <div className={`review-card sr d${(i % 2) + 1}`} key={r.name}>
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <div className="review-quote">"</div>
                <p className="review-text">{r.text}</p>
                <div className="review-author">
                  <div className="review-av">{r.name[0]}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-loc">{r.loc}</div>
                  </div>
                  <span className="review-sport">{r.sport}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-sec cta-sec">
        <div className="cta-bg">
          <img src="/pictures/footer/footer.jpg" alt="" />
        </div>
        <div className="cta-overlay" />
        <div className="container">
          <div className="cta-body sr">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Get Started</span>
            <h2 className="cta-title">
              STOP<br /><span className="stroke">WAITING.</span><br />START PLAYING.
            </h2>
            <p className="cta-sub">
              Join thousands of players already booking smarter across Lahore.
              Your court is one tap away.
            </p>
            <div className="cta-actions">
              <MagneticButton asLink href="/register" className="btn-fill" strength={0.28}>Create Free Account</MagneticButton>
              <MagBtn href="/venues" className="btn-outline">Browse Venues</MagBtn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="page-sec footer-sec">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">MAIDA<span>N</span></div>
              <p className="footer-tagline">Lahore's indoor sports booking platform. Real-time courts for cricket, futsal and padel.</p>
            </div>
            <div className="footer-col">
              <h5>Sports</h5>
              <ul>
                <li><Link href="/courts?sport=cricket">Cricket</Link></li>
                <li><Link href="/courts?sport=futsal">Futsal</Link></li>
                <li><Link href="/courts?sport=padel">Padel</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Platform</h5>
              <ul>
                <li><Link href="/venues">Browse Venues</Link></li>
                <li><Link href="/my-bookings">My Bookings</Link></li>
                <li><Link href="/dashboard">Owner Dashboard</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Account</h5>
              <ul>
                <li><Link href="/register">Sign Up</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 Maidan. All rights reserved.</span>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
      </footer>
    </>
  );
}