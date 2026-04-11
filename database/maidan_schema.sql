IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Maidan')
BEGIN
    ALTER DATABASE Maidan SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Maidan;
END
GO

-- Create fresh database
CREATE DATABASE Maidan;
GO

USE Maidan;
GO



-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS Complaints;
DROP TABLE IF EXISTS User_Memberships;
DROP TABLE IF EXISTS Membership_Plans;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Booking_Slots;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Slots;
DROP TABLE IF EXISTS Courts;
DROP TABLE IF EXISTS Sports;
DROP TABLE IF EXISTS Venues;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS PromoCodes;

-- 1. Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    CNIC VARCHAR(20) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Player', 'Owner', 'Admin')),
    ProfileImage VARCHAR(255),
    RegistrationDate DATETIME DEFAULT GETDATE()
);

-- 2. Venues
CREATE TABLE Venues (
    VenueID INT IDENTITY(1,1) PRIMARY KEY,
    OwnerID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Location VARCHAR(255) NOT NULL,
    City VARCHAR(50) NOT NULL,
    ContactNumber VARCHAR(20),
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive')),
    PrimaryImage VARCHAR(255),
    RegistrationDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- 3. Sports
CREATE TABLE Sports (
    SportID INT IDENTITY(1,1) PRIMARY KEY,
    SportName VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT,
    DefaultPlayerCount INT,
    Icon VARCHAR(255)
);

-- 4. Courts
CREATE TABLE Courts (
    CourtID INT IDENTITY(1,1) PRIMARY KEY,
    VenueID INT NOT NULL,
    SportID INT NOT NULL,
    CourtName VARCHAR(50) NOT NULL,
    BasePricePerHour DECIMAL(10,2) NOT NULL,
    PeakPricePerHour DECIMAL(10,2),
    PeakStartTime TIME,
    PeakEndTime TIME,
    PeakDays VARCHAR(50),
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Maintenance', 'Closed')),
    RegistrationDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID) ON DELETE CASCADE,
    FOREIGN KEY (SportID) REFERENCES Sports(SportID),
    CONSTRAINT UQ_Courts_Venue_CourtName UNIQUE (VenueID, CourtName)
);

-- 5. Slots
CREATE TABLE Slots (
    SlotID INT IDENTITY(1,1) PRIMARY KEY,
    CourtID INT NOT NULL,
    SlotDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    IsPeak BIT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'Booked', 'Blocked')),

    FOREIGN KEY (CourtID) REFERENCES Courts(CourtID) ON DELETE CASCADE,
    CONSTRAINT UQ_Slots_Court_Date_Time UNIQUE (CourtID, SlotDate, StartTime),
    CONSTRAINT CHK_Slots_StartEnd CHECK (StartTime < EndTime),
    CONSTRAINT CHK_Slots_Duration CHECK (DATEDIFF(HOUR, StartTime, EndTime) = 1)
);

-- 6. PromoCodes
CREATE TABLE PromoCodes (
    PromoCodeID INT IDENTITY(1,1) PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT,
    DiscountType VARCHAR(20) NOT NULL CHECK (DiscountType IN ('Percentage', 'Fixed')),
    DiscountValue DECIMAL(10,2) NOT NULL,
    ApplicableToAllCourts BIT DEFAULT 0,
    CourtIDs TEXT,
    ValidFrom DATETIME NOT NULL,
    ValidTo DATETIME NOT NULL,
    UsedCount INT DEFAULT 0,
    MinBookingAmount DECIMAL(10,2) DEFAULT 0,
    IsActive BIT DEFAULT 1,
    RegistrationDate DATETIME DEFAULT GETDATE(),
);

-- 7. Bookings
CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    VenueID INT NOT NULL,
    CourtID INT NOT NULL,
    BookingDate DATE NOT NULL,
    TotalHours INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Confirmed' CHECK (Status IN ('Confirmed', 'Cancelled', 'Completed')),
    PaymentStatus VARCHAR(20) DEFAULT 'Pending' CHECK (PaymentStatus IN ('Pending', 'Paid', 'Refunded')),
    PromoCodeID INT,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID),
    FOREIGN KEY (CourtID) REFERENCES Courts(CourtID),
    FOREIGN KEY (PromoCodeID) REFERENCES PromoCodes(PromoCodeID)
);

-- 8. Booking_Slots
CREATE TABLE Booking_Slots (
    BookingSlotID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT NOT NULL,
    SlotID INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON DELETE CASCADE,
    FOREIGN KEY (SlotID) REFERENCES Slots(SlotID) ON DELETE NO ACTION,
    CONSTRAINT UQ_BookingSlots_Booking_Slot UNIQUE (BookingID, SlotID),
    CONSTRAINT UQ_BookingSlots_Slot UNIQUE (SlotID)
);

-- 9. Payments
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL CHECK (PaymentMethod IN ('credit_card', 'debit_card', 'jazzcash','easy_paisa', 'cash')),
    TransactionID VARCHAR(255),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('success', 'failed', 'refunded', 'pending')),
    PaymentDate DATETIME DEFAULT GETDATE(),
    RefundAmount DECIMAL(10,2) DEFAULT 0,
    RefundDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON DELETE CASCADE
);

-- 10. Reviews
CREATE TABLE Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    BookingID INT NOT NULL UNIQUE,
    UserID INT NOT NULL,
    CourtID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    ReviewDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CourtID) REFERENCES Courts(CourtID)
);

-- 11. Membership_Plans
CREATE TABLE Membership_Plans (
    PlanID INT IDENTITY(1,1) PRIMARY KEY,
    PlanName VARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    DurationMonths INT NOT NULL,
    Benefits TEXT,
    DiscountPercentage DECIMAL(5,2) DEFAULT 0,
    PriorityAccess BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreationDate DATETIME DEFAULT GETDATE()
);

-- 12. User_Memberships
CREATE TABLE User_Memberships (
    UserMembershipID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    PlanID INT NOT NULL,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Expired', 'Cancelled')),
    RegistrationDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PlanID) REFERENCES Membership_Plans(PlanID)
);

-- 13. Complaints
CREATE TABLE Complaints (
    ComplaintID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    BookingID INT,
    Subject VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Open' CHECK (Status IN ('Open', 'In-Progress', 'Resolved', 'Closed')),
    Resolution TEXT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME,
    ResolvedBy INT,

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE NO ACTION,
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) ON DELETE SET NULL,
    FOREIGN KEY (ResolvedBy) REFERENCES Users(UserID)
);


--INSERTING DUMMY DATA INTO ALL TABLES
--Users

INSERT INTO Users (Email, CNIC, Password, FullName, PhoneNumber, Role, ProfileImage, RegistrationDate)
VALUES 
-- 1. System Admin
('admin@maidan.com', '11111-1111111-1', 'AdminPass123!', 'System Administrator', '03001234567', 'Admin', 'https://maidan.com/images/admin.jpg', '2023-01-01 08:00:00'),

