import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';
import logo from '../../assets/images/logo.svg';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="/#home" className="navbar__logo">
          <img src={logo} alt="Elite MRCOG" className="navbar__logo-img" />
        </a>

        {/* Nav Links */}
        <ul className={`navbar__links${menuOpen ? ' open' : ''}`}>
          <li><a href="/#home" className="navbar__link navbar__link--active">Home</a></li>
          <li><Link to="/about" className="navbar__link">About Us</Link></li>
          <li><a href="/#contact" className="navbar__link">Contact Us</a></li>
        </ul>

        {/* CTA Buttons */}
        <div className={`navbar__actions${menuOpen ? ' open' : ''}`}>
          {isAuthenticated ? (
            <>
              {user?.is_superuser && (
                <a href="http://localhost:8000/admin" className="navbar__btn-login" style={{marginRight: '10px'}} target="_blank" rel="noreferrer">Admin Panel</a>
              )}
              <Link to="/dashboard" className="navbar__btn-signup">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn-signup">Login</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
