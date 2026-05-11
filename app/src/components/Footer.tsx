import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Proyectos', path: '/work' },
  { label: 'Contacto', path: '/contact' },
];

export default function Footer() {
  const location = useLocation();

  return (
    <footer className="w-full bg-bg-primary border-t border-border-custom">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <img src="/logo.svg" alt="MRUIPEZ ARCHVIZ" className="h-7 w-auto" />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="font-sans uppercase tracking-widest transition-colors duration-300 hover:text-text-primary"
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  color: location.pathname === link.path ? '#C9CACA' : '#868686',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <span className="font-sans text-text-muted" style={{ fontSize: '0.75rem' }}>
            &copy; 2025
          </span>
        </div>

        {/* Bottom Row */}
        <div className="text-center pb-6 pt-2 border-t border-border-custom">
          <span
            className="font-sans text-text-muted"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.04em' }}
          >
            Cartagena, España &middot; Estudio de Visualización Arquitectónica
          </span>
        </div>
      </div>
    </footer>
  );
}
