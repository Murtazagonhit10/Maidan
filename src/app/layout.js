import './tokens.css';

export const metadata = {
  title       : 'Maidan — Book Your Court',
  description : 'Real-time sports court booking across cricket, futsal and padel venues in Lahore.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          Load Syne + Mulish as a <link> in <head> — NOT via @import inside CSS.
          This ensures the fonts are requested immediately on page load,
          before any component renders, so the Navbar logo looks identical
          on every page without a flash of fallback font.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Mulish:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}