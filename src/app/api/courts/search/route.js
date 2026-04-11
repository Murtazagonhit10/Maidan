import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport');
        const city = searchParams.get('city');
        const date = searchParams.get('date');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        let query = `
    SELECT DISTINCT 
        C.CourtID, C.CourtName, V.Name as VenueName, 
        V.City, V.Location, S.SportName,
        C.BasePricePerHour, C.PeakPricePerHour,
        V.PrimaryImage as VenueImage
    FROM Courts C
    INNER JOIN Venues V ON C.VenueID = V.VenueID
    INNER JOIN Sports S ON C.SportID = S.SportID
    WHERE V.Status = 'Active' AND C.Status = 'Active'
    `;

        if (sport) {
            query += ` AND S.SportName = '${sport}'`;
        }

        if (city) {
            query += ` AND V.City LIKE '%${city}%'`;
        }

        if (minPrice) {
            query += ` AND C.BasePricePerHour >= ${minPrice}`;
        }

        if (maxPrice) {
            query += ` AND C.BasePricePerHour <= ${maxPrice}`;
        }

        const pool = await getConnection();
        const result = await pool.request().query(query);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}