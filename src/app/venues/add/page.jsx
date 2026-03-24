'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AddVenuePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        Name: '',
        Description: '',
        Location: '',
        City: '',
        ContactNumber: '',
        PrimaryImage: ''
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/venues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                OwnerID: user.UserID
            })
        });

        if (res.ok) {
            router.push('/venues');
        } else {
            alert('Failed to add venue');
            setLoading(false);
        }
    };

    if (!user) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link href="/venues" className="text-blue-600 mb-4 inline-block">← Back to Venues</Link>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
            >
                <h1 className="text-3xl font-bold mb-6">Add New Venue</h1>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Venue Name *</label>
                        <input
                            type="text"
                            value={form.Name}
                            onChange={(e) => setForm({...form, Name: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Description</label>
                        <textarea
                            value={form.Description}
                            onChange={(e) => setForm({...form, Description: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="4"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Location *</label>
                        <input
                            type="text"
                            value={form.Location}
                            onChange={(e) => setForm({...form, Location: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">City *</label>
                        <select
                            value={form.City}
                            onChange={(e) => setForm({...form, City: e.target.value})}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select City</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Lahore">Lahore</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Contact Number</label>
                        <input
                            type="text"
                            value={form.ContactNumber}
                            onChange={(e) => setForm({...form, ContactNumber: e.target.value})}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">Image URL</label>
                        <input
                            type="text"
                            value={form.PrimaryImage}
                            onChange={(e) => setForm({...form, PrimaryImage: e.target.value})}
                            className="w-full p-2 border rounded"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Adding...' : 'Add Venue'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}