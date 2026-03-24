import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const pool = await getConnection();
        const result = await pool.request()
            .input('venueId', sql.Int, id)
            .query(`
        SELECT V.VenueID, V.Name, V.Description, V.Location, V.City,
        V.ContactNumber, V.PrimaryImage, U.FullName as OwnerName,
        (SELECT COUNT(*) FROM Courts WHERE VenueID = V.VenueID) as TotalCourts
        FROM Venues V
        INNER JOIN Users U ON V.OwnerID = U.UserID
        WHERE V.VenueID = @venueId AND V.Status = 'Active'
    `);

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'Venue not found' },
                { status: 404 }
            );
        }

        // Get courts for this venue
        const courtsResult = await pool.request()
            .input('venueId', sql.Int, id)
            .query(`
        SELECT C.CourtID, C.CourtName, S.SportName, 
        C.BasePricePerHour, C.PeakPricePerHour
        FROM Courts C
        INNER JOIN Sports S ON C.SportID = S.SportID
        WHERE C.VenueID = @venueId AND C.Status = 'Active'
    `);

        const venue = result.recordset[0];
        venue.courts = courtsResult.recordset;

        return NextResponse.json(venue);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}


export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { Name, Description, Location, City, ContactNumber, Status } = await request.json();

        const pool = await getConnection();
        const result = await pool.request()
            .input('venueId', sql.Int, id)
            .input('name', sql.VarChar, Name)
            .input('description', sql.Text, Description)
            .input('location', sql.VarChar, Location)
            .input('city', sql.VarChar, City)
            .input('contact', sql.VarChar, ContactNumber)
            .input('status', sql.VarChar, Status)
            .query(`
        UPDATE Venues
        SET Name = @name, Description = @description, 
            Location = @location, City = @city,
            ContactNumber = @contact, Status = @status
        OUTPUT INSERTED.*
        WHERE VenueID = @venueId
    `);

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        return NextResponse.json(result.recordset[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const pool = await getConnection();
        await pool.request()
            .input('venueId', sql.Int, id)
            .query('DELETE FROM Venues WHERE VenueID = @venueId');

        return NextResponse.json({ message: 'Venue deleted successfully' });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}