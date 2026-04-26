// FILE LOCATION: src/app/api/owner/venues/route.js
// URL: GET http://localhost:3000/api/owner/venues

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerVenues } from '../../../../../lib/ownerQueries';

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

        // ── 4. Fetch all venues for this owner ───────────────
        // Each venue row includes TotalCourts count
        const venues = await getOwnerVenues(decoded.userId);

        return NextResponse.json({
            success: true,
            count: venues.length,
            data: venues
        });

    } catch (error) {
        console.error('GET /api/owner/venues error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}