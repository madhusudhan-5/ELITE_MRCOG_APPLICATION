import React from 'react';
import { Crosshair, Activity, Heart } from 'lucide-react';

const AboutValues = () => {
    return (
        <section className="about-section about-values">
            <div className="values-watermark">CORE</div>
            
            <div className="values-grid">
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Crosshair size={28} />
                    </div>
                    <h3 className="value-title">Precision</h3>
                    <p className="value-text">
                        We don't study more; we study smarter. Focusing exactly on Royal College standards.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Activity size={28} />
                    </div>
                    <h3 className="value-title">Real-Time</h3>
                    <p className="value-text">
                        Recalls and station recordings that reflect the current exam pulse.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Heart size={28} />
                    </div>
                    <h3 className="value-title">Empathy</h3>
                    <p className="value-text">
                        We understand the burnout. Our mentors are your emotional anchor.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutValues;
