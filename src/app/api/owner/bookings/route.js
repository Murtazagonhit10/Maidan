

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerBookings } from '../../../../../lib/ownerQueries';

// These match the CHECK constraint in your schema exactly
const VALID_STATUSES = ['Confirmed', 'Completed', 'Cancelled'];

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

        // ── 4. Read & validate query params ──────────────────
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status') || null;

        // Reject if status is provided but not one of the 3 valid values
        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}`
                },
                { status: 400 }
            );
        }

        const courtIDParam = searchParams.get('courtID');
        const courtID = courtIDParam ? parseInt(courtIDParam) : null;

        // ── 5. Fetch bookings ────────────────────────────────
        const bookings = await getOwnerBookings(decoded.userId, status, courtID);

        return NextResponse.json({
            success: true,
            count: bookings.length,
            filters: { status, courtID },   // echo back what filters were applied
            data: bookings
        });

    } catch (error) {
        console.error('GET /api/owner/bookings error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}