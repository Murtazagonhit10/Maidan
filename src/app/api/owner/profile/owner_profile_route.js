// src/app/api/owner/profile/route.js
// GET /api/owner/profile
//
// Returns the logged-in owner's profile details.
// Auth: reads ownerID from the JWT token stored in the
//       'token' cookie (same cookie your login route sets).

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerProfile } from '../../../../lib/ownerQueries.js';

export async function GET() {
    try {
        // ── 1. Read & verify JWT from cookie ──────────────────
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

        // ── 2. Check role ─────────────────────────────────────
        if (decoded.role !== 'Owner') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Owner role required.' },
                { status: 403 }
            );
        }

        // ── 3. Fetch from DB ──────────────────────────────────
        const profile = await getOwnerProfile(decoded.id);

        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Owner not found' },
                { status: 404 }
            );
        }

        // ── 4. Return ─────────────────────────────────────────
        return NextResponse.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('GET /api/owner/profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error', error: error.message },
            { status: 500 }
        );
    }
}