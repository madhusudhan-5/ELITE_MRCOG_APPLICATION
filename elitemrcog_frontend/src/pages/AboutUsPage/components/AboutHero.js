import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import aboutusheroImg from '../../../assets/images/aboutushero.png';

const AboutHero = () => {
    return (
        <section className="about-section about-hero">
            <div className="about-hero-content">
                <div className="vision-badge">
                    <Sparkles size={16} />
                    <span>OUR VISION 2026</span>
                </div>
                
                <h1 className="about-hero-title">
                    REDEFINING <span>MRCOG PREPARATION</span>
                </h1>
                
                <p className="about-hero-text">
                    We don't just prepare you for an exam—we help you develop the clinical reasoning, communication skills, and confidence expected of a modern specialist.
                    <br />
                    Learn with clarity. Practise with confidence. Succeed with mentorship.
                </p>
                
                <a href="#modules" className="explore-btn">
                    Explore Modules <ArrowRight size={18} />
                </a>
            </div>
            
            <div className="about-hero-image-container">
                <img 
                    src={aboutusheroImg} 
                    alt="Mentorship and studying" 
                    className="about-hero-image"
                />
                <div className="hero-stats-glass">
                    <div className="stat-item">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">MENTOR SUPPORT</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">300+</div>
                        <div className="stat-label">HIGH-YIELD STATIONS</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
