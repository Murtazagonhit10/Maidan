'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  /* ── Context-aware CTA logic ──────────────────────────────────
     /register     → show "Sign In"     (already on signup, offer login)
     /login        → show "Get Started" (already on login, offer signup)
     /dashboard    → hide CTA           (logged-in user area)
     /my-bookings  → hide CTA           (logged-in user area)
     everywhere else → show "Get Started"
  ─────────────────────────────────────────────────────────────── */
  const hideCta    = ['/dashboard', '/my-bookings'].includes(pathname);
  const isAuthPage = pathname === '/register' || pathname === '/login';
  const isRegister = pathname === '/register';

  const ctaHref  = isRegister ? '/login'    : '/register';
  const ctaLabel = isRegister ? 'Sign In'   : 'Get Started';

  const navLinks = [
    { href: '/venues',      label: 'Venues'    },
    { href: '/courts',      label: 'Courts'    },
    { href: '/my-bookings', label: 'Bookings'  },
    { href: '/dashboard',   label: 'Dashboard' },
  ];

  // Hide nav links on register/login pages
  const showNavLinks = !isAuthPage;

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.solid : ''}`}>

        {/* ── Logo ── */}
        <Link href="/" className={styles.logo} onClick={close}>
          MAIDA<span className={styles.logoAccent}>N</span>
          <span className={styles.logoDot} />
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {showNavLinks && navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? styles.linkActive : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          {!hideCta && (
            <li>
              <Link href={ctaHref} className={styles.cta}>
                {ctaLabel}
              </Link>
            </li>
          )}
        </ul>

        {/* Hamburger */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        {showNavLinks && navLinks.map(({ href, label }) => (
          <Link key={href} href={href} onClick={close}>{label}</Link>
        ))}
        {!hideCta && (
          <Link href={ctaHref} onClick={close} className={styles.drawerCta}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </>
  );
}