-- 2. Venue Owners (Need distinct owners for different venues)
('owner1@maidan.com', '22222-2222222-2', 'OwnerPass123!', 'Ali Khan Sports', '03011234567', 'Owner', 'https://maidan.com/images/owner1.jpg', '2023-02-15 10:30:00'),
('owner2@maidan.com', '33333-3333333-3', 'OwnerPass123!', 'Usman Stadiums Ltd', '03021234567', 'Owner', NULL, '2023-03-10 09:15:00'),
('owner3@maidan.com', '44444-4444444-4', 'OwnerPass123!', 'Ahmed Courts', NULL, 'Owner', 'https://maidan.com/images/owner3.jpg', DEFAULT),

-- 3. Players (Various scenarios: some with phone, some without, different registration times)
('player1@maidan.com', '55555-5555555-5', 'PlayerPass123!', 'Hamza Ali', '03031234567', 'Player', 'https://maidan.com/images/player1.jpg', DEFAULT),
('player2@maidan.com', '66666-6666666-6', 'PlayerPass123!', 'Saad Bin', '03041234567', 'Player', NULL, DEFAULT),
('player3@maidan.com', '77777-7777777-7', 'PlayerPass123!', 'Fahad Mustafa', NULL, 'Player', NULL, DEFAULT),
('player4@maidan.com', '88888-8888888-8', 'PlayerPass123!', 'Zainab Ahmed', '03051234567', 'Player', 'https://maidan.com/images/player4.jpg', '2023-06-20 14:00:00'),
('player5@maidan.com', '99999-9999999-9', 'PlayerPass123!', 'Kashif Mahmood', '03061234567', 'Player', NULL, '2023-07-05 11:20:00'),
('player6@maidan.com', '10101-1010101-0', 'PlayerPass123!', 'Sara Yousaf', NULL, 'Player', 'https://maidan.com/images/player6.jpg', DEFAULT);


--Venues


INSERT INTO Venues (OwnerID, Name, Description, Location, City, ContactNumber, Status, PrimaryImage, RegistrationDate)
VALUES 
-- 1. Indoor Cricket Venue (Owner: Ali Khan Sports - UserID 2)
(2, 'Indoor Cricket Arena', 'Professional artificial turf cricket nets and match grounds under covered shelter.', 'Plot 45, Street 10, DHA Phase 6', 'Karachi', '021-111-222-333', 'Active', 'https://maidan.com/venues/indoor-cricket-arena.jpg', '2023-02-20 09:00:00'),

-- 2. Indoor Padel Venue (Owner: Ali Khan Sports - UserID 2)
(2, 'Indoor Padel Club', 'Climate-controlled indoor padel courts with professional lighting.', 'Sea View Road, Near Boat Basin', 'Karachi', '021-111-222-334', 'Active', 'https://maidan.com/venues/indoor-padel-club.jpg', '2023-05-15 11:30:00'),

-- 3. Indoor Futsal Venue (Owner: Usman Stadiums Ltd - UserID 3)
(3, 'Indoor Futsal Stadium', 'FIFA standard indoor futsal courts with spectator seating.', 'Main Boulevard, Gulberg III', 'Lahore', '042-111-555-666', 'Active', 'https://maidan.com/venues/indoor-futsal-stadium.jpg', '2023-03-12 10:00:00'),

-- 4. Indoor Multi-Sport Complex (Owner: Usman Stadiums Ltd - UserID 3)
(3, 'Indoor Sports Complex', 'Multi-purpose indoor facility supporting cricket nets and futsal.', 'Block F, Model Town', 'Lahore', '042-111-555-667', 'Active', 'https://maidan.com/venues/indoor-sports-complex.jpg', '2023-01-05 08:45:00'),

-- 5. City Indoor Arena (Owner: Ahmed Courts - UserID 4)
(4, 'City Indoor Arena', 'Premium indoor facility for padel and futsal enthusiasts.', 'Blue Area, Near Centaurus', 'Islamabad', '051-111-777-888', 'Active', 'https://maidan.com/venues/city-indoor-arena.jpg', DEFAULT),

-- 6. Indoor Cricket Hub (Owner: Ahmed Courts - UserID 4)
(4, 'Indoor Cricket Hub', 'Dedicated indoor cricket training and match venue.', 'F-10 Markaz', 'Islamabad', '051-111-777-889', 'Active', 'https://maidan.com/venues/indoor-cricket-hub.jpg', '2023-06-01 14:20:00'),

-- 7. Indoor Games Zone (Owner: Ali Khan Sports - UserID 2)
(2, 'Indoor Games Zone', 'Budget-friendly indoor venue for casual futsal and cricket.', 'Main GT Road', 'Rawalpindi', '051-111-999-000', 'Inactive', NULL, '2023-07-10 16:00:00');




--Sports

INSERT INTO Sports (SportName, Description, DefaultPlayerCount, Icon)
VALUES 
-- 1. Padel (Complete Data)
('Padel', 'Fast-growing racket sport played on an enclosed court smaller than a tennis court.', 4, 'https://maidan.com/icons/padel.png'),

-- 2. Turf Cricket (NULL Icon to test image handling)
('Turf Cricket', 'Cricket played on artificial turf surfaces, typically shorter formats like 6-a-side or 8-a-side.', 8, NULL),

-- 3. Futsal (NULL DefaultPlayerCount to test flexibility as rules may vary)
('Futsal', 'High-intensity indoor football played on a hard court with a smaller ball.', NULL, 'https://maidan.com/icons/futsal.png');





--Courts


INSERT INTO Courts (VenueID, SportID, CourtName, BasePricePerHour, PeakPricePerHour, PeakStartTime, PeakEndTime, PeakDays, Status, RegistrationDate)
VALUES 
-- Venue 1 (Indoor Cricket Arena) - Cricket Only
(1, 2, 'Cricket Turf 1', 1500.00, 2000.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),
(1, 2, 'Cricket Turf 2', 1500.00, 2000.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),
(1, 2, 'Cricket Practice Net 1', 800.00, NULL, NULL, NULL, NULL, 'Active', DEFAULT),

