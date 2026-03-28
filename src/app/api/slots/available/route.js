import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '../../../../../lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get('courtId');
        const date = searchParams.get('date');

        if (!courtId || !date) {
            return NextResponse.json({ error: 'courtId and date are required' }, { status: 400 });
        }

        const pool = await getConnection();

        // Get all slots for this court on this date
        const result = await pool.request()
            .input('courtId', sql.Int, parseInt(courtId))
            .input('date', sql.Date, date)
            .query(`
                SELECT 
                    SlotID,
                    CONVERT(VARCHAR(5), StartTime, 108) as StartTime,
                    CONVERT(VARCHAR(5), EndTime, 108) as EndTime,
                    Price,
                    IsPeak,
                    Status
                FROM Slots
                WHERE CourtID = @courtId AND SlotDate = @date
                ORDER BY StartTime
            `);

        return NextResponse.json({
            slots: result.recordset,
            generated: false,
        });

    } catch (err) {
        console.error('Slots API error:', err);
        return NextResponse.json({ 
            error: err.message,
        }, { status: 500 });
    }
}