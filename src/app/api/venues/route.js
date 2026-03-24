import { getConnection, sql } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET all venues (public)
export async function GET() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
    SELECT V.VenueID, V.Name, V.Description, V.Location, V.City, 
    V.ContactNumber, V.PrimaryImage, U.FullName as OwnerName
    FROM Venues V
    INNER JOIN Users U ON V.OwnerID = U.UserID
    WHERE V.Status = 'Active'
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST create new venue (owners only)
export async function POST(request) {
    try {
        const { OwnerID, Name, Description, Location, City, ContactNumber, PrimaryImage } = await request.json();

        const pool = await getConnection();
        const result = await pool.request()
            .input('ownerId', sql.Int, OwnerID)
            .input('name', sql.VarChar, Name)
            .input('description', sql.Text, Description)
            .input('location', sql.VarChar, Location)
            .input('city', sql.VarChar, City)
            .input('contact', sql.VarChar, ContactNumber)
            .input('image', sql.VarChar, PrimaryImage)
            .query(`
        INSERT INTO Venues (OwnerID, Name, Description, Location, City, ContactNumber, PrimaryImage)
        OUTPUT INSERTED.*
        VALUES (@ownerId, @name, @description, @location, @city, @contact, @image)
    `);

        return NextResponse.json(result.recordset[0], { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}