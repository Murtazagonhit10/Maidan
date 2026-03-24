import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
    
    // Clear the auth cookie by setting it to expire immediately
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/'
    });
    
    return response;
}