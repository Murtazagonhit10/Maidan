// src/app/api/owner/venues/route.js
// GET /api/owner/venues
//
// Returns all venues belonging to the logged-in owner,
// each with a count of how many courts it has.

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerVenues } from '../../../../lib/ownerQueries.js';

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

        // ── 2. Fetch venues ───────────────────────────────────
        const venues = await getOwnerVenues(decoded.id);

        return NextResponse.json({
            success: true,
            count: venues.length,
            data: venues
        });

    } catch (error) {
        console.error('GET /api/owner/venues error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}