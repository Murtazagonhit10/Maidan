// FILE LOCATION: src/app/api/owner/courts/route.js
// URL: GET http://localhost:3000/api/owner/courts
// URL: GET http://localhost:3000/api/owner/courts?venueID=1

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerCourts } from '../../../../../lib/ownerQueries';

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

        // ── 4. Read optional ?venueID= query param ───────────
        // Example: /api/owner/courts?venueID=2  → only courts of venue 2
        // Example: /api/owner/courts             → all courts of this owner
        const { searchParams } = new URL(request.url);
        const venueIDParam = searchParams.get('venueID');
        const venueID = venueIDParam ? parseInt(venueIDParam) : null;

        // ── 5. Fetch courts ──────────────────────────────────
        const courts = await getOwnerCourts(decoded.userId, venueID);

        return NextResponse.json({
            success: true,
            count: courts.length,
            data: courts
        });

    } catch (error) {
        console.error('GET /api/owner/courts error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}