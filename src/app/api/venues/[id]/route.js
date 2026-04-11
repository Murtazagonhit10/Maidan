import { NextResponse } from 'next/server';
import sql from 'mssql';

/* ── DB config — reads from .env ── */
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'Maidan',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool = null;
async function getPool() {
    if (!pool) pool = await sql.connect(dbConfig);
    return pool;
}

/* ════════════════════════════════════════════════════════
   GET /api/venues/[id]
   Returns:
     venue        — full venue row + owner name
     courts       — courts with sport name & icon, grouped
     reviews      — latest 20 reviews with user details
     stats        — avgRating, totalReviews, ratingBreakdown
════════════════════════════════════════════════════════ */
export async function GET(request, { params }) {
    /* Next.js 15: params is a Promise — must await */
    const { id } = await params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
        return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 });
    }

    try {
        const db = await getPool();

        /* ── 1. Venue + owner ── */
        const venueRes = await db.request()
            .input('id', sql.Int, venueId)
            .query(`
        SELECT
          v.VenueID,
          v.Name,
          CAST(v.Description AS VARCHAR(MAX)) as Description,
          v.Location,
          v.City,
          v.ContactNumber,
          v.Status,
          v.PrimaryImage,
          v.RegistrationDate,
          v.LocationURL,
          u.FullName   AS OwnerName,
          u.ProfileImage AS OwnerImage,
          u.PhoneNumber  AS OwnerPhone
        FROM Venues v
        INNER JOIN Users u ON v.OwnerID = u.UserID
        WHERE v.VenueID = @id AND v.Status = 'Active'
      `);

        if (venueRes.recordset.length === 0) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }
        const venue = venueRes.recordset[0];

        /* ── 2. Courts with sport info ── */
        const courtsRes = await db.request()
            .input('id', sql.Int, venueId)
            .query(`
        SELECT
          c.CourtID,
          c.CourtName,
          c.BasePricePerHour,
          c.PeakPricePerHour,
          FORMAT(c.PeakStartTime, 'HH:mm') AS PeakStartTime,
          FORMAT(c.PeakEndTime, 'HH:mm') AS PeakEndTime,
          c.PeakDays,
          c.Status,
          s.SportName,
          s.Icon        AS SportIcon,
          CAST(s.Description AS VARCHAR(MAX)) AS SportDescription,
          ROUND(AVG(CAST(r.Rating AS FLOAT)), 1) AS AvgRating,
          COUNT(r.ReviewID)                       AS ReviewCount
        FROM Courts c
        INNER JOIN Sports s ON c.SportID = s.SportID
        LEFT JOIN Reviews r ON r.CourtID = c.CourtID
        WHERE c.VenueID = @id
        GROUP BY
          c.CourtID, c.CourtName, c.BasePricePerHour, c.PeakPricePerHour,
          c.PeakStartTime, c.PeakEndTime, c.PeakDays, c.Status,
          s.SportName, s.Icon, s.Description
        ORDER BY s.SportName, c.CourtName
    `);
        const courts = courtsRes.recordset;

        /* ── 3. Reviews (latest 20) with user details ── */
        const reviewsRes = await db.request()
            .input('id', sql.Int, venueId)
            .query(`
        SELECT TOP 20
          rv.ReviewID,
          rv.Rating,
          rv.Comment,
          rv.ReviewDate,
          u.FullName     AS UserName,
          u.ProfileImage AS UserImage,
          c.CourtName,
          s.SportName
        FROM Reviews rv
        INNER JOIN Users   u ON rv.UserID   = u.UserID
        INNER JOIN Courts  c ON rv.CourtID  = c.CourtID
        INNER JOIN Sports  s ON c.SportID   = s.SportID
        WHERE c.VenueID = @id
        ORDER BY rv.ReviewDate DESC
      `);
        const reviews = reviewsRes.recordset;

        /* ── 4. Aggregate stats ── */
        const statsRes = await db.request()
            .input('id', sql.Int, venueId)
            .query(`
        SELECT
          ROUND(AVG(CAST(rv.Rating AS FLOAT)), 1) AS AvgRating,
          COUNT(rv.ReviewID)                       AS TotalReviews,
          SUM(CASE WHEN rv.Rating = 5 THEN 1 ELSE 0 END) AS Stars5,
          SUM(CASE WHEN rv.Rating = 4 THEN 1 ELSE 0 END) AS Stars4,
          SUM(CASE WHEN rv.Rating = 3 THEN 1 ELSE 0 END) AS Stars3,
          SUM(CASE WHEN rv.Rating = 2 THEN 1 ELSE 0 END) AS Stars2,
          SUM(CASE WHEN rv.Rating = 1 THEN 1 ELSE 0 END) AS Stars1
        FROM Reviews rv
        INNER JOIN Courts c ON rv.CourtID = c.CourtID
        WHERE c.VenueID = @id
      `);
        const stats = statsRes.recordset[0];

        /* ── 5. Unique sports at this venue ── */
        const sportsRes = await db.request()
            .input('id', sql.Int, venueId)
            .query(`
        SELECT DISTINCT s.SportName, s.Icon
        FROM Courts c
        INNER JOIN Sports s ON c.SportID = s.SportID
        WHERE c.VenueID = @id AND c.Status = 'Active'
      `);
        const sports = sportsRes.recordset;

        return NextResponse.json({
            venue,
            courts,
            reviews,
            sports,
            stats: {
                avgRating: stats.AvgRating || 0,
                totalReviews: stats.TotalReviews || 0,
                courtCount: courts.length,
                breakdown: {
                    5: stats.Stars5 || 0,
                    4: stats.Stars4 || 0,
                    3: stats.Stars3 || 0,
                    2: stats.Stars2 || 0,
                    1: stats.Stars1 || 0,
                },
            },
        });

    } catch (err) {
        console.error('[/api/venues/[id]]', err);
        return NextResponse.json(
            { error: 'Database error', details: err.message },
            { status: 500 }
        );
    }
}