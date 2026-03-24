import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { Email, CNIC, Password, FullName, PhoneNumber, Role, DateOfBirth } = await request.json();

        if (!Email || !CNIC || !Password || !FullName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const pool = await getConnection();

        const existingUser = await pool.request()
            .input('email', sql.VarChar, Email)
            .input('cnic', sql.VarChar, CNIC)
            .query('SELECT UserID FROM Users WHERE Email = @email OR CNIC = @cnic');

        if (existingUser.recordset.length > 0) {
            return NextResponse.json(
                { error: 'User with this email or CNIC already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const result = await pool.request()
            .input('email', sql.VarChar, Email)
            .input('cnic', sql.VarChar, CNIC)
            .input('password', sql.VarChar, hashedPassword)
            .input('fullName', sql.VarChar, FullName)
            .input('phone', sql.VarChar, PhoneNumber || null)
            .input('role', sql.VarChar, Role || 'Player')
            .input('dob', sql.Date, DateOfBirth || null)  // ← Add this
            .query(`
                INSERT INTO Users (Email, CNIC, Password, FullName, PhoneNumber, Role, DateOfBirth, RegistrationDate)
                OUTPUT INSERTED.UserID, INSERTED.Email, INSERTED.FullName, INSERTED.Role
                VALUES (@email, @cnic, @password, @fullName, @phone, @role, @dob, GETDATE())
            `);

        const token = jwt.sign(
            { 
                userId: result.recordset[0].UserID, 
                email: result.recordset[0].Email, 
                role: result.recordset[0].Role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const response = NextResponse.json({
            success: true,
            user: result.recordset[0],
            message: 'Registration successful'
        }, { status: 201 });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });

        return response;

    } catch (err) {
        console.error('Registration error:', err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}