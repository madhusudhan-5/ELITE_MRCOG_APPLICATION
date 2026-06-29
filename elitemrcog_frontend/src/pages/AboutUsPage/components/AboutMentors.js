import React from 'react';

const mentors = [
    {
        name: "Dr. Uma Kamat",
        role: "FOUNDER & LEAD MENTOR",
        bio: "A practicing physician with a vision to simplify medical education. Her teaching philosophy is built on 'The Support System'—ensuring no candidate feels alone in their MRCOG journey.",
        image: "/images/mentor_uma_1782489109113.png"
    },
    {
        name: "Dr. Ankita Joshi",
        role: "STRATEGIC MENTOR",
        bio: "Consultant. Dr. Ankita specializes in transforming complex clinical tasks into repeatable templates, having aced the exam on her first attempt through innovation.",
        image: "/images/mentor_ankita_1782489123096.png"
    },
    {
        name: "Dr. Niranjani Rajachander",
        role: "CLINICAL MENTOR",
        bio: "From student to mentor, Niranjani's journey is a testament to the Elite MRCOG methodology. She focuses on confidence-building and structured communication competencies.",
        image: "/images/mentor_niranjani_1782489133602.png"
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
                            <p className="mentor-bio">{mentor.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AboutMentors;
