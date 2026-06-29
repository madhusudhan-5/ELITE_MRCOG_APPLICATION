import React from 'react';
import './Mentors.css';
import mentorFemale from '../../assets/images/mentor_female.png';
import mentorMale from '../../assets/images/mentor_male.png';

const Mentors = () => {
    return (
        <section className="mentors-section">
            <div className="mentors-container">
                <h2 className="mentors-title">Learn from the Best in Obstetrics & Gynaecology</h2>
                <p className="mentors-subtitle">
                    Our faculty comprises highly experienced MRCOG-certified professionals dedicated to your success.
                </p>
                <div className="mentors-grid">
                    <div className="mentor-card">
                        <img src={mentorFemale} alt="Dr. Sarah Jenkins" className="mentor-image" />
                        <h3 className="mentor-name">Dr. Sarah Jenkins</h3>
                        <p className="mentor-creds">MRCOG, Specialist in Maternal Fetal Medicine</p>
                    </div>
                    <div className="mentor-card">
                        <img src={mentorMale} alt="Dr. James Carter" className="mentor-image" />
                        <h3 className="mentor-name">Dr. James Carter</h3>
                        <p className="mentor-creds">MRCOG, Consultant Gynaecologist</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Mentors;
