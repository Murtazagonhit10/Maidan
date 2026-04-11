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
            DateOfBirth,
            // Owner-specific fields (only if Role is 'Owner')
            BusinessName,
            BusinessAddress,
            BusinessPhone,
            NTNNumber  // Tax number for business
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

        // Validate CNIC format
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!cnicRegex.test(CNIC)) {
            return NextResponse.json(
                { success: false, error: 'Invalid CNIC format. Use: 00000-0000000-0' },
                { status: 400 }
            );
        }

        // Validate owner-specific fields
        if (Role === 'Owner') {
            if (!BusinessName || !BusinessAddress) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Owners must provide Business Name and Business Address' 
                    },
                    { status: 400 }
                );
            }
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

        // Insert new user
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

        // If user is an Owner, create owner profile
        if (Role === 'Owner') {
            await pool.request()
                .input('userId', sql.Int, newUser.UserID)
                .input('businessName', sql.NVarChar, BusinessName)
                .input('businessAddress', sql.NVarChar, BusinessAddress)
                .input('businessPhone', sql.VarChar, BusinessPhone || PhoneNumber)
                .input('ntnNumber', sql.VarChar, NTNNumber || null)
                .input('isVerified', sql.Bit, 0)  // Owners need admin verification
                .query(`
                    INSERT INTO OwnerProfiles (UserID, BusinessName, BusinessAddress, BusinessPhone, NTNNumber, IsVerified, RegistrationDate)
                    VALUES (@userId, @businessName, @businessAddress, @businessPhone, @ntnNumber, @isVerified, GETDATE())
                `);
            
            console.log('✅ Owner profile created for user:', newUser.UserID);
        }

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
                message: Role === 'Owner' ? 'Owner registration successful! Awaiting admin verification.' : 'Registration successful',
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

        console.log('✅ Registration complete');
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