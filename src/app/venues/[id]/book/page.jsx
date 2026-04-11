'use client';
import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MagneticButton from '@/components/MagneticButton';
import '@/app/tokens.css';

/* ─────────────────────────────────────────────────────────
   DATE PICKER — Maidan special (similar to DOB picker)
   Drum-style scroll wheel for month/day/year
───────────────────────────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_H = 42;
const VISIBLE = 5;

function range(start, end) {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
}

/* eslint-disable react-hooks/exhaustive-deps */
function DateWheel({ label, items, value, onChange, formatter }) {
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const startYRef = useRef(0);
    const velRef = useRef(0);
    const lastYRef = useRef(0);
    const lastTRef = useRef(0);
    const rafRef = useRef(null);
    const dragging = useRef(false);
    const centerIdx = Math.floor(VISIBLE / 2);
    const winH = ITEM_H * VISIBLE;

    const idxToOffset = idx => -(idx * ITEM_H) + centerIdx * ITEM_H;
    const offsetToIdx = off => {
        const raw = Math.round((centerIdx * ITEM_H - off) / ITEM_H);
        return Math.max(0, Math.min(items.length - 1, raw));
    };

    function snapTo(idx, velocity = 0) {
        cancelAnimationFrame(rafRef.current);
        const target = idxToOffset(idx);
        let cur = offsetRef.current;
        let vel = velocity;
        function animate() {
            const diff = target - cur;
            vel = vel * 0.82 + diff * 0.28;
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
    }, []);

    useEffect(() => {
        const idx = items.indexOf(value);
        if (idx >= 0) snapTo(idx);
    }, [value, items.join(',')]);

    const onPointerDown = useCallback(e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        cancelAnimationFrame(rafRef.current);
        dragging.current = true;
        startYRef.current = e.clientY;
        lastYRef.current = e.clientY;
        lastTRef.current = e.timeStamp;
        velRef.current = 0;
    }, []);

    const onPointerMove = useCallback(e => {
        if (!dragging.current) return;
        const dy = e.clientY - lastYRef.current;
        const dt = Math.max(1, e.timeStamp - lastTRef.current);
        velRef.current = dy / dt * 16;
        lastYRef.current = e.clientY;
        lastTRef.current = e.timeStamp;
        offsetRef.current += dy;
        if (trackRef.current)
            trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
    }, []);

    const onPointerUp = useCallback(e => {
        if (!dragging.current) return;
        dragging.current = false;
        const projOff = offsetRef.current + velRef.current * 8;
        const idx = offsetToIdx(projOff);
        snapTo(Math.max(0, Math.min(items.length - 1, idx)), velRef.current);
    }, [items]);

    const onWheel = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        const curIdx = offsetToIdx(offsetRef.current);
        const next = Math.max(0, Math.min(items.length - 1, curIdx + (e.deltaY > 0 ? 1 : -1)));
        snapTo(next);
    }, [items]);

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
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                    background: `linear-gradient(to bottom,
                        rgba(8,5,3,0.92) 0%, rgba(8,5,3,0.35) 28%,
                        transparent 45%, transparent 55%,
                        rgba(8,5,3,0.35) 72%, rgba(8,5,3,0.92) 100%)`,
                }} />
                <div style={{
                    position: 'absolute', zIndex: 3, pointerEvents: 'none',
                    top: `${centerIdx * ITEM_H}px`, left: 0, right: 0,
                    height: `${ITEM_H}px`,
                    borderTop: '1px solid rgba(210,140,60,.45)',
                    borderBottom: '1px solid rgba(210,140,60,.45)',
                    background: 'rgba(210,140,60,.07)',
                }} />
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
                                fontSize: i === selIdx ? '1.05rem' : '.9rem',
                                color: i === selIdx ? '#d28c3c' : 'rgba(245,239,230,.35)',
                                transition: 'color .15s, font-size .15s',
                                cursor: 'pointer',
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

