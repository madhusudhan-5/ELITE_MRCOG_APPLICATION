import React from 'react';
import { Send } from 'lucide-react';

const AboutCTA = () => {
    return (
        <section className="about-cta-section">
            <div className="about-cta-banner">
                <div className="cta-content">
                    <h2 className="cta-title">Join the Circle of Excellence.</h2>
                    <p className="cta-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>
                <div>
                    <a href="https://t.me/ccadk123456" target="_blank" rel="noopener noreferrer" className="cta-btn">
                        Join Telegram <Send size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default AboutCTA;