-- Venue 2 (Indoor Padel Club) - Padel Only
(2, 1, 'Padel Court 1', 2000.00, 2800.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),
(2, 1, 'Padel Court 2', 2000.00, 2800.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),
(2, 1, 'Padel Court 3', 2000.00, 2800.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Maintenance', DEFAULT),

-- Venue 3 (Indoor Futsal Stadium) - Futsal Only
(3, 3, 'Futsal Court A', 1400.00, 1800.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),
(3, 3, 'Futsal Court B', 1400.00, 1800.00, '18:00', '22:00', 'Friday,Saturday,Sunday', 'Active', DEFAULT),

-- Venue 4 (Indoor Sports Complex) - Mixed (Cricket + Futsal)
(4, 2, 'Cricket Turf A', 1300.00, 1700.00, '17:00', '21:00', 'Saturday,Sunday', 'Active', DEFAULT),
(4, 3, 'Futsal Court 1', 1300.00, 1700.00, '17:00', '21:00', 'Saturday,Sunday', 'Active', DEFAULT),

-- Venue 5 (City Indoor Arena) - Mixed (Padel + Futsal)
(5, 1, 'Padel Arena 1', 1900.00, 2500.00, '17:00', '21:00', 'Saturday,Sunday', 'Active', DEFAULT),
(5, 3, 'Futsal Ground 1', 1300.00, 1700.00, '18:00', '22:00', 'Friday,Saturday', 'Active', DEFAULT),

-- Venue 6 (Indoor Cricket Hub) - Cricket Only
(6, 2, 'Cricket Turf X', 1000.00, 1400.00, '19:00', '23:00', 'Friday,Saturday', 'Active', DEFAULT),
(6, 2, 'Cricket Turf Y', 1000.00, 1400.00, '19:00', '23:00', 'Friday,Saturday', 'Closed', DEFAULT),

-- Venue 7 (Indoor Games Zone) - Futsal Only (Inactive Venue)
(7, 3, 'Futsal Court Z', 900.00, NULL, NULL, NULL, NULL, 'Closed', DEFAULT);





INSERT INTO Slots (CourtID, SlotDate, StartTime, EndTime, Price, IsPeak, Status)
VALUES 
-- ===================================================================
-- VENUE 1: Indoor Cricket Arena (Courts 1, 2, 3)
-- Sport: Turf Cricket | Base: 1500 | Peak: 2000 (18:00-22:00)
-- ===================================================================
-- Court 1: Cricket Turf 1
(1, '2024-06-01', '08:00', '09:00', 1500.00, 0, 'Available'),
(1, '2024-06-01', '09:00', '10:00', 1500.00, 0, 'Available'),
(1, '2024-06-01', '10:00', '11:00', 1500.00, 0, 'Blocked'),   -- Maintenance
(1, '2024-06-01', '11:00', '12:00', 1500.00, 0, 'Available'),
(1, '2024-06-01', '18:00', '19:00', 2000.00, 1, 'Booked'),    -- Peak Booked
(1, '2024-06-01', '19:00', '20:00', 2000.00, 1, 'Booked'),    -- Peak Booked
(1, '2024-06-01', '20:00', '21:00', 2000.00, 1, 'Available'),
(1, '2024-06-02', '08:00', '09:00', 1500.00, 0, 'Available'),
(1, '2024-06-02', '18:00', '19:00', 2000.00, 1, 'Available'),
(1, '2024-06-03', '09:00', '10:00', 1500.00, 0, 'Available'),

-- Court 2: Cricket Turf 2
(2, '2024-06-01', '08:00', '09:00', 1500.00, 0, 'Available'),
(2, '2024-06-01', '18:00', '19:00', 2000.00, 1, 'Available'),
(2, '2024-06-01', '19:00', '20:00', 2000.00, 1, 'Available'),
(2, '2024-06-02', '10:00', '11:00', 1500.00, 0, 'Blocked'),   -- Reserved
(2, '2024-06-02', '18:00', '19:00', 2000.00, 1, 'Booked'),
(2, '2024-06-03', '18:00', '19:00', 2000.00, 1, 'Available'),

-- Court 3: Cricket Practice Net 1 (No Peak Pricing)
(3, '2024-06-01', '08:00', '09:00', 800.00, 0, 'Available'),
(3, '2024-06-01', '09:00', '10:00', 800.00, 0, 'Available'),
(3, '2024-06-01', '10:00', '11:00', 800.00, 0, 'Available'),
(3, '2024-06-02', '08:00', '09:00', 800.00, 0, 'Available'),
(3, '2024-06-03', '09:00', '10:00', 800.00, 0, 'Available'),

-- ===================================================================
-- VENUE 2: Indoor Padel Club (Courts 4, 5, 6)
-- Sport: Padel | Base: 2000 | Peak: 2800 (18:00-22:00)
-- ===================================================================
-- Court 4: Padel Court 1
(4, '2024-06-01', '09:00', '10:00', 2000.00, 0, 'Available'),
(4, '2024-06-01', '10:00', '11:00', 2000.00, 0, 'Available'),
(4, '2024-06-01', '18:00', '19:00', 2800.00, 1, 'Booked'),    -- Prime Time
(4, '2024-06-01', '19:00', '20:00', 2800.00, 1, 'Booked'),    -- Prime Time
(4, '2024-06-01', '20:00', '21:00', 2800.00, 1, 'Available'),
(4, '2024-06-02', '10:00', '11:00', 2000.00, 0, 'Available'),
(4, '2024-06-02', '18:00', '19:00', 2800.00, 1, 'Available'),
(4, '2024-06-03', '09:00', '10:00', 2000.00, 0, 'Available'),

-- Court 5: Padel Court 2
(5, '2024-06-01', '09:00', '10:00', 2000.00, 0, 'Available'),
(5, '2024-06-01', '18:00', '19:00', 2800.00, 1, 'Available'),
(5, '2024-06-01', '19:00', '20:00', 2800.00, 1, 'Available'),
(5, '2024-06-02', '18:00', '19:00', 2800.00, 1, 'Blocked'),   -- Tournament
(5, '2024-06-02', '19:00', '20:00', 2800.00, 1, 'Blocked'),   -- Tournament
(5, '2024-06-03', '18:00', '19:00', 2800.00, 1, 'Available'),

-- Court 6: Padel Court 3 (Maintenance Status in Courts Table)
(6, '2024-06-01', '09:00', '10:00', 2000.00, 0, 'Blocked'),   -- Court Maint.
(6, '2024-06-02', '09:00', '10:00', 2000.00, 0, 'Blocked'),
(6, '2024-06-03', '09:00', '10:00', 2000.00, 0, 'Blocked'),

-- ===================================================================
-- VENUE 3: Indoor Futsal Stadium (Courts 7, 8)
-- Sport: Futsal | Base: 1400 | Peak: 1800 (18:00-22:00)
-- ===================================================================
-- Court 7: Futsal Court A
(7, '2024-06-01', '08:00', '09:00', 1400.00, 0, 'Available'),
(7, '2024-06-01', '09:00', '10:00', 1400.00, 0, 'Available'),
(7, '2024-06-01', '18:00', '19:00', 1800.00, 1, 'Available'),
(7, '2024-06-01', '19:00', '20:00', 1800.00, 1, 'Blocked'),   -- Event
(7, '2024-06-01', '20:00', '21:00', 1800.00, 1, 'Available'),
(7, '2024-06-02', '09:00', '10:00', 1400.00, 0, 'Available'),
(7, '2024-06-02', '18:00', '19:00', 1800.00, 1, 'Booked'),
(7, '2024-06-03', '10:00', '11:00', 1400.00, 0, 'Available'),

-- Court 8: Futsal Court B
(8, '2024-06-01', '08:00', '09:00', 1400.00, 0, 'Available'),
(8, '2024-06-01', '18:00', '19:00', 1800.00, 1, 'Available'),
(8, '2024-06-01', '19:00', '20:00', 1800.00, 1, 'Available'),
(8, '2024-06-02', '18:00', '19:00', 1800.00, 1, 'Available'),
(8, '2024-06-03', '18:00', '19:00', 1800.00, 1, 'Available'),

-- ===================================================================
-- VENUE 4: Indoor Sports Complex (Courts 9, 10)
-- Court 9: Cricket | Court 10: Futsal
-- ===================================================================
-- Court 9: Cricket Turf A (Base: 1300 | Peak: 1700)
(9, '2024-06-01', '10:00', '11:00', 1300.00, 0, 'Available'),
(9, '2024-06-01', '17:00', '18:00', 1700.00, 1, 'Available'),
(9, '2024-06-01', '18:00', '19:00', 1700.00, 1, 'Booked'),
(9, '2024-06-02', '10:00', '11:00', 1300.00, 0, 'Available'),
(9, '2024-06-03', '17:00', '18:00', 1700.00, 1, 'Available'),

-- Court 10: Futsal Court 1 (Base: 1300 | Peak: 1700)
(10, '2024-06-01', '10:00', '11:00', 1300.00, 0, 'Available'),
(10, '2024-06-01', '17:00', '18:00', 1700.00, 1, 'Available'),
(10, '2024-06-01', '18:00', '19:00', 1700.00, 1, 'Available'),
(10, '2024-06-02', '18:00', '19:00', 1700.00, 1, 'Blocked'),
(10, '2024-06-03', '10:00', '11:00', 1300.00, 0, 'Available'),

-- ===================================================================
-- VENUE 5: City Indoor Arena (Courts 11, 12)
-- Court 11: Padel | Court 12: Futsal
-- ===================================================================
-- Court 11: Padel Arena 1 (Base: 1900 | Peak: 2500)
(11, '2024-06-01', '09:00', '10:00', 1900.00, 0, 'Available'),
(11, '2024-06-01', '17:00', '18:00', 2500.00, 1, 'Available'),
(11, '2024-06-01', '18:00', '19:00', 2500.00, 1, 'Booked'),
(11, '2024-06-02', '09:00', '10:00', 1900.00, 0, 'Available'),
(11, '2024-06-03', '18:00', '19:00', 2500.00, 1, 'Available'),

-- Court 12: Futsal Ground 1 (Base: 1300 | Peak: 1700)
(12, '2024-06-01', '09:00', '10:00', 1300.00, 0, 'Available'),
(12, '2024-06-01', '18:00', '19:00', 1700.00, 1, 'Available'),
(12, '2024-06-01', '19:00', '20:00', 1700.00, 1, 'Available'),
(12, '2024-06-02', '18:00', '19:00', 1700.00, 1, 'Available'),
(12, '2024-06-03', '09:00', '10:00', 1300.00, 0, 'Available'),

-- ===================================================================
-- VENUE 6: Indoor Cricket Hub (Courts 13, 14)
-- Sport: Cricket | Base: 1000 | Peak: 1400 (19:00-23:00)
-- ===================================================================
-- Court 13: Cricket Turf X
(13, '2024-06-01', '10:00', '11:00', 1000.00, 0, 'Available'),
(13, '2024-06-01', '19:00', '20:00', 1400.00, 1, 'Available'),
(13, '2024-06-01', '20:00', '21:00', 1400.00, 1, 'Available'),
(13, '2024-06-02', '10:00', '11:00', 1000.00, 0, 'Available'),
(13, '2024-06-03', '19:00', '20:00', 1400.00, 1, 'Booked'),

-- Court 14: Cricket Turf Y (Closed Status in Courts Table)
(14, '2024-06-01', '10:00', '11:00', 1000.00, 0, 'Blocked'),
(14, '2024-06-02', '10:00', '11:00', 1000.00, 0, 'Blocked'),
(14, '2024-06-03', '10:00', '11:00', 1000.00, 0, 'Blocked'),

-- ===================================================================
-- VENUE 7: Indoor Games Zone (Court 15)
-- Sport: Futsal | Base: 900 | No Peak | Venue Inactive
-- ===================================================================
-- Court 15: Futsal Court Z
(15, '2024-06-01', '09:00', '10:00', 900.00, 0, 'Blocked'),    -- Venue Inactive
(15, '2024-06-02', '09:00', '10:00', 900.00, 0, 'Blocked'),
(15, '2024-06-03', '09:00', '10:00', 900.00, 0, 'Blocked');







INSERT INTO PromoCodes (Code, Description, DiscountType, DiscountValue, ApplicableToAllCourts, CourtIDs, ValidFrom, ValidTo, UsedCount, MinBookingAmount, IsActive)
VALUES 
-- 1. Percentage Discount, All Courts, Active (Welcome Offer)
('WELCOME20', 'New user welcome discount - 20% off on first booking', 'Percentage', 20.00, 1, NULL, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 150, 0.00, 1),

-- 2. Fixed Discount, All Courts, Active (Ramadan Special)
('RAMADAN500', 'Ramadan special - Rs. 500 off on any booking', 'Fixed', 500.00, 1, NULL, '2024-03-01 00:00:00', '2024-04-15 23:59:59', 89, 1000.00, 1),

-- 3. Percentage Discount, Specific Courts (Padel Only), Active
('PADEL15', '15% off on Padel courts only', 'Percentage', 15.00, 0, '4,5,6,11', '2024-05-01 00:00:00', '2024-08-31 23:59:59', 45, 500.00, 1),

-- 4. Fixed Discount, Specific Courts (Cricket Only), Active
('CRICKET300', 'Rs. 300 off on Cricket turf bookings', 'Fixed', 300.00, 0, '1,2,3,9,13,14', '2024-06-01 00:00:00', '2024-09-30 23:59:59', 67, 800.00, 1),

-- 5. Percentage Discount, Specific Courts (Futsal Only), Active
('FUTSAL10', '10% off on Futsal court bookings', 'Percentage', 10.00, 0, '7,8,10,12,15', '2024-05-15 00:00:00', '2024-07-31 23:59:59', 32, 600.00, 1),

-- 6. Fixed Discount, All Courts, High Minimum Amount (VIP)
('VIP1000', 'VIP members - Rs. 1000 off on bookings above Rs. 3000', 'Fixed', 1000.00, 1, NULL, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 23, 3000.00, 1),

-- 7. Percentage Discount, All Courts, Expired (Past Validity)
('NEWYEAR25', 'New Year Special - 25% off (Expired)', 'Percentage', 25.00, 1, NULL, '2023-12-20 00:00:00', '2024-01-05 23:59:59', 210, 0.00, 1),

-- 8. Fixed Discount, Specific Courts, Inactive (Disabled by Admin)
('SUMMER400', 'Summer discount - Rs. 400 off (Deactivated)', 'Fixed', 400.00, 0, '1,2,7,8', '2024-06-01 00:00:00', '2024-08-31 23:59:59', 15, 500.00, 0),

-- 9. Percentage Discount, All Courts, Heavily Used (Popular)
('FLASH30', 'Flash sale - 30% off (Limited time)', 'Percentage', 30.00, 1, NULL, '2024-06-01 00:00:00', '2024-06-10 23:59:59', 500, 1000.00, 1),

-- 10. Fixed Discount, Specific Courts (Venue 1 & 2 Only), Active
('DEFENCE200', 'Rs. 200 off at Defence venues only', 'Fixed', 200.00, 0, '1,2,4,5,6', '2024-05-01 00:00:00', '2024-12-31 23:59:59', 78, 400.00, 1),

-- 11. Percentage Discount, All Courts, Zero Used Count (New Code)
('LAUNCH50', 'Platform launch celebration - 50% off', 'Percentage', 50.00, 1, NULL, '2024-06-01 00:00:00', '2024-06-05 23:59:59', 0, 2000.00, 1),

-- 12. Fixed Discount, Specific Courts, Expired + Inactive
('OLDPROMO100', 'Old promotional code - Rs. 100 off', 'Fixed', 100.00, 0, '3,9,10', '2023-10-01 00:00:00', '2023-12-31 23:59:59', 340, 200.00, 0);








INSERT INTO Bookings (UserID, VenueID, CourtID, BookingDate, TotalHours, TotalAmount, Status, PaymentStatus, PromoCodeID, DiscountAmount)
VALUES 

-- BOOKING 1-5: Confirmed & Paid Bookings (Normal Flow)
-------
-- Booking 1: Player 1, Cricket, Venue 1, Peak Hours, With Promo
(5, 1, 1, '2024-06-01', 2, 4000.00, 'Confirmed', 'Paid', 1, 800.00),

-- Booking 2: Player 2, Padel, Venue 2, Peak Hours, No Promo
(6, 2, 4, '2024-06-01', 1, 2800.00, 'Confirmed', 'Paid', NULL, 0.00),

-- Booking 3: Player 3, Futsal, Venue 3, Non-Peak, With Promo
(7, 3, 7, '2024-06-01', 2, 2800.00, 'Confirmed', 'Paid', 5, 280.00),

-- Booking 4: Player 4, Cricket, Venue 4, Mixed Hours, No Promo
(8, 4, 9, '2024-06-02', 3, 4300.00, 'Confirmed', 'Paid', NULL, 0.00),

-- Booking 5: Player 5, Padel, Venue 5, Peak Hours, With VIP Promo
(9, 5, 11, '2024-06-02', 2, 5000.00, 'Confirmed', 'Paid', 6, 1000.00),

-- BOOKING 6-10: Completed Bookings (Past Events with Reviews)
-----
-- Booking 6: Player 1, Cricket, Venue 1, Completed
(5, 1, 2, '2024-05-25', 2, 3000.00, 'Completed', 'Paid', NULL, 0.00),

-- Booking 7: Player 2, Futsal, Venue 3, Completed, With Promo
(6, 3, 8, '2024-05-26', 1, 1400.00, 'Completed', 'Paid', 2, 500.00),

-- Booking 8: Player 3, Padel, Venue 2, Completed
(7, 2, 5, '2024-05-27', 2, 4000.00, 'Completed', 'Paid', NULL, 0.00),

-- Booking 9: Player 4, Cricket, Venue 6, Completed, With Promo
(8, 6, 13, '2024-05-28', 3, 4200.00, 'Completed', 'Paid', 4, 300.00),

-- Booking 10: Player 5, Futsal, Venue 4, Completed
(9, 4, 10, '2024-05-29', 2, 2600.00, 'Completed', 'Paid', NULL, 0.00),

-- BOOKING 11-15: Cancelled Bookings (Refund Scenarios)
-- ----
-- Booking 11: Player 6, Cricket, Venue 1, Cancelled, Refunded
(10, 1, 3, '2024-06-03', 1, 800.00, 'Cancelled', 'Refunded', NULL, 0.00),

-- Booking 12: Player 1, Padel, Venue 2, Cancelled, Refunded, With Promo
(5, 2, 6, '2024-06-03', 2, 4000.00, 'Cancelled', 'Refunded', 3, 600.00),

-- Booking 13: Player 2, Futsal, Venue 7, Cancelled, Pending Refund
(6, 7, 15, '2024-06-03', 1, 900.00, 'Cancelled', 'Pending', NULL, 0.00),

-- Booking 14: Player 3, Cricket, Venue 4, Cancelled, Refunded
(7, 4, 9, '2024-06-02', 2, 3400.00, 'Cancelled', 'Refunded', 10, 200.00),

-- Booking 15: Player 4, Padel, Venue 5, Cancelled, Refunded
(8, 5, 12, '2024-06-01', 1, 1700.00, 'Cancelled', 'Refunded', NULL, 0.00),


-- BOOKING 16-20: Confirmed but Payment Pending
-------
-- Booking 16: Player 5, Cricket, Venue 6, Payment Pending
(9, 6, 14, '2024-06-03', 2, 2800.00, 'Confirmed', 'Pending', NULL, 0.00),

-- Booking 17: Player 6, Futsal, Venue 3, Payment Pending, With Promo
(10, 3, 7, '2024-06-03', 1, 1800.00, 'Confirmed', 'Pending', 5, 180.00),

-- Booking 18: Player 1, Padel, Venue 2, Payment Pending
(5, 2, 4, '2024-06-02', 1, 2800.00, 'Confirmed', 'Pending', NULL, 0.00),

-- Booking 19: Player 2, Cricket, Venue 1, Payment Pending, With Promo
(6, 1, 1, '2024-06-02', 3, 6000.00, 'Confirmed', 'Pending', 1, 1200.00),

-- Booking 20: Player 3, Futsal, Venue 4, Payment Pending
(7, 4, 10, '2024-06-03', 2, 3400.00, 'Confirmed', 'Pending', NULL, 0.00),


-- BOOKING 21-25: Multi-Hour Bookings (Different Venues)
----------
-- Booking 21: Player 4, Cricket, Venue 1, 4 Hours
(8, 1, 2, '2024-06-03', 4, 8000.00, 'Confirmed', 'Paid', 9, 2400.00),

-- Booking 22: Player 5, Padel, Venue 5, 3 Hours
(9, 5, 11, '2024-06-03', 3, 7500.00, 'Confirmed', 'Paid', NULL, 0.00),

-- Booking 23: Player 6, Futsal, Venue 3, 2 Hours
(10, 3, 8, '2024-06-03', 2, 3600.00, 'Confirmed', 'Paid', 2, 500.00),

-- Booking 24: Owner 1 (User 2), Cricket, Own Venue, 2 Hours
(2, 1, 3, '2024-06-02', 2, 1600.00, 'Confirmed', 'Paid', NULL, 0.00),

-- Booking 25: Owner 2 (User 3), Futsal, Own Venue, 1 Hour
(3, 3, 7, '2024-06-02', 1, 1800.00, 'Confirmed', 'Paid', NULL, 0.00);






INSERT INTO Booking_Slots (BookingID, SlotID, Price)
VALUES 
-- BOOKING 1: 2 Hours (Cricket, Venue 1, Peak) - SlotID 5, 6
(1, 5, 2000.00),
(1, 6, 2000.00),

-- BOOKING 2: 1 Hour (Padel, Venue 2, Peak) - SlotID 13
(2, 13, 2800.00),

-- BOOKING 3: 2 Hours (Futsal, Venue 3, Non-Peak) - SlotID 19, 20
(3, 19, 1400.00),
(3, 20, 1400.00),

-- BOOKING 4: 3 Hours (Cricket, Venue 4, Mixed) - SlotID 31, 32, 33
(4, 31, 1300.00),
(4, 32, 1700.00),
(4, 33, 1700.00),

-- BOOKING 5: 2 Hours (Padel, Venue 5, Peak) - SlotID 43, 44
(5, 43, 2500.00),
(5, 44, 2500.00),

-- BOOKING 6: 2 Hours (Cricket, Venue 1, Completed) - SlotID 1, 2
(6, 1, 1500.00),
(6, 2, 1500.00),

-- BOOKING 7: 1 Hour (Futsal, Venue 3, Completed) - SlotID 21
(7, 21, 1400.00),

-- BOOKING 8: 2 Hours (Padel, Venue 2, Completed) - SlotID 14, 15
(8, 14, 2000.00),
(8, 15, 2000.00),

-- BOOKING 9: 3 Hours (Cricket, Venue 6, Completed) - SlotID 53, 54, 55
(9, 53, 1000.00),
(9, 54, 1400.00),
(9, 55, 1400.00),

-- BOOKING 10: 2 Hours (Futsal, Venue 4, Completed) - SlotID 39, 40
(10, 39, 1300.00),
(10, 40, 1300.00),

-- BOOKING 11: 1 Hour (Cricket, Venue 1, Cancelled) - SlotID 3
(11, 3, 1500.00),

-- BOOKING 12: 2 Hours (Padel, Venue 2, Cancelled) - SlotID 16, 17
(12, 16, 2000.00),
(12, 17, 2000.00),

-- BOOKING 13: 1 Hour (Futsal, Venue 7, Cancelled) - SlotID 61
(13, 61, 900.00),

-- BOOKING 14: 2 Hours (Cricket, Venue 4, Cancelled) - SlotID 34, 35
(14, 34, 1300.00),
(14, 35, 1700.00),

-- BOOKING 15: 1 Hour (Futsal, Venue 5, Cancelled) - SlotID 45
(15, 45, 1300.00),

-- BOOKING 16: 2 Hours (Cricket, Venue 6, Payment Pending) - SlotID 56, 57
(16, 56, 1000.00),
(16, 57, 1400.00),

-- BOOKING 17: 1 Hour (Futsal, Venue 3, Payment Pending) - SlotID 22
(17, 22, 1800.00),

-- BOOKING 18: 1 Hour (Padel, Venue 2, Payment Pending) - SlotID 18
(18, 18, 2800.00),

-- BOOKING 19: 3 Hours (Cricket, Venue 1, Payment Pending) - SlotID 7, 8, 9
(19, 7, 1500.00),
(19, 8, 2000.00),
(19, 9, 2000.00),

-- BOOKING 20: 2 Hours (Futsal, Venue 4, Payment Pending) - SlotID 41, 42
(20, 41, 1300.00),
(20, 42, 1700.00);






INSERT INTO Payments (BookingID, Amount, PaymentMethod, TransactionID, Status, PaymentDate, RefundAmount, RefundDate)
VALUES 


-- SUCCESSFUL PAYMENTS (Paid Bookings)
-----
-- Payment 1: Booking 1 (Credit Card)
(1, 3200.00, 'credit_card', 'TXN_CC_001234', 'success', '2024-05-30 10:15:00', 0.00, NULL),

-- Payment 2: Booking 2 (Debit Card)
(2, 2800.00, 'debit_card', 'TXN_DC_001235', 'success', '2024-05-30 11:20:00', 0.00, NULL),

-- Payment 3: Booking 3 (JazzCash)
(3, 2520.00, 'jazzcash', 'TXN_JC_001236', 'success', '2024-05-30 12:30:00', 0.00, NULL),

-- Payment 4: Booking 4 (EasyPaisa)
(4, 4300.00, 'easy_paisa', 'TXN_EP_001237', 'success', '2024-05-31 09:00:00', 0.00, NULL),

-- Payment 5: Booking 5 (Credit Card - VIP)
(5, 4000.00, 'credit_card', 'TXN_CC_001238', 'success', '2024-05-31 10:45:00', 0.00, NULL),

-- Payment 6: Booking 6 (Cash - Completed)
(6, 3000.00, 'cash', 'TXN_CASH_001239', 'success', '2024-05-25 08:00:00', 0.00, NULL),

-- Payment 7: Booking 7 (JazzCash - Completed)
(7, 900.00, 'jazzcash', 'TXN_JC_001240', 'success', '2024-05-26 09:30:00', 0.00, NULL),

-- Payment 8: Booking 8 (Debit Card - Completed)
(8, 4000.00, 'debit_card', 'TXN_DC_001241', 'success', '2024-05-27 14:00:00', 0.00, NULL),

-- Payment 9: Booking 9 (EasyPaisa - Completed)
(9, 3900.00, 'easy_paisa', 'TXN_EP_001242', 'success', '2024-05-28 16:20:00', 0.00, NULL),

-- Payment 10: Booking 10 (Cash - Completed)
(10, 2600.00, 'cash', 'TXN_CASH_001243', 'success', '2024-05-29 11:00:00', 0.00, NULL),


-- REFUNDED PAYMENTS (Cancelled Bookings)
--------
-- Payment 11: Booking 11 (Refunded - Credit Card)
(11, 800.00, 'credit_card', 'TXN_CC_001244', 'refunded', '2024-06-01 10:00:00', 800.00, '2024-06-02 15:30:00'),

-- Payment 12: Booking 12 (Refunded - Debit Card)
(12, 3400.00, 'debit_card', 'TXN_DC_001245', 'refunded', '2024-06-01 11:00:00', 3400.00, '2024-06-02 16:00:00'),

-- Payment 13: Booking 13 (Refunded - JazzCash)
(13, 900.00, 'jazzcash', 'TXN_JC_001246', 'refunded', '2024-06-01 12:00:00', 900.00, '2024-06-03 10:00:00'),

-- Payment 14: Booking 14 (Refunded - EasyPaisa)
(14, 3200.00, 'easy_paisa', 'TXN_EP_001247', 'refunded', '2024-06-01 13:00:00', 3200.00, '2024-06-02 14:00:00'),

-- Payment 15: Booking 15 (Refunded - Credit Card)
(15, 1700.00, 'credit_card', 'TXN_CC_001248', 'refunded', '2024-06-01 14:00:00', 1700.00, '2024-06-02 17:00:00'),


-- PENDING PAYMENTS (Not Yet Paid)
-------
-- Payment 16: Booking 16 (Pending - JazzCash)
(16, 2800.00, 'jazzcash', 'TXN_JC_001249', 'pending', '2024-06-02 09:00:00', 0.00, NULL),

-- Payment 17: Booking 17 (Pending - EasyPaisa)
(17, 1620.00, 'easy_paisa', 'TXN_EP_001250', 'pending', '2024-06-02 10:00:00', 0.00, NULL),

-- Payment 18: Booking 18 (Pending - Credit Card)
(18, 2800.00, 'credit_card', 'TXN_CC_001251', 'pending', '2024-06-02 11:00:00', 0.00, NULL),

-- Payment 19: Booking 19 (Pending - Debit Card)
(19, 4800.00, 'debit_card', 'TXN_DC_001252', 'pending', '2024-06-02 12:00:00', 0.00, NULL),

-- Payment 20: Booking 20 (Pending - Cash)
(20, 3400.00, 'cash', 'TXN_CASH_001253', 'pending', '2024-06-02 13:00:00', 0.00, NULL);







INSERT INTO Reviews (BookingID, UserID, CourtID, Rating, Comment, ReviewDate)
VALUES 
-- Review 1: 5 Stars (Excellent)
(6, 5, 2, 5, 'Amazing turf quality! Will definitely book again.', '2024-05-26 10:00:00'),

-- Review 2: 4 Stars (Good)
(7, 6, 8, 4, 'Good futsal court, lighting could be better.', '2024-05-27 11:30:00'),

-- Review 3: 3 Stars (Average)
(8, 7, 5, 3, 'Average experience. Court was okay but staff was slow.', '2024-05-28 09:00:00'),

-- Review 4: 2 Stars (Below Average)
(9, 8, 13, 2, 'Court condition was not as expected. Disappointed.', '2024-05-29 14:00:00'),

-- Review 5: 1 Star (Poor)
(10, 9, 10, 1, 'Very poor experience. Court was dirty and booking was delayed.', '2024-05-30 16:00:00'),

-- Review 6: 5 Stars (No Comment)
(11, 5, 3, 5, NULL, '2024-06-02 12:00:00'),

-- Review 7: 4 Stars (Short Comment)
(12, 6, 6, 4, 'Nice venue.', '2024-06-03 10:00:00');








INSERT INTO Membership_Plans (PlanName, Price, DurationMonths, Benefits, DiscountPercentage, PriorityAccess, IsActive)
VALUES 
-- Plan 1: Basic (1 Month, No Priority)
('Basic Monthly', 999.00, 1, '5% discount on all bookings, Email support', 5.00, 0, 1),

-- Plan 2: Silver (3 Months, No Priority)
('Silver Quarterly', 2499.00, 3, '10% discount on all bookings, Priority email support', 10.00, 0, 1),

-- Plan 3: Gold (6 Months, Priority Access)
('Gold Semi-Annual', 4499.00, 6, '15% discount on all bookings, Priority booking access, Free cancellation', 15.00, 1, 1),

-- Plan 4: Platinum (12 Months, Priority Access)
('Platinum Annual', 7999.00, 12, '20% discount on all bookings, Priority booking access, Free cancellation, Dedicated support', 20.00, 1, 1),

-- Plan 5: Student (3 Months, Inactive)
('Student Special', 1499.00, 3, '8% discount on weekday bookings', 8.00, 0, 0);







INSERT INTO User_Memberships (UserID, PlanID, StartDate, EndDate, Status, RegistrationDate)
VALUES 
-- Membership 1: Active Gold Plan (User 5)
(5, 3, '2024-05-01 00:00:00', '2024-11-01 00:00:00', 'Active', '2024-04-28 10:00:00'),

-- Membership 2: Active Platinum Plan (User 6)
(6, 4, '2024-06-01 00:00:00', '2025-06-01 00:00:00', 'Active', '2024-05-30 11:00:00'),

-- Membership 3: Expired Silver Plan (User 7)
(7, 2, '2024-01-01 00:00:00', '2024-04-01 00:00:00', 'Expired', '2023-12-28 09:00:00'),

-- Membership 4: Active Basic Plan (User 8)
(8, 1, '2024-06-01 00:00:00', '2024-07-01 00:00:00', 'Active', '2024-05-31 14:00:00'),

-- Membership 5: Cancelled Gold Plan (User 9)
(9, 3, '2024-03-01 00:00:00', '2024-09-01 00:00:00', 'Cancelled', '2024-02-25 16:00:00'),

-- Membership 6: Expired Basic Plan (User 10)
(10, 1, '2024-02-01 00:00:00', '2024-03-01 00:00:00', 'Expired', '2024-01-28 12:00:00');









INSERT INTO Complaints (UserID, BookingID, Subject, Description, Status, Resolution, CreatedAt, ResolvedAt, ResolvedBy)
VALUES 
-- Complaint 1: Open, Linked to Booking
(5, 1, 'Court Condition Issue', 'The turf was uneven in certain areas.', 'Open', NULL, '2024-06-01 10:00:00', NULL, NULL),

-- Complaint 2: In-Progress, Linked to Booking
(6, 2, 'Lighting Problem', 'Lights were flickering during the match.', 'In-Progress', NULL, '2024-06-01 11:00:00', NULL, NULL),

-- Complaint 3: Resolved, Linked to Booking, Admin Resolved
(7, 3, 'Booking Time Conflict', 'Slot was double booked accidentally.', 'Resolved', 'Refunded full amount and apologized.', '2024-05-28 09:00:00', '2024-05-29 10:00:00', 1),

-- Complaint 4: Closed, General Complaint (No Booking), Admin Resolved
(8, NULL, 'App Crash Report', 'Application crashed during payment.', 'Closed', 'Fixed in latest update.', '2024-05-25 14:00:00', '2024-05-26 15:00:00', 1),

-- Complaint 5: Open, Linked to Booking
(9, 4, 'Staff Behavior', 'Staff was unprofessional at the venue.', 'Open', NULL, '2024-06-02 16:00:00', NULL, NULL),

-- Complaint 6: Resolved, Linked to Booking, Owner Resolved
(10, 5, 'Equipment Missing', 'Ball was missing from the court.', 'Resolved', 'Provided replacement ball immediately.', '2024-06-01 12:00:00', '2024-06-01 13:00:00', 2);



SELECT * FROM Users;
SELECT * FROM Venues;
SELECT * FROM Sports;
SELECT * FROM Courts;
SELECT * FROM Slots;
SELECT * FROM PromoCodes;
SELECT * FROM Bookings;
SELECT * FROM Booking_Slots;
SELECT * FROM Payments;
SELECT * FROM Reviews;
SELECT * FROM Membership_Plans;
SELECT * FROM User_Memberships;
SELECT * FROM Complaints;


-- Now Time for the queries
-- there are a total of 17 queries, hope these are enough for testing


--listing all the users with their roles
SELECT UserID, FullName, Email, Role, PhoneNumber
FROM Users
ORDER BY Role, FullName;

--searching for a user by email or cnic
SELECT * from Users
WHERE Email like '%Hamza%' OR CNIC LIKE '%55555%';

--search by Email
SELECT * FROM Users
WHERE Email LIKE '%player%';

--Update phone number using userID
UPDATE Users
SET PhoneNumber='+923234833496'
WHERE UserID=5;
SELECT * from Users where UserID=5;

--Showing all venues with owner name and city
SELECT V.VenueID,V.Name as VenueName,U.FullName as OwnerName, V.City
FROM Venues V
INNER JOIN Users U on V.OwnerID=U.UserID;

--Count venues per city
SELECT City, COUNT(*) AS VenueCount
From Venues
GROUP BY City;


--Listing Courts with venue name, sport name and price
SELECT C.CourtID,V.Name as Venue,S.SportName as Sport,
C.CourtName,C.BasePricePerHour,C.PeakPricePerHour
FROM Courts C
INNER JOIN Venues V on C.VenueID=V.VenueID
INNER JOIN Sports S ON C.SportID=S.SportID;

--filtering Courts by sport and price range
SELECT * FROM Courts
Where SportID=(SELECT SportID FROM Sports WHERE SportName='Padel')
AND BasePricePerHour BETWEEN 1500 AND 2500;

-- showing available slots for specific courts on a specific fate
SELECT SlotID, StartTime,EndTime,Price,IsPeak
FROM Slots
Where CourtID=1
AND SlotDate='2024-06-01'
AND Status='Available';

--listng active promo codes with user count
SELECT Code, Description, DiscountType, DiscountValue,
    ValidFrom, ValidTo, UsedCount, IsActive
FROM PromoCodes
WHERE IsActive = 1;

SELECT COUNT(*) FROM PromoCodes;

--incrementing usage count when promo is applied
UPDATE PromoCodes
SET UsedCount = UsedCount + 1
WHERE PromoCodeID = 1;  -- WELCOME20

-- opening complaints with user and booking info
SELECT c.ComplaintID, u.FullName AS UserName,
c.Subject, c.Description, c.Status, c.CreatedAt,b.BookingID
FROM Complaints c
LEFT JOIN Users u ON c.UserID = u.UserID
LEFT JOIN Bookings b ON c.BookingID = b.BookingID
WHERE c.Status IN ('Open', 'In-Progress');


-- finding total revenue by payment method
SELECT PaymentMethod, SUM(Amount) AS TotalRevenue
FROM Payments
WHERE Status = 'success'
GROUP BY PaymentMethod;

-- active members with plan details
SELECT um.UserMembershipID, u.FullName, mp.PlanName,
um.StartDate, um.EndDate, um.Status
FROM User_Memberships um
JOIN Users u ON um.UserID = u.UserID
JOIN Membership_Plans mp ON um.PlanID = mp.PlanID
WHERE um.Status = 'Active';

-- revenue by sports
SELECT s.SportName, SUM(p.Amount) AS Revenue
FROM Payments p
JOIN Bookings b ON p.BookingID = b.BookingID
JOIN Courts c ON b.CourtID = c.CourtID
JOIN Sports s ON c.SportID = s.SportID
WHERE p.Status = 'success'
GROUP BY s.SportName;

-- deleting a user (cascades to bookings, memberships, etc.)
DELETE FROM Complaints WHERE UserID = 10;

-- Then delete the user
DELETE FROM Users WHERE UserID = 10;




Use Maidan
ALTER TABLE Users
ADD DateOfBirth DATE NULL;


ALTER TABLE Venues
ADD LocationURL VARCHAR(255) NULL;


-- Fix Venues table
ALTER TABLE Venues ALTER COLUMN Description VARCHAR(MAX);

-- Fix Sports table  
ALTER TABLE Sports ALTER COLUMN Description VARCHAR(MAX);

-- Fix PromoCodes table
ALTER TABLE PromoCodes ALTER COLUMN Description VARCHAR(MAX);


UPDATE Sports 
SET Icon = 'https://cdn-icons-png.flaticon.com/512/3095/3095110.png' 
WHERE SportName = 'Futsal';

UPDATE Sports 
SET Icon = 'https://cdn-icons-png.flaticon.com/512/169/169805.png' 
WHERE SportName = 'Turf Cricket';

UPDATE Sports 
SET Icon = 'https://cdn-icons-png.flaticon.com/512/1502/1502990.png' 
WHERE SportName = 'Padel';


UPDATE Courts 
SET PeakStartTime = '18:00', 
    PeakEndTime = '22:00',
    PeakDays = 'Friday,Saturday,Sunday'
WHERE PeakStartTime IS NULL AND Status = 'Active';

UPDATE Courts 
SET PeakStartTime = NULL, 
    PeakEndTime = NULL,
    PeakDays = NULL
WHERE PeakStartTime IS NULL 
   OR PeakStartTime = '00:00:00'
   OR PeakStartTime = '1970-01-01'
   OR PeakStartTime = '1970-01-01 00:00:00';


-- Insert slots for CourtID 3 on 2027-01-02

INSERT INTO Slots (CourtID, SlotDate, StartTime, EndTime, Price, IsPeak, Status)
VALUES 
(3, '2027-01-02', '09:00', '10:00', 800, 0, 'Available'),
(3, '2027-01-02', '10:00', '11:00', 800, 0, 'Available'),
(3, '2027-01-02', '11:00', '12:00', 800, 0, 'Available'),
(3, '2027-01-02', '12:00', '13:00', 800, 0, 'Available'),
(3, '2027-01-02', '13:00', '14:00', 800, 0, 'Available'),
(3, '2027-01-02', '14:00', '15:00', 800, 0, 'Available'),
(3, '2027-01-02', '15:00', '16:00', 800, 0, 'Available'),
(3, '2027-01-02', '16:00', '17:00', 800, 0, 'Available'),
(3, '2027-01-02', '17:00', '18:00', 800, 0, 'Available'),
(3, '2027-01-02', '18:00', '19:00', 800, 0, 'Available'),
(3, '2027-01-02', '19:00', '20:00', 800, 0, 'Available'),
(3, '2027-01-02', '20:00', '21:00', 800, 0, 'Available');


-- Delete existing slots for court 3 on these dates to avoid duplicates
DELETE FROM Slots WHERE CourtID = 3 AND SlotDate = '2026-03-30';

-- Insert slots for CourtID 3 on March 30, 2026
INSERT INTO Slots (CourtID, SlotDate, StartTime, EndTime, Price, IsPeak, Status)
VALUES 
(3, '2026-03-30', '09:00', '10:00', 800, 0, 'Available'),
(3, '2026-03-30', '10:00', '11:00', 800, 0, 'Available'),
(3, '2026-03-30', '11:00', '12:00', 800, 0, 'Available'),
(3, '2026-03-30', '12:00', '13:00', 800, 0, 'Available'),
(3, '2026-03-30', '13:00', '14:00', 800, 0, 'Available'),
(3, '2026-03-30', '14:00', '15:00', 800, 0, 'Available'),
(3, '2026-03-30', '15:00', '16:00', 800, 0, 'Available'),
(3, '2026-03-30', '16:00', '17:00', 800, 0, 'Available'),
(3, '2026-03-30', '17:00', '18:00', 800, 0, 'Available'),
(3, '2026-03-30', '18:00', '19:00', 800, 0, 'Available'),
(3, '2026-03-30', '19:00', '20:00', 800, 0, 'Available'),
(3, '2026-03-30', '20:00', '21:00', 800, 0, 'Available'),
(3, '2026-03-30', '21:00', '22:00', 800, 0, 'Available');