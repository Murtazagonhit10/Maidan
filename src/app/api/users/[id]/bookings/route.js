import { getConnection, sql } from '../../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;  // ← Await params first
        const userId = id;

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
        SELECT B.BookingID, V.Name as VenueName, C.CourtName,
        B.BookingDate, B.TotalHours, B.TotalAmount,
        B.Status, B.PaymentStatus
        FROM Bookings B
        INNER JOIN Venues V ON B.VenueID = V.VenueID
        INNER JOIN Courts C ON B.CourtID = C.CourtID
        WHERE B.UserID = @userId
        ORDER BY B.BookingDate DESC
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}