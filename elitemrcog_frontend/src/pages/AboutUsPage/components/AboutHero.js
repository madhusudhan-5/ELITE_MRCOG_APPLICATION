import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const AboutHero = () => {
    return (
        <section className="about-section about-hero">
            <div className="about-hero-content">
                <div className="vision-badge">
                    <Sparkles size={16} />
                    <span>OUR VISION 2026</span>
                </div>
                
                <h1 className="about-hero-title">
                    Empowering the <span>Next Generation</span> of Specialists.
                </h1>
                
                <p className="about-hero-text">
                    Excel MRCOG isn't just a course; it's a mentorship sanctuary. We simplify the complex, so you can focus on excellence.
                </p>
                
                <a href="#modules" className="explore-btn">
                    Explore Modules <ArrowRight size={18} />
                </a>
            </div>
            
            <div className="about-hero-image-container">
                <img 
                    src="/images/about_hands_typing_1782489084212.png" 
                    alt="Mentorship and studying" 
                    className="about-hero-image"
                />
                <div className="hero-stats-glass">
                    <div className="stat-item">
                        <div className="stat-value">85%</div>
                        <div className="stat-label">PASS RATE AVERAGE</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">49+</div>
                        <div className="stat-label">GLOBAL PASS OUTS</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
