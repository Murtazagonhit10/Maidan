import { getConnection } from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
    SELECT SportID, SportName, Description, DefaultPlayerCount
    FROM Sports
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}