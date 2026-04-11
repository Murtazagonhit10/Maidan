// src/app/api/owner/earnings/route.js
// GET /api/owner/earnings
// GET /api/owner/earnings?period=daily     ← last 30 days
// GET /api/owner/earnings?period=weekly    ← last 12 weeks
// GET /api/owner/earnings?period=monthly   ← last 12 months (default)
//
// Returns array of { label, revenue, bookings }
// Only counts Completed bookings.

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerEarnings } from '../../../../lib/ownerQueries.js';

const VALID_PERIODS = ['daily', 'weekly', 'monthly'];

export async function GET(request) {
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

        // ── 2. Read & validate period param ───────────────────
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly';

        if (!VALID_PERIODS.includes(period)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`
                },
                { status: 400 }
            );
        }

        // ── 3. Fetch earnings ─────────────────────────────────
        const earnings = await getOwnerEarnings(decoded.id, period);

        return NextResponse.json({
            success: true,
            period,
            count: earnings.length,
            data: earnings
        });

    } catch (error) {
        console.error('GET /api/owner/earnings error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}