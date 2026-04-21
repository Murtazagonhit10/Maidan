# Maidan — Indoor Sports Court Booking Platform

> Real-time booking for cricket, futsal, and padel venues across Lahore. Find, compare, and secure your court in under 60 seconds.

---

## Team Members

| Name | Roll No. |
|------|----------|
| Ghulam Murtaza | *(24L-2566)* |
| Abdul Ahad | *(24L-2594)* |
| Abdul Rehman | *(24L-2613)* |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React |
| **Backend / API** | Next.js API Routes (Node.js runtime) |
| **Database** | MySQL |
| **Authentication** | JWT via HTTP-only cookies |
| **3D / Animation** | Three.js, WebGL (GLSL shaders) |
| **Styling** | CSS Modules, inline styles, custom design tokens |
| **Fonts** | Syne (headings), Mulish (body) — Google Fonts |

---

## Project Structure & Submission Requirements Mapping

> **Important note on folder structure:** This project uses a **Next.js monorepo** — frontend pages, backend API routes, and shared utilities all live inside one `src/` directory. This is the standard industry pattern for Next.js applications. The table below maps every required submission folder from the guidelines to its actual location in this repository.

---

### Backend — `src/app/api/` *(maps to required `backend/`)*

Next.js API routes serve as the full backend. Every file named `route.js` is a standalone API endpoint.

```
src/app/api/                            ← Backend (equivalent to backend/app/)
│
├── auth/
│   ├── login/route.js                  ← POST   /api/auth/login
│   └── register/route.js               ← POST   /api/auth/register
│
├── logout/route.js                     ← POST   /api/logout
│
├── users/
│   ├── route.js                        ← GET    /api/users
│   ├── [id]/route.js                   ← GET    /api/users/:id
│   └── [id]/bookings/route.js          ← GET    /api/users/:id/bookings
│
├── venues/
│   ├── route.js                        ← GET    /api/venues
│   ├── [id]/route.js                   ← GET    /api/venues/:id
│   ├── [id]/courts/route.js            ← GET    /api/venues/:id/courts
│   └── owner/[id]/route.js             ← GET    /api/venues/owner/:id
│
├── courts/
│   ├── route.js                        ← GET    /api/courts
│   └── search/route.js                 ← GET    /api/courts/search
│
├── bookings/route.js                   ← GET/POST /api/bookings
├── slots/available/route.js            ← GET    /api/slots/available
└── sports/route.js                     ← GET    /api/sports

lib/db.js                               ← MySQL database connection pool
middleware.js                           ← JWT authentication middleware
package.json                            ← Dependencies (= backend requirements.txt)
.env.example                            ← Environment variables template 
```

---

### Frontend — `src/app/` + `src/components/` + `public/` *(maps to required `frontend/`)*

```
src/
├── app/                                ← Pages (equivalent to frontend/src/)
│   ├── page.jsx                        ← Homepage            /
│   ├── login/page.jsx                  ← Login page          /login
│   ├── register/page.jsx               ← Register page       /register
│   ├── venues/
│   │   ├── page.jsx                    ← Venues listing      /venues
│   │   ├── [id]/page.jsx               ← Venue detail        /venues/:id
│   │   ├── add/page.jsx                ← Add venue           /venues/add
│   │   ├── VenueCard.jsx               ← Venue card component
│   │   ├── VenueFilterBar.jsx          ← Filter bar component
│   │   ├── VenuesHero.jsx              ← Hero section
│   │   ├── SplashCursor.jsx            ← Cursor animation
│   │   └── venuesData.js               ← Static venue data
│   ├── courts/search/page.jsx          ← Court search        /courts/search
│   ├── dashboard/
│   │   ├── page.jsx                    ← Player dashboard    /dashboard
│   │   └── owner/page.jsx              ← Owner dashboard     /dashboard/owner
│   ├── my-bookings/page.jsx            ← My bookings         /my-bookings
│   ├── layout.js                       ← Root HTML shell, Google Fonts
│   ├── globals.css                     ← Global reset styles
│   └── tokens.css                      ← CSS design tokens (colours, fonts, spacing)
│
├── components/                         ← Reusable components (equivalent to frontend/src/components/)
│   ├── Navbar.jsx                      ← Context-aware navigation bar
│   ├── Navbar.module.css               ← Navbar styles
│   ├── HeroScene.jsx                   ← Three.js WebGL hero (homepage)
│   ├── ScrollStackHIW.jsx              ← Scroll-stack "How it Works" section
│   ├── ElectricBorder.jsx              ← Animated electric border component
│   ├── ElectricBorder.css              ← Electric border styles
│   ├── Ui.jsx                          ← SpotlightCard, ImageStrip, Marquee, etc.
│   ├── Motion.jsx                      ← RevealText, ParallaxSection animations
│   ├── CNICField.jsx                   ← CNIC input (auto-dash, 00000-0000000-0)
│   ├── PhoneField.jsx                  ← Phone input (+92 prefix, 10-digit validation)
│   ├── DOBPicker.jsx                   ← Animated drum-wheel date picker
│   ├── CountUp.jsx                     ← Animated number counter
│   ├── RevealText.jsx                  ← Scroll-triggered text reveal
│   ├── ParallaxSection.jsx             ← Parallax scroll wrapper
│   └── ScrollProvider.jsx              ← Global scroll context

public/                                 ← Static assets (equivalent to frontend/public/)
├── pictures/
│   ├── sports/       cricket.jpg, futsal.jpg, padel.jpg
│   ├── venues/       venue1–4.jpg
│   ├── strips/       set1/ and set2/ (marquee images)
│   ├── steps/        search.jpg, book.jpg, play.jpg
│   ├── footer/       footer.jpg
│   └── whymaidan/    big.jpg, small.jpg
└── *.svg             (Next.js default icons)
```

