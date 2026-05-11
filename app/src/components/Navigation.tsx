import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Proyectos', path: '/work' },
  { label: 'Contacto', path: '/contact' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrolled(currentScrollY > 50);
    if (currentScrollY > 500) {
      setHidden(currentScrollY > lastScrollY.current);
    } else {
      setHidden(false);
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    lastScrollY.current = 0;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-500"
        style={{
          transform: hidden && !mobileOpen ? 'translateY(-100%)' : 'translateY(0)',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        <div
          className="h-20 flex items-center justify-between px-6 md:px-8"
          style={{
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'background-color 0.3s ease',
            borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          }}
        >
          {/* Logo SVG */}
          <Link to="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <img src="/logo.svg" alt="MRUIPEZ ARCHVIZ" className="h-16 w-auto" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-sans uppercase tracking-widest transition-colors duration-300 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded"
                style={{
                  fontSize: '0.8125rem',
                  letterSpacing: '0.06em',
                  color: location.pathname === link.path ? '#121212' : '#868686',
                  fontWeight: 400,
                }}
              >
                {link.label}
              </Link>
            ))}
            {true && (
              <Link
                to="/admin"
                className="flex items-center gap-2 font-sans uppercase tracking-widest text-[#121212] transition-colors duration-300 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                style={{ fontSize: '0.8125rem', letterSpacing: '0.06em', fontWeight: 400 }}
              >
                <LayoutDashboard size={14} />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#121212] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <button
            className="absolute top-5 right-6 text-[#121212] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={24} strokeWidth={1.5} />
          </button>

          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-sans text-4xl uppercase tracking-widest transition-colors duration-300 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2"
                style={{
                  color: location.pathname === link.path ? '#121212' : '#868686',
                  fontWeight: 300,
                  letterSpacing: '0.1em',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {true && (
              <Link
                to="/admin"
                className="font-sans text-4xl uppercase tracking-widest text-[#121212] transition-colors duration-300 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 flex items-center gap-3"
                style={{ fontWeight: 300, letterSpacing: '0.1em' }}
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={28} />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
