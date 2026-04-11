import { getConnection, sql } from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT 
                v.VenueID, 
                v.Name, 
                v.Description, 
                v.Location, 
                v.City, 
                v.ContactNumber, 
                v.PrimaryImage, 
                v.RegistrationDate,
                v.Status,
                u.FullName as OwnerName,
                STUFF((
                    SELECT DISTINCT ',' + s.SportName
                    FROM Courts c
                    INNER JOIN Sports s ON c.SportID = s.SportID
                    WHERE c.VenueID = v.VenueID AND c.Status = 'Active'
                    FOR XML PATH('')
                ), 1, 1, '') AS sports,
                (
                    SELECT ROUND(AVG(CAST(r.Rating AS FLOAT)), 1)
                    FROM Courts c
                    INNER JOIN Reviews r ON r.CourtID = c.CourtID
                    WHERE c.VenueID = v.VenueID
                ) AS avgRating,
                (
                    SELECT COUNT(DISTINCT r.ReviewID)
                    FROM Courts c
                    INNER JOIN Reviews r ON r.CourtID = c.CourtID
                    WHERE c.VenueID = v.VenueID
                ) AS reviewCount,
                (
                    SELECT MIN(c.BasePricePerHour)
                    FROM Courts c
                    WHERE c.VenueID = v.VenueID AND c.Status = 'Active'
                ) AS minPrice,
                (
                    SELECT MAX(ISNULL(c.PeakPricePerHour, c.BasePricePerHour))
                    FROM Courts c
                    WHERE c.VenueID = v.VenueID AND c.Status = 'Active'
                ) AS maxPrice,
                (
                    SELECT COUNT(DISTINCT c.CourtID)
                    FROM Courts c
                    WHERE c.VenueID = v.VenueID AND c.Status = 'Active'
                ) AS courtCount
            FROM Venues v
            INNER JOIN Users u ON v.OwnerID = u.UserID
            WHERE v.Status = 'Active'
            ORDER BY v.RegistrationDate DESC
        `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        console.error('Venues API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}