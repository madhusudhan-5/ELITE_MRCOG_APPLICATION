import React from 'react';
import { Award, Target } from 'lucide-react';
import aboutus2Img from '../../../assets/images/aboutus2.png';

const AboutMission = () => {
    return (
        <section className="about-section about-mission">
            <div className="mission-watermark">MISSION</div>
            
            <div className="mission-content">
                <h2 className="mission-title">
                    Your MRCOG Journey, <span>Perfectly Planned.</span>
                </h2>
                
                <p className="mission-text">
                    Most candidates don't struggle because they lack knowledge—they struggle because they lack a structured approach. MRCOG Part 3 is a performance-based examination that demands preparation, deliberate practice, constructive feedback, and repeated refinement. That's exactly what we help you achieve.
                </p>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Structured Learning Path</h3>
                        <p className="mission-point-text">A step-by-step roadmap from preparation to exam day.</p>
                    </div>
                </div>
                
                <div className="mission-point">
                    <div className="mission-point-icon">
                        <Award size={24} />
                    </div>
                    <div>
                        <h3 className="mission-point-title">Personalised Mentorship</h3>
                        <p className="mission-point-text">Individual feedback to help you improve with every session.</p>
                    </div>
                </div>
            </div>
            
            <div className="mission-images">
                <img 
                    src={aboutus2Img} 
                    alt="MRCOG Journey" 
                    className="mission-img" 
                />
            </div>
        </section>
    );
};

export default AboutMission;
