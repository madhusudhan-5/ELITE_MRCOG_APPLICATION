import React from 'react';
import { Award, Target } from 'lucide-react';

const AboutMission = () => {
    return (
        <section className="about-section about-mission">
            <div className="mission-watermark">MISSION</div>
            
            <div className="mission-content">
                <h2 className="mission-title">
                    Your Journey, <span>Perfectly Planned.</span>
                </h2>
                
                <p className="mission-text">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                </p>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Personalized Trajectory</h3>
                        <p className="mission-point-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Station-Focused Mastery</h3>
                        <p className="mission-point-text">Sed do eiusmod tempor incididunt ut labore et dolore.</p>
                    </div>
                </div>
            </div>
            
            <div className="mission-images">
                <img 
                    src="/images/about_surgery_1782489094770.png" 
                    alt="Surgical Team" 
                    className="mission-img" 
                />
            </div>
        </section>
    );
};

export default AboutMission;
