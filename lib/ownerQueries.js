import { getConnection, sql } from './db.js';

// ─────────────────────────────────────────────────────────────
// 1. OWNER PROFILE
// ─────────────────────────────────────────────────────────────
export async function getOwnerProfile(ownerID) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('ownerID', sql.Int, ownerID)
        .query(`
            SELECT
                UserID,
                FullName,
                Email,
                PhoneNumber,
                CNIC,
                ProfileImage,
                RegistrationDate,
                Role
            FROM Users
            WHERE UserID = @ownerID
              AND Role = 'Owner'
        `);
    return result.recordset[0] || null;
}

// ─────────────────────────────────────────────────────────────
// 2. OWNER VENUES
// ─────────────────────────────────────────────────────────────
export async function getOwnerVenues(ownerID) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('ownerID', sql.Int, ownerID)
        .query(`
            SELECT
                v.VenueID,
                v.Name          AS VenueName,
                v.Location,
                v.City,
                v.Status,
                v.ContactNumber,
                v.PrimaryImage,
                v.RegistrationDate,
                COUNT(c.CourtID) AS TotalCourts
            FROM Venues v
            LEFT JOIN Courts c ON c.VenueID = v.VenueID
            WHERE v.OwnerID = @ownerID
            GROUP BY
                v.VenueID, v.Name, v.Location, v.City,
                v.Status, v.ContactNumber, v.PrimaryImage,
                v.RegistrationDate
            ORDER BY v.RegistrationDate DESC
        `);
    return result.recordset;
}

// ─────────────────────────────────────────────────────────────
// 3. OWNER COURTS
// ─────────────────────────────────────────────────────────────
export async function getOwnerCourts(ownerID, venueID = null) {
    const pool = await getConnection();
    const request = pool.request()
        .input('ownerID', sql.Int, ownerID);

    let venueFilter = '';
    if (venueID) {
        request.input('venueID', sql.Int, venueID);
        venueFilter = 'AND c.VenueID = @venueID';
    }

    const result = await request.query(`
        SELECT
            c.CourtID,
            c.CourtName,
            c.BasePricePerHour,
            c.PeakPricePerHour,
            c.Status,
            c.RegistrationDate,
            v.VenueID,
            v.Name      AS VenueName,
            v.City,
            s.SportID,
            s.SportName,
            s.Icon      AS SportIcon
        FROM Courts c
        INNER JOIN Venues v ON v.VenueID = c.VenueID
        INNER JOIN Sports s ON s.SportID = c.SportID
        WHERE v.OwnerID = @ownerID
          ${venueFilter}
        ORDER BY v.Name, c.CourtName
    `);
    return result.recordset;
}

// ─────────────────────────────────────────────────────────────
// 4. OWNER BOOKINGS
// ─────────────────────────────────────────────────────────────
export async function getOwnerBookings(ownerID, status = null, courtID = null) {
    const pool = await getConnection();
    const request = pool.request()
        .input('ownerID', sql.Int, ownerID);

    let statusFilter = '';
    let courtFilter  = '';

    if (status) {
        request.input('status', sql.VarChar(20), status);
        statusFilter = 'AND b.Status = @status';
    }
    if (courtID) {
        request.input('courtID', sql.Int, courtID);
        courtFilter = 'AND b.CourtID = @courtID';
    }

    const result = await request.query(`
        SELECT
            b.BookingID,
            b.BookingDate,
            b.TotalHours,
            b.TotalAmount,
            b.Status,
            b.PaymentStatus,
            b.DiscountAmount,
            c.CourtID,
            c.CourtName,
            v.VenueID,
            v.Name          AS VenueName,
            s.SportName,
            u.UserID        AS PlayerID,
            u.FullName      AS PlayerName,
            u.Email         AS PlayerEmail,
            u.PhoneNumber   AS PlayerPhone
        FROM Bookings b
        INNER JOIN Courts c  ON c.CourtID  = b.CourtID
        INNER JOIN Venues v  ON v.VenueID  = b.VenueID
        INNER JOIN Users u   ON u.UserID   = b.UserID
        INNER JOIN Sports s  ON s.SportID  = c.SportID
        WHERE v.OwnerID = @ownerID
          ${statusFilter}
          ${courtFilter}
        ORDER BY b.BookingDate DESC
    `);
    return result.recordset;
}

