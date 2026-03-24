import { getConnection, sql } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET all bookings for a user (optional query param)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const pool = await getConnection();
        let query = `
            SELECT B.BookingID, U.FullName as UserName, V.Name as VenueName, 
                   C.CourtName, B.BookingDate, B.TotalHours, B.TotalAmount,
                   B.Status, B.PaymentStatus
            FROM Bookings B
            INNER JOIN Users U ON B.UserID = U.UserID
            INNER JOIN Venues V ON B.VenueID = V.VenueID
            INNER JOIN Courts C ON B.CourtID = C.CourtID
        `;

        if (userId) {
            query += ` WHERE B.UserID = @userId`;
        }

        query += ` ORDER BY B.BookingDate DESC`;

        const request = pool.request();
        if (userId) {
            request.input('userId', sql.Int, userId);
        }

        const result = await request.query(query);
        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST create new booking
export async function POST(request) {
    try {
        const { UserID, VenueID, CourtID, BookingDate, TotalHours, TotalAmount, Status, PaymentStatus } = await request.json();

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, UserID)
            .input('venueId', sql.Int, VenueID)
            .input('courtId', sql.Int, CourtID)
            .input('bookingDate', sql.Date, BookingDate)
            .input('totalHours', sql.Int, TotalHours)
            .input('totalAmount', sql.Decimal, TotalAmount)
            .input('status', sql.VarChar, Status || 'Confirmed')
            .input('paymentStatus', sql.VarChar, PaymentStatus || 'Pending')
            .query(`
                INSERT INTO Bookings (UserID, VenueID, CourtID, BookingDate, TotalHours, TotalAmount, Status, PaymentStatus)
                OUTPUT INSERTED.*
                VALUES (@userId, @venueId, @courtId, @bookingDate, @totalHours, @totalAmount, @status, @paymentStatus)
            `);

        return NextResponse.json(result.recordset[0], { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}