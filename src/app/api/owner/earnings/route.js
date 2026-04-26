// FILE LOCATION: src/app/api/owner/earnings/route.js
// URL: GET http://localhost:3000/api/owner/earnings
// URL: GET http://localhost:3000/api/owner/earnings?period=daily
// URL: GET http://localhost:3000/api/owner/earnings?period=weekly
// URL: GET http://localhost:3000/api/owner/earnings?period=monthly  ← default

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerEarnings } from '../../../../../lib/ownerQueries';

const VALID_PERIODS = ['daily', 'weekly', 'monthly'];

export async function GET(request) {
    try {
        // ── 1. Read the cookie ───────────────────────────────
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated. Please log in.' },
                { status: 401 }
            );
        }

        // ── 2. Verify JWT ────────────────────────────────────
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token. Please log in again.' },
                { status: 401 }
            );
        }

        // ── 3. Check role ────────────────────────────────────
        if (decoded.role !== 'Owner') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Owner account required.' },
                { status: 403 }
            );
        }

        // ── 4. Read & validate period param ──────────────────
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly'; // default to monthly

        if (!VALID_PERIODS.includes(period)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid period "${period}". Must be one of: ${VALID_PERIODS.join(', ')}`
                },
                { status: 400 }
            );
        }

        // ── 5. Fetch earnings chart data ─────────────────────
        // Returns array: [ { label: 'Jan 2024', revenue: 45000, bookings: 12 }, ... ]
        const earnings = await getOwnerEarnings(decoded.userId, period);

        return NextResponse.json({
            success: true,
            period,
            count: earnings.length,
            data: earnings
        });

    } catch (error) {
        console.error('GET /api/owner/earnings error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}