// src/app/api/owner/stats/route.js
// GET /api/owner/stats
//
// Returns aggregated KPI numbers for the owner dashboard:
//   totalRevenue, pendingRevenue,
//   totalBookings, confirmedBookings, completedBookings, cancelledBookings,
//   totalVenues, totalCourts, activeCourts, maintenanceCourts,
//   occupancyRate (%)

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerStats } from '../../../../lib/ownerQueries.js';

export async function GET() {
    try {
        // ── 1. Auth ───────────────────────────────────────────
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        if (decoded.role !== 'Owner') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Owner role required.' },
                { status: 403 }
            );
        }

        // ── 2. Fetch stats ────────────────────────────────────
        const stats = await getOwnerStats(decoded.id);

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('GET /api/owner/stats error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}