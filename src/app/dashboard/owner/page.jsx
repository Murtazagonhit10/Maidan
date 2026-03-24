'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OwnerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        
        const userData = JSON.parse(storedUser);
        if (userData.Role !== 'Owner') {
            router.push('/');
            return;
        }
        
        setUser(userData);
        
        // Fetch owner's venues
        fetch(`/api/venues/owner/${userData.UserID}`)
            .then(res => res.json())
            .then(data => {
                setVenues(data);
                setLoading(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome, {user?.FullName}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold">Total Venues</h3>
                    <p className="text-3xl font-bold">{venues.length}</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold">Total Courts</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-purple-100 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold">Today&apos;s Bookings</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Your Venues</h2>
            
            {venues.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven&apos;t added any venues yet.</p>
                    <Link href="/venues/add">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded">
                            Add Your First Venue
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venues.map(venue => (
                        <motion.div
                            key={venue.VenueID}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <h3 className="text-xl font-semibold">{venue.Name}</h3>
                            <p className="text-gray-600">{venue.City}</p>
                            <p className="text-sm text-gray-500 mt-2">Status: {venue.Status}</p>
                            <div className="mt-4 flex gap-2">
                                <Link href={`/venues/${venue.VenueID}`}>
                                    <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
                                        View
                                    </button>
                                </Link>
                                <Link href={`/venues/edit/${venue.VenueID}`}>
                                    <button className="bg-green-600 text-white px-4 py-1 rounded text-sm">
                                        Edit
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}