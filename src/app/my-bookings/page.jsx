'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Fetch user's bookings
        fetch(`/api/bookings?userId=${userData.UserID}`)
            .then(res => res.json())
            .then(data => {
                // Check if data is array
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    console.error('Unexpected response:', data);
                    setBookings([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setBookings([]);
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Refunded': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You have no bookings yet.</p>
                    <Link href="/courts/search">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded">
                            Search Courts
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <motion.div
                            key={booking.BookingID}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold">{booking.VenueName}</h2>
                                    <p className="text-gray-600">{booking.CourtName}</p>
                                    <p className="text-gray-600 mt-2">
                                        Date: {new Date(booking.BookingDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        Time: {booking.TotalHours} hour(s)
                                    </p>
                                    <p className="text-lg font-bold mt-2">
                                        Amount: Rs. {booking.TotalAmount}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.Status)}`}>
                                        {booking.Status}
                                    </span>
                                    <span className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(booking.PaymentStatus)}`}>
                                        {booking.PaymentStatus}
                                    </span>

                                    {booking.Status === 'Confirmed' && (
                                        <div className="mt-4">
                                            <button className="text-red-600 hover:text-red-800 text-sm">
                                                Cancel Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}