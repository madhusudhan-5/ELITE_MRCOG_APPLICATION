import React from 'react';

import deepikaImg from '../../../assets/images/DeepikaBabu.jpg';
import sanaImg from '../../../assets/images/SanaFatima.jpg';

const mentors = [
    {
        name: "Dr. Deepika Babu",
        role: "Co-founder & Chief Mentor",
        bio: "Dr. Deepika Babu is passionate about simplifying MRCOG Part 3 through structured teaching, real exam recalls, and personalised mentorship. Her practical, examiner-focused approach helps candidates build confidence, communication skills, and clinical reasoning for exam success.",
        image: deepikaImg
    },
    {
        name: "Dr. Sana Fatima",
        role: "Co-founder & Chief Mentor",
        bio: "Dr. Sana Fathima is dedicated to helping candidates excel through clear communication, supportive mentoring, and evidence-based teaching. Her calm, student-centred approach empowers doctors to perform confidently in the MRCOG Part 3 examination.",
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
