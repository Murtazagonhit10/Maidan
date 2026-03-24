import { getConnection , sql } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get('courtId');
        const date = searchParams.get('date');

        if (!courtId || !date) {
            return NextResponse.json(
                { error: 'courtId and date are required' },
                { status: 400 }
            );
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('courtId', sql.Int, courtId)
            .input('date', sql.Date, date)
            .query(`
        SELECT SlotID, StartTime, EndTime, Price, IsPeak
        FROM Slots
        WHERE CourtID = @courtId
        AND SlotDate = @date
        AND Status = 'Available'
        ORDER BY StartTime
    `);

        return NextResponse.json(result.recordset);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}