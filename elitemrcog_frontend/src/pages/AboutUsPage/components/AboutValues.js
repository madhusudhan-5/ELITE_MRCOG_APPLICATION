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
                        Targeted, station-specific guidance aligned with RCOG guidelines and scoring rubrics.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Activity size={28} />
                    </div>
                    <h3 className="value-title">Real-Time</h3>
                    <p className="value-text">
                        Interactive practice sessions, instant examiner feedback, and real exam scenario simulation.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Heart size={28} />
                    </div>
                    <h3 className="value-title">Empathy</h3>
                    <p className="value-text">
                        Supportive, student-centred mentoring designed to reduce exam stress and build lasting confidence.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutValues;
