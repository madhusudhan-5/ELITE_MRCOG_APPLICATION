import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

// Import images
import logo from '../../assets/images/logo.svg';
import dummyImage from '../../assets/images/4c6498cce2e253cf38639b4ba215c7df58ce5a53.jpg';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-left-panel">
                <div className="auth-brand">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={logo} alt="Elite MRCOG Logo" className="auth-logo" />
                        <h2>ELITE MRCOG</h2>
                    </Link>
                </div>
                <div className="auth-illustration">
                    <img src={dummyImage} alt="Welcome" className="auth-hero-image" />
                    <h3>Welcome to Elite MRCOG</h3>
                    <p>Your journey to professional excellence begins here.</p>
                </div>
                <div className="auth-footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms and Condition</a>
                    <a href="/refund">Refund policy</a>
                </div>
            </div>
            
            <div className="auth-right-panel">
                <div className="auth-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
