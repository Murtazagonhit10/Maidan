'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
    }, [router]);

    async function handleLogout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            localStorage.removeItem('user');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0f0a06] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#0f0a06] pt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#120d07] border border-[#d28c3c]/20 rounded-lg p-8">
                        <h1 className="text-3xl font-bold text-[#f5efe6] mb-4">
                            Welcome, <span className="text-[#d28c3c]">{user.FullName}</span>
                        </h1>
                        <p className="text-gray-400 mb-6">
                            Email: {user.Email}<br />
                            Role: {user.Role}
                        </p>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-[#d28c3c] text-[#0f0a06] rounded-md hover:bg-[#e8a055] transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}