function DatePicker({ value, onChange }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Generate 30 days of available dates
    const days = [];
    const tempDate = new Date(value.year, value.month - 1, 1);
    const daysInMonth = new Date(value.year, value.month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Only allow dates from today onwards
    const isDateDisabled = (day, month, year) => {
        const date = new Date(year, month - 1, day);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return date < todayDate;
    };

    const months = range(1, 12);
    const years = range(currentYear, currentYear + 12);

    return (
        <div style={{
            background: 'rgba(10,7,4,0.96)',
            border: '1px solid rgba(210,140,60,.25)',
            borderRadius: '4px',
            padding: '1rem .5rem .8rem',
            backdropFilter: 'blur(12px)',
        }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-start' }}>
                <DateWheel
                    label="Day"
                    items={days}
                    value={value.day}
                    onChange={day => onChange({ ...value, day })}
                    formatter={v => String(v).padStart(2, '0')}
                />
                <div style={{ paddingTop: '2rem', color: 'rgba(210,140,60,.3)', fontSize: '1.1rem', lineHeight: `${ITEM_H}px` }}>·</div>
                <DateWheel
                    label="Month"
                    items={months}
                    value={value.month}
                    onChange={month => onChange({ ...value, month })}
                    formatter={v => MONTHS[v - 1]}
                />
                <div style={{ paddingTop: '2rem', color: 'rgba(210,140,60,.3)', fontSize: '1.1rem', lineHeight: `${ITEM_H}px` }}>·</div>
                <DateWheel
                    label="Year"
                    items={years}
                    value={value.year}
                    onChange={year => onChange({ ...value, year })}
                    formatter={v => String(v)}
                />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   TIME SLOT PICKER — Grid of 1-hour slots with magnetic hover
───────────────────────────────────────────────────────── */
function TimeSlotPicker({ slots, selectedSlots, onToggleSlot, court }) {
    const timeSlots = [];
    // Generate time slots from 9 AM to 3 AM (next day)
    for (let hour = 9; hour <= 23; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
        timeSlots.push({ start, end, hour });
    }
    for (let hour = 0; hour <= 3; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
        timeSlots.push({ start, end, hour: hour + 24 });
    }

    const isPeakHour = (hour) => {
        if (!court.PeakStartTime || !court.PeakEndTime) return false;
        const peakStart = parseInt(court.PeakStartTime.split(':')[0]);
        let peakEnd = parseInt(court.PeakEndTime.split(':')[0]);
        if (peakEnd < peakStart) peakEnd += 24;
        let h = hour;
        if (h < peakStart && hour < 12) h += 24;
        return h >= peakStart && h < peakEnd;
    };

    const getSlotPrice = (hour) => {
        return isPeakHour(hour) ? (court.PeakPricePerHour || court.BasePricePerHour) : court.BasePricePerHour;
    };

    const getSlotKey = (start) => start;

    const isSelected = (start) => selectedSlots.some(s => s.start === start);
    const isAvailable = (start) => {
        const slot = slots.find(s => s.startTime === start);
        return slot ? slot.status === 'Available' : true;
    };

    const handleSlotClick = (start, end, hour) => {
        if (!isAvailable(start)) return;
        onToggleSlot({ start, end, hour, price: getSlotPrice(hour), isPeak: isPeakHour(hour) });
    };

    const [hoveredSlot, setHoveredSlot] = useState(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
                gap: '.6rem',
            }}>
                {timeSlots.map(({ start, end, hour }) => {
                    const selected = isSelected(start);
                    const available = isAvailable(start);
                    const price = getSlotPrice(hour);
                    const isPeak = isPeakHour(hour);
                    const hovered = hoveredSlot === start;

                    return (
                        <button
                            key={start}
                            onClick={() => handleSlotClick(start, end, hour)}
                            onMouseEnter={() => setHoveredSlot(start)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            disabled={!available}
                            style={{
                                position: 'relative',
                                padding: '.7rem .2rem',
                                background: selected
                                    ? 'linear-gradient(135deg, #d28c3c, #e8a055)'
                                    : available
                                        ? hovered
                                            ? 'rgba(210,140,60,.2)'
                                            : 'rgba(245,239,230,.05)'
                                        : 'rgba(245,239,230,.02)',
                                border: `1px solid ${selected ? '#d28c3c' : isPeak ? 'rgba(210,140,60,.35)' : 'rgba(245,239,230,.1)'}`,
                                borderRadius: '4px',
                                cursor: available ? 'pointer' : 'not-allowed',
                                transition: 'all .25s cubic-bezier(.22,1,.36,1)',
                                transform: hovered && available ? 'translateY(-2px)' : 'none',
                                boxShadow: selected ? '0 4px 12px rgba(210,140,60,.3)' : hovered && available ? '0 4px 12px rgba(210,140,60,.15)' : 'none',
                            }}
                        >
                            <div style={{
                                fontFamily: "'Syne',sans-serif",
                                fontWeight: selected ? 700 : 500,
                                fontSize: '.75rem',
                                color: selected ? '#0f0a06' : isPeak ? '#e8a055' : 'rgba(245,239,230,.7)',
                            }}>
                                {start}–{end}
                            </div>
                            <div style={{
                                fontFamily: "'Mulish',sans-serif",
                                fontSize: '.6rem',
                                color: selected ? '#0f0a06' : 'rgba(245,239,230,.4)',
                                marginTop: '.2rem',
                            }}>
                                PKR {price.toLocaleString()}
                            </div>
                            {isPeak && !selected && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-3px',
                                    right: '-3px',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#e8a055',
                                    animation: 'peakPulse 1.5s ease-in-out infinite',
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>
            <style>{`
                @keyframes peakPulse {
                    0%,100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   PRICE CALCULATOR — Live update
───────────────────────────────────────────────────────── */
function PriceCalculator({ selectedSlots, court }) {
    const total = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const peakCount = selectedSlots.filter(s => s.isPeak).length;
    const regularCount = selectedSlots.length - peakCount;

    return (
        <div style={{
            background: 'rgba(210,140,60,.08)',
            border: '1px solid rgba(210,140,60,.2)',
            borderRadius: '4px',
            padding: '1.2rem',
        }}>
            <div style={{
                fontFamily: "'Mulish',sans-serif",
                fontSize: '.62rem',
                fontWeight: 600,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: 'rgba(245,239,230,.5)',
                marginBottom: '.8rem',
            }}>PRICE BREAKDOWN</div>

            {regularCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ color: 'rgba(245,239,230,.6)' }}>Regular hours ({regularCount} × PKR {court.BasePricePerHour.toLocaleString()})</span>
                    <span style={{ color: '#f5efe6' }}>PKR {(regularCount * court.BasePricePerHour).toLocaleString()}</span>
                </div>
            )}

            {peakCount > 0 && court.PeakPricePerHour && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.8rem' }}>
                    <span style={{ color: 'rgba(245,239,230,.6)' }}>Peak hours ({peakCount} × PKR {court.PeakPricePerHour.toLocaleString()})</span>
                    <span style={{ color: '#e8a055' }}>PKR {(peakCount * court.PeakPricePerHour).toLocaleString()}</span>
                </div>
            )}

            <div style={{
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(210,140,60,.3), transparent)',
                margin: '.8rem 0',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#f5efe6',
                }}>Total</span>
                <span style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: '#d28c3c',
                }}>PKR {total.toLocaleString()}</span>
            </div>
            <div style={{
                fontFamily: "'Mulish',sans-serif",
                fontSize: '.6rem',
                color: 'rgba(245,239,230,.3)',
                marginTop: '.3rem',
                textAlign: 'right',
            }}>Includes all taxes</div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   PAYMENT METHODS — Animated cards
───────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
    { id: 'jazzcash', name: 'JazzCash', icon: '📱', color: '#e05030' },
    { id: 'easypaisa', name: 'EasyPaisa', icon: '💚', color: '#4caf50' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳', color: '#d28c3c' },
    { id: 'debit_card', name: 'Debit Card', icon: '🏦', color: '#d28c3c' },
];

function PaymentMethodSelector({ selected, onChange }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.8rem' }}>
            {PAYMENT_METHODS.map(method => (
                <button
                    key={method.id}
                    onClick={() => onChange(method.id)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.8rem',
                        padding: '.9rem',
                        background: selected === method.id
                            ? `linear-gradient(135deg, ${method.color}20, ${method.color}10)`
                            : 'rgba(245,239,230,.03)',
                        border: `1px solid ${selected === method.id ? method.color : 'rgba(245,239,230,.1)'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
                        transform: selected === method.id ? 'scale(1.02)' : 'scale(1)',
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                    <span style={{
                        fontFamily: "'Mulish',sans-serif",
                        fontSize: '.75rem',
                        fontWeight: selected === method.id ? 700 : 500,
                        color: selected === method.id ? method.color : 'rgba(245,239,230,.7)',
                    }}>
                        {method.name}
                    </span>
                </button>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function BookingPage({ params }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const courtId = searchParams.get('court');

    const [venue, setVenue] = useState(null);
    const [court, setCourt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState({ day: null, month: null, year: null });
    const [slots, setSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/venues/${id}`);
                if (!res.ok) throw new Error('Failed to load venue');
                const data = await res.json();
                setVenue(data.venue);
                const foundCourt = data.courts.find(c => c.CourtID === parseInt(courtId));
                if (!foundCourt) throw new Error('Court not found');
                setCourt(foundCourt);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id && courtId) fetchData();
    }, [id, courtId]);

    // Fetch slots when date is selected
    useEffect(() => {
        if (!selectedDate.day || !selectedDate.month || !selectedDate.year || !court) return;

        const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        const fetchSlots = async () => {
            try {
                const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
                const url = `/api/slots/available?courtId=${court.CourtID}&date=${dateStr}`;
                console.log('Fetching slots from:', url);

                const res = await fetch(url);
                console.log('Response status:', res.status);

                const data = await res.json();
                console.log('Response data:', data);

                if (!res.ok) throw new Error(data.error || 'Failed to load slots');
                setSlots(data.slots || []);
                setSelectedSlots([]);
            } catch (err) {
                console.error('Error fetching slots:', err);
                alert('Failed to load slots: ' + err.message);
            }
        };
        fetchSlots();
    }, [selectedDate, court]);

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        setSelectedSlots([]);
    };

    const handleToggleSlot = (slot) => {
        setSelectedSlots(prev => {
            const exists = prev.find(s => s.start === slot.start);
            if (exists) {
                return prev.filter(s => s.start !== slot.start);
            }
            // Ensure consecutive slots
            const allTimes = [...prev, slot].sort((a, b) => a.hour - b.hour);
            for (let i = 1; i < allTimes.length; i++) {
                if (allTimes[i].hour !== allTimes[i - 1].hour + 1) {
                    return [slot];
                }
            }
            return allTimes;
        });
    };

    const handleConfirmBooking = async () => {
        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot');
            return;
        }
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        setBookingStep(2);

        try {
            const totalAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    venueId: parseInt(id),
                    courtId: court.CourtID,
                    bookingDate: `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`,
                    slots: selectedSlots.map(s => ({
                        startTime: s.start,
                        endTime: s.end,
                        price: s.price,
                        isPeak: s.isPeak,
                    })),
                    totalAmount,
                    paymentMethod,
                }),
            });

            if (!response.ok) throw new Error('Booking failed');
            const data = await response.json();
            setBookingId(data.bookingId);
            setBookingComplete(true);
        } catch (err) {
            alert(err.message);
            setBookingStep(1);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '100vh', background: '#0f0a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#d28c3c' }}>Loading booking details...</div>
                </div>
            </>
        );
    }

    if (error || !court || !venue) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '100vh', background: '#0f0a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: '#e05050' }}>{error || 'Booking information not found'}</div>
                </div>
            </>
        );
    }

    if (bookingComplete) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '100vh', background: '#0f0a06', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{
                        background: '#1a1108',
                        border: '1px solid rgba(210,140,60,.2)',
                        borderRadius: '4px',
                        padding: '3rem',
                        textAlign: 'center',
                        maxWidth: 500,
                        animation: 'fadeSlideUp .6s cubic-bezier(.22,1,.36,1)',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            border: '2px solid rgba(210,140,60,.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            animation: 'ringPulse 2s ease-in-out infinite',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'rgba(210,140,60,.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.8rem',
                            }}>✓</div>
                        </div>
                        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#f5efe6', marginBottom: '.5rem' }}>
                            Booking Confirmed!
                        </h2>
                        <p style={{ fontFamily: "'Mulish',sans-serif", color: 'rgba(245,239,230,.6)', marginBottom: '1rem' }}>
                            Your booking has been confirmed. Booking ID: <span style={{ color: '#d28c3c' }}>#{bookingId}</span>
                        </p>
                        <Link href="/my-bookings" style={{
                            display: 'inline-block',
                            padding: '.8rem 2rem',
                            background: '#d28c3c',
                            color: '#0f0a06',
                            fontFamily: "'Mulish',sans-serif",
                            fontSize: '.75rem',
                            fontWeight: 600,
                            letterSpacing: '.12em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            borderRadius: '2px',
                            transition: 'background .25s',
                        }}
                            onMouseOver={e => e.currentTarget.style.background = '#e8a055'}
                            onMouseOut={e => e.currentTarget.style.background = '#d28c3c'}
                        >
                            View My Bookings
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes ringPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(210,140,60,0); border-color: rgba(210,140,60,.35); }
                    50% { box-shadow: 0 0 0 8px rgba(210,140,60,.06); border-color: rgba(210,140,60,.6); }
                }
            `}</style>

            <Navbar />

            <div style={{ background: '#0f0a06', minHeight: '100vh', padding: '6rem 1.5rem 4rem' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href={`/venues/${id}`} style={{
                            color: '#d28c3c',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '.3rem',
                            marginBottom: '1rem',
                            fontFamily: "'Mulish',sans-serif",
                            fontSize: '.75rem',
                        }}>
                            ← Back to Venue
                        </Link>
                        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#f5efe6', marginBottom: '.5rem' }}>
                            Book a Court
                        </h1>
                        <p style={{ fontFamily: "'Mulish',sans-serif", color: 'rgba(245,239,230,.5)' }}>
                            {venue.Name} · {court.CourtName} ({court.SportName})
                        </p>
                    </div>

                    {/* Two-column layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '2rem',
                        alignItems: 'start',
                    }}>
                        {/* Left Column: Date & Time */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Date Picker */}
                            <div>
                                <div style={{
                                    fontFamily: "'Mulish',sans-serif",
                                    fontSize: '.62rem',
                                    fontWeight: 600,
                                    letterSpacing: '.2em',
                                    textTransform: 'uppercase',
                                    color: '#d28c3c',
                                    marginBottom: '.8rem',
                                }}>Select Date</div>
                                <DatePicker
                                    value={selectedDate.day ? selectedDate : { day: null, month: null, year: null }}
                                    onChange={handleDateChange}
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate.day && (
                                <div>
                                    <div style={{
                                        fontFamily: "'Mulish',sans-serif",
                                        fontSize: '.62rem',
                                        fontWeight: 600,
                                        letterSpacing: '.2em',
                                        textTransform: 'uppercase',
                                        color: '#d28c3c',
                                        marginBottom: '.8rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <span>Select Time Slots</span>
                                        {court.PeakStartTime && court.PeakEndTime && (
                                            <span style={{
                                                fontSize: '.55rem',
                                                color: '#e8a055',
                                                background: 'rgba(232,160,85,.1)',
                                                padding: '.2rem .5rem',
                                                borderRadius: '20px',
                                            }}>
                                                Peak: {court.PeakStartTime.slice(0, 5)}–{court.PeakEndTime.slice(0, 5)}
                                            </span>
                                        )}
                                    </div>
                                    <TimeSlotPicker
                                        slots={slots}
                                        selectedSlots={selectedSlots}
                                        onToggleSlot={handleToggleSlot}
                                        court={court}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Column: Summary & Payment */}
                        <div style={{ position: 'sticky', top: '6rem' }}>
                            {/* Court Summary Card */}
                            <div style={{
                                background: '#1a1108',
                                border: '1px solid rgba(210,140,60,.15)',
                                borderRadius: '4px',
                                padding: '1.2rem',
                                marginBottom: '1.5rem',
                                animation: 'fadeSlideUp .5s cubic-bezier(.22,1,.36,1)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.8rem' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: 'rgba(210,140,60,.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem',
                                    }}>🏟️</div>
                                    <div>
                                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#f5efe6' }}>{court.CourtName}</div>
                                        <div style={{ fontFamily: "'Mulish',sans-serif", fontSize: '.7rem', color: 'rgba(245,239,230,.5)' }}>{court.SportName}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'rgba(245,239,230,.5)' }}>
                                    <span>Base Rate</span>
                                    <span style={{ color: '#d28c3c' }}>PKR {court.BasePricePerHour.toLocaleString()}/hr</span>
                                </div>
                                {court.PeakPricePerHour && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', marginTop: '.3rem', color: 'rgba(245,239,230,.4)' }}>
                                        <span>Peak Rate</span>
                                        <span style={{ color: '#e8a055' }}>PKR {court.PeakPricePerHour.toLocaleString()}/hr</span>
                                    </div>
                                )}
                            </div>

                            {/* Price Calculator */}
                            {selectedSlots.length > 0 && (
                                <PriceCalculator selectedSlots={selectedSlots} court={court} />
                            )}

                            {/* Payment Methods */}
                            {selectedSlots.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{
                                        fontFamily: "'Mulish',sans-serif",
                                        fontSize: '.62rem',
                                        fontWeight: 600,
                                        letterSpacing: '.2em',
                                        textTransform: 'uppercase',
                                        color: '#d28c3c',
                                        marginBottom: '.8rem',
                                    }}>Payment Method</div>
                                    <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />
                                </div>
                            )}

                            {/* Confirm Button */}
                            {selectedSlots.length > 0 && paymentMethod && (
                                <MagneticButton
                                    onClick={handleConfirmBooking}
                                    className="btn-fill"
                                    strength={0.28}
                                    style={{
                                        width: '100%',
                                        marginTop: '1.5rem',
                                        padding: '.9rem',
                                        fontSize: '.75rem',
                                    }}
                                >
                                    Confirm Booking · PKR {totalPrice.toLocaleString()}
                                </MagneticButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}