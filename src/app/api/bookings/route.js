import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getConnection } from '../../../../lib/db';

// Helper function to format time as HH:MM:SS
function formatTime(timeStr) {
    // If timeStr is already in HH:MM:SS format
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeStr;
    }
    // If timeStr is in HH:MM format, add :00
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
        return `${timeStr}:00`;
    }
    // Fallback
    const parts = timeStr.split(':');
    const hour = parts[0].padStart(2, '0');
    const minute = (parts[1] || '00').padStart(2, '0');
    return `${hour}:${minute}:00`;
}

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('=== Booking API Debug ===');
        console.log('Request body:', body);

        const { venueId, courtId, bookingDate, slots, totalAmount, paymentMethod } = body;

        const userId = 5;

        if (!venueId || !courtId || !bookingDate || !slots || slots.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const pool = await getConnection();
        console.log('DB Connected');

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log('Transaction started');

        try {
            // 1. Create booking record
            const bookingResult = await transaction.request()
                .input('userId', sql.Int, userId)
                .input('venueId', sql.Int, venueId)
                .input('courtId', sql.Int, courtId)
                .input('bookingDate', sql.Date, bookingDate)
                .input('totalHours', sql.Int, slots.length)
                .input('totalAmount', sql.Decimal(10, 2), totalAmount)
                .input('status', sql.VarChar, 'Confirmed')
                .input('paymentStatus', sql.VarChar, 'Pending')
                .query(`
                    INSERT INTO Bookings (UserID, VenueID, CourtID, BookingDate, TotalHours, TotalAmount, Status, PaymentStatus)
                    OUTPUT INSERTED.BookingID
                    VALUES (@userId, @venueId, @courtId, @bookingDate, @totalHours, @totalAmount, @status, @paymentStatus)
                `);

            const bookingId = bookingResult.recordset[0].BookingID;
            console.log('Booking created with ID:', bookingId);

            // 2. Create slots and booking_slots
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const startTimeFormatted = formatTime(slot.startTime);
                const endTimeFormatted = formatTime(slot.endTime);
                
                console.log(`Processing slot: ${startTimeFormatted} - ${endTimeFormatted}`);

                // Check if slot exists using the formatted time string
                const slotCheck = await transaction.request()
                    .input('courtId', sql.Int, courtId)
                    .input('slotDate', sql.Date, bookingDate)
                    .input('startTime', sql.VarChar, startTimeFormatted)
                    .query(`
                        SELECT SlotID FROM Slots 
                        WHERE CourtID = @courtId AND SlotDate = @slotDate AND CONVERT(VARCHAR(8), StartTime, 108) = @startTime
                    `);

                let slotId;
                if (slotCheck.recordset.length === 0) {
                    console.log('Creating new slot...');
                    const newSlot = await transaction.request()
                        .input('courtId', sql.Int, courtId)
                        .input('slotDate', sql.Date, bookingDate)
                        .input('startTime', sql.VarChar, startTimeFormatted)
                        .input('endTime', sql.VarChar, endTimeFormatted)
                        .input('price', sql.Decimal(10, 2), slot.price)
                        .input('isPeak', sql.Bit, slot.isPeak ? 1 : 0)
                        .input('status', sql.VarChar, 'Booked')
                        .query(`
                            INSERT INTO Slots (CourtID, SlotDate, StartTime, EndTime, Price, IsPeak, Status)
                            OUTPUT INSERTED.SlotID
                            VALUES (@courtId, @slotDate, @startTime, @endTime, @price, @isPeak, @status)
                        `);
                    slotId = newSlot.recordset[0].SlotID;
                } else {
                    slotId = slotCheck.recordset[0].SlotID;
                    await transaction.request()
                        .input('slotId', sql.Int, slotId)
                        .query(`UPDATE Slots SET Status = 'Booked' WHERE SlotID = @slotId`);
                }

                // Create booking_slot entry
                await transaction.request()
                    .input('bookingId', sql.Int, bookingId)
                    .input('slotId', sql.Int, slotId)
                    .input('price', sql.Decimal(10, 2), slot.price)
                    .query(`
                        INSERT INTO Booking_Slots (BookingID, SlotID, Price)
                        VALUES (@bookingId, @slotId, @price)
                    `);
                console.log('Booking_Slot created');
            }

            // 3. Create payment record
            await transaction.request()
                .input('bookingId', sql.Int, bookingId)
                .input('amount', sql.Decimal(10, 2), totalAmount)
                .input('paymentMethod', sql.VarChar, paymentMethod)
                .input('status', sql.VarChar, 'pending')
                .query(`
                    INSERT INTO Payments (BookingID, Amount, PaymentMethod, Status, PaymentDate)
                    VALUES (@bookingId, @amount, @paymentMethod, @status, GETDATE())
                `);
            console.log('Payment record created');

            await transaction.commit();
            console.log('Transaction committed successfully');

            return NextResponse.json({
                success: true,
                bookingId,
                message: 'Booking confirmed successfully',
            }, { status: 201 });

        } catch (err) {
            console.error('Transaction error:', err);
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('Booking API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}