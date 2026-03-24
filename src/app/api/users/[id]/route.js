import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, id)
            .query(`
        SELECT UserID, FullName, Email, Role, PhoneNumber, RegistrationDate
        FROM Users
        WHERE UserID = @userId
    `);

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.recordset[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { FullName, PhoneNumber } = await request.json();

        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, id)
            .input('fullName', sql.VarChar, FullName)
            .input('phone', sql.VarChar, PhoneNumber)
            .query(`
        UPDATE Users
        SET FullName = @fullName, PhoneNumber = @phone
        OUTPUT INSERTED.UserID, INSERTED.FullName, INSERTED.Email, INSERTED.Role, INSERTED.PhoneNumber
        WHERE UserID = @userId
    `);

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.recordset[0]);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}