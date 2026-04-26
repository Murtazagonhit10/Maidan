// FILE LOCATION: src/app/api/owner/stats/route.js
// URL: GET http://localhost:3000/api/owner/stats

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerStats } from '../../../../../lib/ownerQueries';

export async function GET() {
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

        // ── 4. Fetch all stats ───────────────────────────────
        // Returns: totalRevenue, pendingRevenue,
        //          totalBookings, confirmedBookings,
        //          completedBookings, cancelledBookings,
        //          totalVenues, totalCourts, activeCourts,
        //          maintenanceCourts, occupancyRate
        const stats = await getOwnerStats(decoded.userId);

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('GET /api/owner/stats error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}