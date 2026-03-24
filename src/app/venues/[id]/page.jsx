'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function VenueDetailPage() {
    const params = useParams();
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/venues/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setVenue(data);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (!venue) return <div className="text-center p-10">Venue not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Link href="/venues" className="text-blue-600 mb-4 inline-block">← Back to Venues</Link>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-300 relative rounded-lg overflow-hidden">
                    {venue.PrimaryImage ? (
                        <Image
                            src={venue.PrimaryImage}
                            alt={venue.Name}
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
                
                <div>
                    <h1 className="text-3xl font-bold mb-2">{venue.Name}</h1>
                    <p className="text-gray-600 mb-4">{venue.City} • {venue.Location}</p>
                    
                    <div className="mb-4">
                        <p className="text-gray-700">{venue.Description}</p>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-gray-600">Contact: {venue.ContactNumber}</p>
                        <p className="text-gray-600">Owner: {venue.OwnerName}</p>
                        <p className="text-gray-600">Total Courts: {venue.TotalCourts}</p>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Courts</h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {venue.courts?.map(court => (
                            <div key={court.CourtID} className="border p-4 rounded-lg">
                                <h3 className="text-xl font-semibold">{court.CourtName}</h3>
                                <p className="text-gray-600">{court.SportName}</p>
                                <p className="text-gray-800 font-bold mt-2">
                                    Base Price: Rs. {court.BasePricePerHour}/hour
                                    {court.PeakPricePerHour && (
                                        <span className="ml-4 text-orange-600">
                                            Peak: Rs. {court.PeakPricePerHour}/hour
                                        </span>
                                    )}
                                </p>
                                <Link href={`/book/${court.CourtID}`}>
                                    <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded">
                                        Book Now
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}