---

### Database — `database/` *(matches required `database/` exactly)*

```
database/
├── maidan_schema.sql     ← DDL: all CREATE TABLE statements        [= schema.sql/seed.sql] 
├── main.sql   
├── Maidan_schema.pdf     ← Schema diagram/ another ERD
└── erd.png               ← Entity Relationship Diagram                            
```

---

### Documentation — `docs/` *(matches required `docs/` exactly)*

```
docs/
└── Maidan Iteration 1 report.docx     ← Iteration 1 document                            
```

> `report.docx` (final report) will be added to `docs/` before the final submission deadline.

---

### Root-level Files

```
README.md           ← This file                                                    
.env.example        ← Environment variable template (no real secrets committed)    
.gitignore          ← Excludes .env, node_modules, .next                           
package.json        ← All project dependencies                                     
package-lock.json   ← Locked dependency versions
next.config.mjs     ← Next.js configuration
jsconfig.json       ← Path aliases (@/components, @/app)
middleware.js       ← Route authentication guard
```

---

## How to Run

### Prerequisites
- **Node.js** v18 or above — [download](https://nodejs.org)
- **MySQL** 8.0 or above
- **Git**

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Murtazagonhit10/maidan.git
cd maidan
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your local values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=maidan
JWT_SECRET=any_random_secret_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 3 — Set up the database

```bash
# Create the maidan database first
mysql -u root -p -e "CREATE DATABASE maidan;"

# Run the schema (creates all tables)
mysql -u root -p maidan < database/maidan_schema.sql

# Load sample data (optional but recommended for testing)
mysql -u root -p maidan < database/main.sql
```

### Step 4 — Install dependencies

```bash
npm install
```

### Step 5 — Start the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Step 6 — Build for production (optional)

```bash
npm run build
npm start
```

---

## API Endpoints Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register` | NO | Register as Player or Owner |
| `POST` | `/api/auth/login` | NO | Login, sets JWT cookie |
| `POST` | `/api/logout` |  | Clears auth cookie |
| `GET` | `/api/venues` | NO | List all active venues |
| `POST` | `/api/venues` |  Owner | Create a new venue |
| `GET` | `/api/venues/:id` | NO | Get venue details |
| `GET` | `/api/venues/:id/courts` | NO | List courts for a venue |
| `GET` | `/api/venues/owner/:id` |  | Get owner's venues |
| `GET` | `/api/courts` | NO | List all courts |
| `GET` | `/api/courts/search` | NO | Filter courts by sport/price/area |
| `GET` | `/api/slots/available` | NO | Available time slots for a court |
| `GET` | `/api/bookings` |  | Get user's bookings |
| `POST` | `/api/bookings` |  | Create a booking |
| `GET` | `/api/users/:id` |  | Get user profile |
| `GET` | `/api/users/:id/bookings` |  | Get all bookings for a user |
| `GET` | `/api/sports` | NO | List all sports |

---

## Database Schema

| Table | Key Columns | Description |
|-------|-------------|-------------|
| `Users` | `UserID`, `FullName`, `Role`, `Email` | Players and venue owners |
| `Venues` | `VenueID`, `OwnerID`, `Name`, `City`, `Status` | Venue listings |
| `Courts` | `CourtID`, `VenueID`, `SportID`, `BasePricePerHour` | Courts within venues |
| `Sports` | `SportID`, `SportName` | Cricket, Futsal, Padel |
| `TimeSlots` | `SlotID`, `CourtID`, `StartTime`, `EndTime` | Available booking windows |
| `Bookings` | `BookingID`, `UserID`, `SlotID`, `Status` | Confirmed bookings |
| `Reviews` | `ReviewID`, `UserID`, `VenueID`, `Rating` | Post-booking reviews |

See **`database/erd.png`** for the full Entity Relationship Diagram.

---

## Security

- `.env` is in `.gitignore` — real credentials are never committed
- `.env.example` contains only placeholder values
- Passwords hashed before database storage
- JWT stored in HTTP-only cookies (not localStorage — XSS safe)
- All protected routes validated through `middleware.js`

---

## Submission Checklist *(FAST-NUCES DBMS Spring 2026)*

| Status | Requirement |
|:------:|-------------|
|  | Repository is set to **Public** |
|  | All team members have commits in the repository |
|  | `README.md` includes title, description, team, tech stack, and setup |
|  | Backend API routes present — `src/app/api/` (Next.js monorepo) |
|  | `package.json` present with all dependencies |
|  | Frontend source — `src/app/` and `src/components/` |
|  | Static assets — `public/pictures/` |
|  | `database/maidan_schema.sql` — DDL CREATE TABLE statements |
|  | `database/main.sql` — seed / sample data |
|  | `database/erd.png` — Entity Relationship Diagram |
|  | `docs/Maidan Iteration 1 report.docx` — Iteration document |
|  | `.env.example` — no real secrets committed |
|  | `.gitignore` — excludes `.env` and `node_modules` |
| ⬜ | `docs/report.docx` — add final report before deadline |
