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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Activity size={28} />
                    </div>
                    <h3 className="value-title">Real-Time</h3>
                    <p className="value-text">
                        Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </p>
                </div>
                
                <div className="value-card">
                    <div className="value-icon-wrapper">
                        <Heart size={28} />
                    </div>
                    <h3 className="value-title">Empathy</h3>
                    <p className="value-text">
                        Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutValues;
