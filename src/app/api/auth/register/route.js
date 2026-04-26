import { getConnection, sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        console.log('📝 Registration API called');
        
        const body = await request.json();
        console.log('Received data:', { ...body, Password: '***HIDDEN***' });
        
        const { 
            Email, 
            CNIC, 
            Password, 
            FullName, 
            PhoneNumber, 
            Role,  // 'Player' or 'Owner'
            DateOfBirth
        } = body;

        // Validate required fields
        if (!Email || !CNIC || !Password || !FullName) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Missing required fields',
                    required: ['Email', 'CNIC', 'Password', 'FullName']
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate CNIC format (matches your SQL data: 00000-0000000-0)
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!cnicRegex.test(CNIC)) {
            return NextResponse.json(
                { success: false, error: 'Invalid CNIC format. Use: 00000-0000000-0' },
                { status: 400 }
            );
        }

        // Validate Role
        if (Role && !['Player', 'Owner', 'Admin'].includes(Role)) {
            return NextResponse.json(
                { success: false, error: 'Role must be Player, Owner, or Admin' },
                { status: 400 }
            );
        }

        // Get database connection
        const pool = await getConnection();

        // Check if user already exists
        const existingUser = await pool.request()
            .input('email', sql.VarChar, Email)
            .input('cnic', sql.VarChar, CNIC)
            .query(`
                SELECT UserID, Email, CNIC 
                FROM Users 
                WHERE Email = @email OR CNIC = @cnic
            `);

        if (existingUser.recordset.length > 0) {
            const existing = existingUser.recordset[0];
            const conflictField = existing.Email === Email ? 'Email' : 'CNIC';
            return NextResponse.json(
                { 
                    success: false, 
                    error: `User with this ${conflictField} already exists` 
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Insert new user (without OwnerProfiles table since it doesn't exist)
        const result = await pool.request()
            .input('email', sql.VarChar, Email)
            .input('cnic', sql.VarChar, CNIC)
            .input('password', sql.VarChar, hashedPassword)
            .input('fullName', sql.NVarChar, FullName)
            .input('phone', sql.VarChar, PhoneNumber || null)
            .input('role', sql.VarChar, Role || 'Player')
            .input('dob', sql.Date, DateOfBirth || null)
            .query(`
                INSERT INTO Users (Email, CNIC, Password, FullName, PhoneNumber, Role, DateOfBirth, RegistrationDate)
                OUTPUT INSERTED.UserID, INSERTED.Email, INSERTED.FullName, INSERTED.Role, INSERTED.RegistrationDate
                VALUES (@email, @cnic, @password, @fullName, @phone, @role, @dob, GETDATE())
            `);

        const newUser = result.recordset[0];

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.UserID, 
                email: newUser.Email, 
                role: newUser.Role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: 'Registration successful',
                user: {
                    id: newUser.UserID,
                    email: newUser.Email,
                    fullName: newUser.FullName,
                    role: newUser.Role,
                    registrationDate: newUser.RegistrationDate
                }
            },
            { status: 201 }
        );

        // Set JWT cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });

        console.log('✅ Registration complete for user:', newUser.UserID);
        return response;

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// Add GET method for testing (returns list of users or test endpoint info)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        
        const pool = await getConnection();
        
        // Test endpoint - just check connection
        if (action === 'test') {
            const result = await pool.request().query('SELECT GETDATE() as serverTime, DB_NAME() as databaseName');
            return NextResponse.json({
                success: true,
                message: 'Registration API is working',
                serverTime: result.recordset[0].serverTime,
                database: result.recordset[0].databaseName
            });
        }
        
        // Get list of users (for testing only - protect this in production)
        if (action === 'users') {
            const result = await pool.request().query(`
                SELECT UserID, Email, FullName, Role, PhoneNumber, RegistrationDate 
                FROM Users 
                ORDER BY RegistrationDate DESC
            `);
            return NextResponse.json({
                success: true,
                users: result.recordset
            });
        }
        
        // Default GET response - API info
        return NextResponse.json({
            success: true,
            message: 'Registration API endpoint',
            methods: ['POST'],
            description: 'Use POST method to register a new user',
            required_fields: ['Email', 'CNIC', 'Password', 'FullName'],
            optional_fields: ['PhoneNumber', 'Role', 'DateOfBirth'],
            valid_roles: ['Player', 'Owner', 'Admin']
        });
        
    } catch (error) {
        console.error('❌ GET request error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process GET request',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}