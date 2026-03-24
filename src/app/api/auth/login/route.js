import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { Email, Password, remember } = await request.json();

        console.log('Login attempt for email:', Email);

        if (!Email || !Password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.VarChar, Email)
            .query(`
                SELECT UserID, FullName, Email, Role, PhoneNumber, Password, ProfileImage
                FROM Users
                WHERE Email = @email
            `);

        console.log('User found:', result.recordset.length > 0);

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = result.recordset[0];
        console.log('Stored password hash:', user.Password);
        
        const isValidPassword = await bcrypt.compare(Password, user.Password);
        console.log('Password valid:', isValidPassword);
        
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { 
                userId: user.UserID, 
                email: user.Email, 
                role: user.Role 
            },
            process.env.JWT_SECRET,
            { expiresIn: remember ? '30d' : '24h' }
        );

        const { Password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json({
            success: true,
            user: userWithoutPassword,
            message: 'Login successful'
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
            path: '/'
        });

        return response;

    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}