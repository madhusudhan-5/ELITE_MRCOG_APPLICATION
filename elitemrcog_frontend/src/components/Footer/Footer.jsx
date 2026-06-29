import React, { useState } from 'react';
import './Footer.css';
import logo from '../../assets/images/logo.svg';
import LegalModal from './LegalModal';

import { policies } from '../../constants/policies';

const Footer = ({ id }) => {
    const [activeModal, setActiveModal] = useState(null);

    const closeModal = () => setActiveModal(null);

    return (
        <footer className="footer" id={id}>
            <div className="container footer__inner">
                {/* Brand + tagline */}
                <div className="footer__brand">
                    <img src={logo} alt="Elite MRCOG" className="footer__logo" />
                    <span className="footer__tagline">Your Pathway<br />to Success</span>
                </div>

                {/* Social Icons */}
                <div className="footer__socials">
                    <a href="#" className="footer__social-link" aria-label="Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
                            <path d="M13.5 8H15V6h-2c-1.7 0-2.5 1.3-2.5 3v1H9v2h1.5v5H13v-5h2l.5-2H13V9c0-.6.2-1 .5-1z" fill="white" />
                        </svg>
                    </a>
                    <a href="#" className="footer__social-link" aria-label="YouTube">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
                            <path d="M17.5 12s0-3.3-0.4-4.8c-.2-.8-.9-1.4-1.7-1.6C14.2 5.3 12 5.3 12 5.3s-2.2 0-3.4.3c-.8.2-1.5.8-1.7 1.6C6.5 8.7 6.5 12 6.5 12s0 3.3.4 4.8c.2.8.9 1.4 1.7 1.6 1.2.3 3.4.3 3.4.3s2.2 0 3.4-.3c.8-.2 1.5-.8 1.7-1.6.4-1.5.4-4.8.4-4.8zM10.5 14.3V9.7l4 2.3-4 2.3z" fill="white" />
                        </svg>
                    </a>
                    <a href="#" className="footer__social-link" aria-label="Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
                            <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" />
                            <circle cx="16" cy="8" r="0.8" fill="white" />
                        </svg>
                    </a>
                    <a href="#" className="footer__social-link" aria-label="LinkedIn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
                            <path d="M8 10v6M8 8v.01M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4M12 10v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </a>
                </div>

                {/* Newsletter */}
                <div className="footer__newsletter">
                    <p className="footer__newsletter-label">Subscribe to get our Newsletter</p>
                    <div className="footer__newsletter-form">
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="footer__email-input"
                        />
                        <button className="footer__subscribe-btn">Subscribe</button>
                    </div>
                </div>

                {/* Legal links */}
                <div className="footer__legal">
                    <button className="footer__legal-link" onClick={() => setActiveModal('refund')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Refund Policy</button>
                    <span className="footer__legal-divider">|</span>
                    <button className="footer__legal-link" onClick={() => setActiveModal('privacy')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Privacy Policy</button>
                    <span className="footer__legal-divider">|</span>
                    <button className="footer__legal-link" onClick={() => setActiveModal('terms')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Terms &amp; Conditions</button>
                </div>

                <p className="footer__copy">© 2026 Elite MRCOG</p>
            </div>

            {/* Legal Modals */}
            <LegalModal
                isOpen={activeModal === 'privacy'}
                onClose={closeModal}
                title="Privacy Policy"
                content={policies.privacy}
            />
            <LegalModal
                isOpen={activeModal === 'terms'}
                onClose={closeModal}
                title="Terms &amp; Conditions"
                content={policies.terms}
            />
            <LegalModal
                isOpen={activeModal === 'refund'}
                onClose={closeModal}
                title="Refund Policy"
                content={policies.refund}
            />
        </footer>
    );
};

export default Footer;
