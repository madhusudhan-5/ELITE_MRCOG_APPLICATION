import React from 'react';

import deepikaImg from '../../../assets/images/DeepikaBabu.jpg';
import sanaImg from '../../../assets/images/SanaFatima.jpg';

const mentors = [
    {
        name: "Dr. Deepika Babu-",
        role: "FOUNDER & LEAD MENTOR",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: deepikaImg
    },
    {
        name: "Dr. Sana Fatima",
        role: "STRATEGIC MENTOR",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: sanaImg
    }
];

const AboutMentors = () => {
    return (
        <section className="about-section about-mentors">
            <div className="mentors-header">
                <div className="mentors-title-group">
                    <span className="mentors-subtitle">CURATORS OF SUCCESS</span>
                    <h2 className="mentors-title">The Minds Behind Elite MRCOG</h2>
                </div>
                <p className="mentors-desc">
                    Crafting doctors into confident specialists through dedicated, one-on-one mentorship.
                </p>
            </div>
            
            <div className="mentors-grid">
                {mentors.map((mentor, idx) => (
                    <div className="mentor-card" key={idx}>
                        <img src={mentor.image} alt={mentor.name} className="mentor-img" />
                        <div className="mentor-info">
                            <h3 className="mentor-name">{mentor.name}</h3>
                            <span className="mentor-role">{mentor.role}</span>
                            <p className="mentor-bio" style={{ color: 'var(--about-text-light)', fontSize: '0.9rem', lineHeight: '1.5' }}>{mentor.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AboutMentors;
