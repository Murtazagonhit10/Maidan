// src/app/api/owner/courts/route.js
// GET /api/owner/courts
// GET /api/owner/courts?venueID=3   ← optional filter by venue
//
// Returns all courts across all the owner's venues,
// joined with sport name and venue name.

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerCourts } from '../../../../lib/ownerQueries.js';

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

        // ── 2. Optional query param: venueID ──────────────────
        const { searchParams } = new URL(request.url);
        const venueID = searchParams.get('venueID')
            ? parseInt(searchParams.get('venueID'))
            : null;

        // ── 3. Fetch courts ───────────────────────────────────
        const courts = await getOwnerCourts(decoded.id, venueID);

        return NextResponse.json({
            success: true,
            count: courts.length,
            data: courts
        });

    } catch (error) {
        console.error('GET /api/owner/courts error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}