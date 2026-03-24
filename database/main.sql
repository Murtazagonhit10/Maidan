USE Maidan
GO

SELECT * FROM Users;
SELECT * FROM Bookings
SELECT * FROM Courts

SELECT * FROM Venues WHERE OwnerID = 2;

-- DELETE FROM Complaints;
-- DELETE FROM User_Memberships;
-- DELETE FROM Reviews;
-- DELETE FROM Payments;
-- DELETE FROM Booking_Slots;
-- DELETE FROM Bookings;
-- DELETE FROM Slots;
-- DELETE FROM Courts;
-- DELETE FROM Venues;
-- DELETE FROM Users;
-- DELETE FROM Sports;
-- DELETE FROM Membership_Plans;
-- DELETE FROM PromoCodes;


-- reset identity
-- DBCC CHECKIDENT ('Complaints', RESEED, 0);

-- Order to run inserts after clearing tables:

-- Sports ✅ (no dependencies)

-- Membership_Plans ✅ (no dependencies)

-- PromoCodes ✅ (no dependencies)

-- Users → Skip this (use Postman instead)

-- Venues (depends on Users - Owners must exist first)

-- Courts (depends on Venues, Sports)

-- Slots (depends on Courts)

-- Bookings (depends on Users, Venues, Courts)

-- Booking_Slots (depends on Bookings, Slots)

-- Payments (depends on Bookings)

-- Reviews (depends on Bookings, Users, Courts)

-- User_Memberships (depends on Users, Membership_Plans)

-- Complaints (depends on Users, Bookings)
