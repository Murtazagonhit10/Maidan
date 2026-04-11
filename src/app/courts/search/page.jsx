'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SearchPage() {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        sport: '',
        city: '',
        minPrice: '',
        maxPrice: ''
    });

    const sports = ['Cricket', 'Padel', 'Futsal'];
    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'];

    const fetchCourts = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.sport) params.append('sport', filters.sport);
        if (filters.city) params.append('city', filters.city);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

        const res = await fetch(`/api/courts/search?${params.toString()}`);
        const data = await res.json();
        setCourts(data);
        setLoading(false);
    };

    useEffect(() => {
        const loadCourts = async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.sport) params.append('sport', filters.sport);
            if (filters.city) params.append('city', filters.city);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

            const res = await fetch(`/api/courts/search?${params.toString()}`);
            const data = await res.json();
            setCourts(data);
            setLoading(false);
        };

        loadCourts();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchCourts();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Search Courts</h1>

            {/* Filters */}
            <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        name="sport"
                        value={filters.sport}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        <option value="">All Sports</option>
                        {sports.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        <option value="">All Cities</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    />

                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    />
                </div>
                <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
                    Apply Filters
                </button>
            </form>

            {/* Results */}
            {loading ? (
                <div className="text-center p-10">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map(court => (
                        <motion.div
                            key={court.CourtID}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border rounded-lg overflow-hidden shadow-lg"
                        >
                            <div className="h-40 bg-gray-300 relative">
                                {court.VenueImage ? (
                                    <Image
                                        src={court.VenueImage}
                                        alt={court.VenueName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="text-xl font-semibold">{court.CourtName}</h3>
                                <p className="text-gray-600">{court.VenueName}</p>
                                <p className="text-gray-600">{court.City}</p>
                                <p className="text-gray-800 font-bold mt-2">
                                    Rs. {court.BasePricePerHour}/hour
                                </p>
                                <Link href={`/book/${court.CourtID}`}>
                                    <button className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded">
                                        Book Now
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}

                    {courts.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-10">
                            No courts found matching your filters.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}