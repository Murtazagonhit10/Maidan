// FILE LOCATION: src/app/api/owner/profile/route.js
// URL: GET http://localhost:3000/api/owner/profile

import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import jwt              from 'jsonwebtoken';
import { getOwnerProfile } from '../../../../../lib/ownerQueries';

export async function GET() {
    try {
        // ── 1. Read the cookie ────────────────────────────────
        // Your login sets the cookie as 'auth-token' (confirmed from login/route.js)
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated. Please log in.' },
                { status: 401 }
            );
        }

        // ── 2. Verify the JWT ────────────────────────────────
        // Your login signs the token with: { userId, email, role }
        // So decoded will have: decoded.userId, decoded.email, decoded.role
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
        // Your DB stores Role as 'Owner' (capital O) — confirmed from schema
        if (decoded.role !== 'Owner') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Owner account required.' },
                { status: 403 }
            );
        }

        // ── 4. Fetch owner profile from DB ───────────────────
        // decoded.userId is the UserID from your JWT payload (login sets it as userId)
        const profile = await getOwnerProfile(decoded.userId);

        if (!profile) {
            return NextResponse.json(
                { success: false, message: 'Owner profile not found.' },
                { status: 404 }
            );
        }

        // ── 5. Send back the profile data ────────────────────
        return NextResponse.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('GET /api/owner/profile error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error.', error: error.message },
            { status: 500 }
        );
    }
}