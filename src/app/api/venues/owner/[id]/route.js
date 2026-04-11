import { getConnection, sql } from '../../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const pool = await getConnection();
        const result = await pool.request()
            .input('ownerId', sql.Int, id)
            .query(`
        SELECT VenueID, Name, Description, Location, City, ContactNumber, Status
        FROM Venues
        WHERE OwnerID = @ownerId
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}