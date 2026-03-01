import React from 'react';
import './Features.css';

const features = [
    {
        icon: '📄',
        iconBg: '#5B67CA',
        title: 'Reading Library',
        description: 'Access 300+ recall tasks with clear module-wise keys and ready-made revision notes designed to boost your clinical clarity and communication confidence.',
        link: 'View Once',
    },
    {
        icon: '📅',
        iconBg: '#00CBB8',
        title: 'Online Course',
        description: 'A comprehensive MRCOG Part 3 program with live training focused on communication, counselling, and clinical skills. Get mentor-guided practice, personalised feedback, and exam-ready strategies.',
        link: 'View Once',
    },
    {
        icon: '👥',
        iconBg: '#29B6E1',
        title: 'Mock Exam',
        description: 'Experience true-to-exam MRCOG Part 3 mock stations covering communication, counselling, viva, and more. Get individualised mentor feedback and clear domain-wise improvement strategies.',
        link: 'View Once',
    },
    {
        icon: '▶',
        iconBg: '#E05780',
        title: 'Video Library',
        description: 'Experience true-to-exam MRCOG Part 3 mock stations covering communication, counselling, viva, and more. Get individualised mentor feedback and clear domain-wise improvement strategies.',
        link: 'View Once',
    },
];

const Features = () => {
    return (
        <section className="features section" id="features">
            <div className="container">
                <h2 className="section-heading">
                    All-In-One <span className="highlight-teal">Elite MRCOG</span>
                </h2>
                <p className="section-subheading">
                    MRCOG is one powerful online suite that combines all the skills<br />
                    required to crack the Exam
                </p>

                <div className="features__grid">
                    {features.map((f, idx) => (
                        <div className="features__card" key={idx}>
                            <div
                                className="features__icon-wrap"
                                style={{ backgroundColor: f.iconBg }}
                            >
                                <span className="features__icon">{f.icon}</span>
                            </div>
                            <h3 className="features__card-title" style={{ color: f.iconBg }}>
                                {f.title}
                            </h3>
                            <p className="features__card-desc">{f.description}</p>
                            <a href="#" className="features__link">
                                <u>{f.link}</u>
                            </a>
                        </div>
                    ))}
                </div>

                <div className="features__cta">
                    <a href="#signup" className="btn btn-teal">Get Started</a>
                </div>
            </div>
        </section>
    );
};

export default Features;
