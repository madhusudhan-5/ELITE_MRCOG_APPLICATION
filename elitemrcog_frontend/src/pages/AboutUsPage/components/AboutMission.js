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
                    We observed that most candidates failed not because of a lack of knowledge, but due to a lack of structure. MRCOG Part 3 is a performance. Like any performance, it requires rehearsal, timing, and critique.
                </p>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Personalized Trajectory</h3>
                        <p className="mission-point-text">No two candidates are the same. We tailor the path.</p>
                    </div>
                </div>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Station-Focused Mastery</h3>
                        <p className="mission-point-text">Every station is a module; every module is a win.</p>
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
