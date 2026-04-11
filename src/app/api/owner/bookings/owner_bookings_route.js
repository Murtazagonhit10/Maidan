// src/app/api/owner/bookings/route.js
// GET /api/owner/bookings
// GET /api/owner/bookings?status=Confirmed
// GET /api/owner/bookings?status=Completed
// GET /api/owner/bookings?status=Cancelled
// GET /api/owner/bookings?courtID=5
// GET /api/owner/bookings?status=Completed&courtID=5
//
// Returns all bookings for courts belonging to the owner.
// Each booking includes court name, venue name,
// player name/email/phone, sport name.

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerBookings } from '../../../../lib/ownerQueries.js';

// Valid status values (must match DB CHECK constraint exactly)
const VALID_STATUSES = ['Confirmed', 'Completed', 'Cancelled'];

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

        // ── 2. Read & validate query params ───────────────────
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status') || null;
        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
                },
                { status: 400 }
            );
        }

        const courtID = searchParams.get('courtID')
            ? parseInt(searchParams.get('courtID'))
            : null;

        // ── 3. Fetch bookings ─────────────────────────────────
        const bookings = await getOwnerBookings(decoded.id, status, courtID);

        return NextResponse.json({
            success: true,
            count: bookings.length,
            filters: { status, courtID },
            data: bookings
        });

    } catch (error) {
        console.error('GET /api/owner/bookings error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}