// ─────────────────────────────────────────────────────────────
// 5. OWNER STATS
// ─────────────────────────────────────────────────────────────
export async function getOwnerStats(ownerID) {
    const pool = await getConnection();

    const bookingResult = await pool.request()
        .input('ownerID', sql.Int, ownerID)
        .query(`
            SELECT
                COUNT(b.BookingID) AS TotalBookings,
                SUM(CASE WHEN b.Status = 'Confirmed'  THEN 1 ELSE 0 END) AS ConfirmedBookings,
                SUM(CASE WHEN b.Status = 'Completed'  THEN 1 ELSE 0 END) AS CompletedBookings,
                SUM(CASE WHEN b.Status = 'Cancelled'  THEN 1 ELSE 0 END) AS CancelledBookings,
                ISNULL(SUM(CASE WHEN b.Status = 'Completed' THEN b.TotalAmount ELSE 0 END), 0) AS TotalRevenue,
                ISNULL(SUM(CASE WHEN b.Status = 'Confirmed' AND b.PaymentStatus = 'Pending' THEN b.TotalAmount ELSE 0 END), 0) AS PendingRevenue
            FROM Bookings b
            INNER JOIN Courts c ON c.CourtID = b.CourtID
            INNER JOIN Venues v ON v.VenueID = b.VenueID
            WHERE v.OwnerID = @ownerID
        `);

    const courtResult = await pool.request()
        .input('ownerID', sql.Int, ownerID)
        .query(`
            SELECT
                COUNT(c.CourtID) AS TotalCourts,
                SUM(CASE WHEN c.Status = 'Active'      THEN 1 ELSE 0 END) AS ActiveCourts,
                SUM(CASE WHEN c.Status = 'Maintenance' THEN 1 ELSE 0 END) AS MaintenanceCourts
            FROM Courts c
            INNER JOIN Venues v ON v.VenueID = c.VenueID
            WHERE v.OwnerID = @ownerID
        `);

    const venueResult = await pool.request()
        .input('ownerID', sql.Int, ownerID)
        .query(`
            SELECT COUNT(VenueID) AS TotalVenues
            FROM Venues
            WHERE OwnerID = @ownerID
        `);

    const b = bookingResult.recordset[0];
    const c = courtResult.recordset[0];
    const v = venueResult.recordset[0];

    const occupancyRate = b.TotalBookings > 0
        ? Math.round((b.CompletedBookings / b.TotalBookings) * 100)
        : 0;

    return {
        totalRevenue:      parseFloat(b.TotalRevenue)   || 0,
        pendingRevenue:    parseFloat(b.PendingRevenue) || 0,
        totalBookings:     b.TotalBookings              || 0,
        confirmedBookings: b.ConfirmedBookings          || 0,
        completedBookings: b.CompletedBookings          || 0,
        cancelledBookings: b.CancelledBookings          || 0,
        totalVenues:       v.TotalVenues                || 0,
        totalCourts:       c.TotalCourts                || 0,
        activeCourts:      c.ActiveCourts               || 0,
        maintenanceCourts: c.MaintenanceCourts          || 0,
        occupancyRate,
    };
}

// ─────────────────────────────────────────────────────────────
// 6. OWNER EARNINGS (chart data)
// ─────────────────────────────────────────────────────────────
export async function getOwnerEarnings(ownerID, period = 'monthly') {
    const pool = await getConnection();
    const request = pool.request()
        .input('ownerID', sql.Int, ownerID);

    let selectLabel, groupBy, orderBy, dateFilter;

    if (period === 'daily') {
        selectLabel = `FORMAT(b.BookingDate, 'dd MMM yyyy')`;
        groupBy     = `CAST(b.BookingDate AS DATE)`;
        orderBy     = `CAST(b.BookingDate AS DATE)`;
        dateFilter  = `AND b.BookingDate >= CAST(DATEADD(DAY, -30, GETDATE()) AS DATE)`;
    } else if (period === 'weekly') {
        selectLabel = `CONCAT('Wk ', DATEPART(ISO_WEEK, b.BookingDate), '/', YEAR(b.BookingDate))`;
        groupBy     = `YEAR(b.BookingDate), DATEPART(ISO_WEEK, b.BookingDate)`;
        orderBy     = `YEAR(b.BookingDate), DATEPART(ISO_WEEK, b.BookingDate)`;
        dateFilter  = `AND b.BookingDate >= CAST(DATEADD(WEEK, -12, GETDATE()) AS DATE)`;
    } else {
        selectLabel = `FORMAT(b.BookingDate, 'MMM yyyy')`;
        groupBy     = `YEAR(b.BookingDate), MONTH(b.BookingDate)`;
        orderBy     = `YEAR(b.BookingDate), MONTH(b.BookingDate)`;
        dateFilter  = `AND b.BookingDate >= CAST(DATEADD(MONTH, -12, GETDATE()) AS DATE)`;
    }

    const result = await request.query(`
        SELECT
            ${selectLabel}         AS Label,
            SUM(b.TotalAmount)     AS Revenue,
            COUNT(b.BookingID)     AS Bookings
        FROM Bookings b
        INNER JOIN Courts c ON c.CourtID = b.CourtID
        INNER JOIN Venues v ON v.VenueID = b.VenueID
        WHERE v.OwnerID = @ownerID
          AND b.Status  = 'Completed'
          ${dateFilter}
        GROUP BY ${groupBy}, ${selectLabel}
        ORDER BY ${orderBy}
    `);

    return result.recordset.map(row => ({
        label:    row.Label,
        revenue:  parseFloat(row.Revenue)  || 0,
        bookings: parseInt(row.Bookings)   || 0,
    }));
}