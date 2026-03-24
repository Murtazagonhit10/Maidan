import { getConnection } from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
    SELECT C.CourtID, V.Name as VenueName, S.SportName, 
    C.CourtName, C.BasePricePerHour, C.PeakPricePerHour
    FROM Courts C
    INNER JOIN Venues V ON C.VenueID = V.VenueID
    INNER JOIN Sports S ON C.SportID = S.SportID
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}