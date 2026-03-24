/* ═══════════════════════════════════════════════════════
   venuesData.js  —  Mock data mirroring Maidan SQL schema
   Replace VENUES fetch with your real API when ready.

   SQL to generate this shape:
     SELECT v.*,
       STRING_AGG(DISTINCT s.SportName, ',') AS sports,
       ROUND(AVG(CAST(r.Rating AS FLOAT)),1) AS avgRating,
       COUNT(DISTINCT r.ReviewID)            AS reviewCount,
       MIN(c.BasePricePerHour)               AS minPrice,
       MAX(ISNULL(c.PeakPricePerHour, c.BasePricePerHour)) AS maxPrice,
       COUNT(DISTINCT c.CourtID)             AS courtCount
     FROM Venues v
     LEFT JOIN Courts  c ON c.VenueID=v.VenueID AND c.Status='Active'
     LEFT JOIN Sports  s ON s.SportID=c.SportID
     LEFT JOIN Reviews r ON r.CourtID=c.CourtID
     WHERE v.Status='Active'
     GROUP BY v.VenueID, v.Name, v.Description, v.Location,
              v.City, v.ContactNumber, v.Status,
              v.PrimaryImage, v.RegistrationDate, v.LocationURL
═══════════════════════════════════════════════════════ */

export const VENUES = [
  { VenueID:1,  Name:'Indoor Cricket Arena',     Description:'Professional artificial turf cricket nets and match grounds under covered shelter. Floodlit for evening play with changing rooms and coaching available.', Location:'Plot 45, Street 10, DHA Phase 6', City:'Karachi',    ContactNumber:'021-111-222-333', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1540747913346-19212a4db50f?w=800&q=80', RegistrationDate:'2023-02-20', LocationURL:'https://maps.google.com/?q=DHA+Phase+6+Karachi',    sports:['Turf Cricket'],          avgRating:4.7, reviewCount:24, minPrice:800,  maxPrice:2000, courtCount:3 },
  { VenueID:2,  Name:'Indoor Padel Club',         Description:'Climate-controlled indoor padel courts with professional lighting. Glass-walled enclosures, equipment rental and coaching packages available.',           Location:'Sea View Road, Near Boat Basin',     City:'Karachi',    ContactNumber:'021-111-222-334', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', RegistrationDate:'2023-05-15', LocationURL:'https://maps.google.com/?q=Boat+Basin+Karachi',        sports:['Padel'],                avgRating:4.9, reviewCount:41, minPrice:2000, maxPrice:2800, courtCount:3 },
  { VenueID:3,  Name:'Indoor Futsal Stadium',     Description:'FIFA-standard indoor futsal courts with spectator seating and match recording. Lahore\'s premier futsal facility for leagues and casual games.',          Location:'Main Boulevard, Gulberg III',        City:'Lahore',     ContactNumber:'042-111-555-666', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', RegistrationDate:'2023-03-12', LocationURL:'https://maps.google.com/?q=Gulberg+III+Lahore',         sports:['Futsal'],               avgRating:4.6, reviewCount:18, minPrice:1400, maxPrice:1800, courtCount:2 },
  { VenueID:4,  Name:'Indoor Sports Complex',     Description:'Multi-purpose indoor facility supporting cricket nets and futsal — a complete sports destination in the heart of Model Town.',                              Location:'Block F, Model Town',                City:'Lahore',     ContactNumber:'042-111-555-667', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80', RegistrationDate:'2023-01-05', LocationURL:'https://maps.google.com/?q=Model+Town+Lahore',          sports:['Turf Cricket','Futsal'], avgRating:4.5, reviewCount:33, minPrice:1300, maxPrice:1700, courtCount:2 },
  { VenueID:5,  Name:'City Indoor Arena',         Description:'Premium indoor facility for padel and futsal enthusiasts in the capital. Modern infrastructure, lounge area and spectator gallery.',                        Location:'Blue Area, Near Centaurus',          City:'Islamabad',  ContactNumber:'051-111-777-888', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', RegistrationDate:'2023-04-22', LocationURL:'https://maps.google.com/?q=Blue+Area+Islamabad',       sports:['Padel','Futsal'],        avgRating:4.8, reviewCount:29, minPrice:1300, maxPrice:2500, courtCount:2 },
  { VenueID:6,  Name:'Indoor Cricket Hub',        Description:'Dedicated indoor cricket training and match venue with practice nets and a full-length turf. Ideal for academies and corporate events.',                    Location:'F-10 Markaz',                        City:'Islamabad',  ContactNumber:'051-111-777-889', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80', RegistrationDate:'2023-06-01', LocationURL:'https://maps.google.com/?q=F-10+Islamabad',            sports:['Turf Cricket'],          avgRating:3.8, reviewCount:12, minPrice:1000, maxPrice:1400, courtCount:2 },
  { VenueID:8,  Name:'Lahore Sports Dome',        Description:'Massive climate-controlled dome with multiple courts for futsal and padel. Weekend leagues, coaching, and a full sports café on site.',                      Location:'Canal Road, Johar Town',             City:'Lahore',     ContactNumber:'042-333-444-555', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80', RegistrationDate:'2023-08-10', LocationURL:'https://maps.google.com/?q=Johar+Town+Lahore',         sports:['Futsal','Padel'],        avgRating:4.4, reviewCount:52, minPrice:1200, maxPrice:2200, courtCount:5 },
  { VenueID:9,  Name:'Elite Padel Centre',        Description:'Glass-walled padel courts with pro coaching, lounge, and gear rental. Lahore\'s most premium padel experience — engineered for serious players.',           Location:'Bahria Town Phase 4',                City:'Lahore',     ContactNumber:'042-777-888-999', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&q=80', RegistrationDate:'2023-09-15', LocationURL:'https://maps.google.com/?q=Bahria+Town+Lahore',        sports:['Padel'],                avgRating:5.0, reviewCount:8,  minPrice:2200, maxPrice:3000, courtCount:4 },
  { VenueID:10, Name:'Green Turf Rawalpindi',     Description:'Affordable cricket nets and futsal courts with full floodlights for night games. Great value, great location, always available.',                            Location:'Saddar, Rawalpindi',                 City:'Rawalpindi', ContactNumber:'051-444-555-666', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80', RegistrationDate:'2023-07-20', LocationURL:'https://maps.google.com/?q=Saddar+Rawalpindi',         sports:['Turf Cricket','Futsal'], avgRating:4.2, reviewCount:15, minPrice:900,  maxPrice:1500, courtCount:3 },
  { VenueID:11, Name:'Champions Court',           Description:'Futsal-only facility built to match-day standards. High ceilings, professional markings, video analysis service, and team changing rooms.',                  Location:'Garden Town, Lahore',                City:'Lahore',     ContactNumber:'042-111-333-777', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', RegistrationDate:'2023-10-05', LocationURL:'https://maps.google.com/?q=Garden+Town+Lahore',        sports:['Futsal'],               avgRating:4.3, reviewCount:22, minPrice:1100, maxPrice:1600, courtCount:2 },
  { VenueID:12, Name:'Capital Padel Park',        Description:'Islamabad\'s fastest-growing padel club. Three courts, social lounge, and structured coaching for all levels from beginner to competitive.',               Location:'E-11, Islamabad',                    City:'Islamabad',  ContactNumber:'051-999-111-222', Status:'Active', PrimaryImage:'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80', RegistrationDate:'2024-01-10', LocationURL:'https://maps.google.com/?q=E-11+Islamabad',            sports:['Padel'],                avgRating:4.6, reviewCount:7,  minPrice:1800, maxPrice:2600, courtCount:3 },
];

export const ALL_SPORTS  = ['Turf Cricket', 'Futsal', 'Padel'];
export const ALL_CITIES  = [...new Set(VENUES.map(v => v.City))].sort();
export const PRICE_MIN   = Math.min(...VENUES.map(v => v.minPrice));
export const PRICE_MAX   = Math.max(...VENUES.map(v => v.maxPrice));

export const QUICK_PICKS = [
  { id:'top_rated',   label:'⭐ Top Rated',      filter: v => v.avgRating >= 4.7 },
  { id:'budget',      label:'💸 Budget Friendly', filter: v => v.minPrice  <= 1200 },
  { id:'multi_sport', label:'🎯 Multi-Sport',     filter: v => v.sports.length > 1 },
  { id:'new',         label:'✨ Recently Added',  filter: v => new Date(v.RegistrationDate) > new Date('2023-08-01') },
  { id:'lahore',      label:'📍 Lahore Only',     filter: v => v.City === 'Lahore' },
];
