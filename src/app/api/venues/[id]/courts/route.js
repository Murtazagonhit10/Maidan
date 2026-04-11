import { getConnection, sql } from '../../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const pool = await getConnection();
        const result = await pool.request()
            .input('venueId', sql.Int, id)
            .query(`
        SELECT C.CourtID, C.CourtName, S.SportName,
        C.BasePricePerHour, C.PeakPricePerHour, C.Status
        FROM Courts C
        INNER JOIN Sports S ON C.SportID = S.SportID
        WHERE C.VenueID = @venueId
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}