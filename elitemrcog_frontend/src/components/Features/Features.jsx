import React from 'react';
import './Features.css';

const features = [
    {
        icon: '💻',
        iconBg: '#5B67CA',
        title: 'Live Online Classes',
        list: [
            'TOTAL 30+ LIVE INTERACTIVE CLASSES',
            '15+ LIVE MODULE-WISE CLASSES',
            'ACTIVE PARTICIPANT PRESENTATIONS',
            'PERSONALISED MENTOR FEEDBACK',
            'DAILY HOMEWORK STATIONS',
            'PRE-MODULE SELF-ACTIVITY – TIMETABLE'
        ],
    },
    {
        icon: '📄',
        iconBg: '#00CBB8',
        title: 'Reading Library',
        list: [
            '300+ Meticulously Written Recall Stations',
            'Complete Station Templates',
            'Role Player Instructions',
            'Domain-wise Answer Keys',
            'Ready-to-Revise Flashcards & Notes',
            'GTG | TOG | NICE Summaries'
        ],
    },
    {
        icon: '▶',
        iconBg: '#E05780',
        title: 'Video & Podcast Library',
        list: [
            '150+ Mentor Demonstration Videos',
            '10-Minute Model Performances',
            'Watch Anytime, Learn Anywhere',
            'Exam-Ready Communication Techniques',
            'Perfect for Daily Revision'
        ],
    },
    {
        icon: '👥',
        iconBg: 'var(--color-navy)',
        title: 'Mock Circuits',
        list: [
            '14-Station Online Mock Circuits',
            '2-Minute Reading + 10-Minute Performance',
            'Real Exam Simulation',
            'Domain-wise Marking',
            'Personalised Mentor Feedback'
        ],
    },
];

const Features = () => {
    return (
        <section className="features section" id="features">
            <div className="container">
                <h2 className="section-heading">
                    Everything You Need to <span className="highlight-teal">Pass MRCOG Part 3</span>
                </h2>
                <p className="section-subheading">
                    One platform. One structured pathway. Everything you need to prepare confidently for MRCOG Part 3 - with Elite MRCOG by your side
                </p>

                <div className="features__grid">
                    {features.map((f, idx) => (
                        <div className="features__card" key={idx} style={{ borderBottom: `6px solid ${f.iconBg}` }}>
                            <div
                                className="features__icon-wrap"
                                style={{ backgroundColor: f.iconBg }}
                            >
                                <span className="features__icon">{f.icon}</span>
                            </div>
                            <h3 className="features__card-title" style={{ color: f.iconBg }}>
                                {f.title}
                            </h3>
                            <ul className="features__card-list" style={{ width: '100%', listStyleType: 'disc', paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--color-text-body)', textAlign: 'left', lineHeight: '1.4' }}>
                                {f.list.map((item, i) => (
                                    <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="features__cta">
                    <a href="#signup" className="btn btn-teal">Explore Plans</a>
                </div>
            </div>
        </section>
    );
};

export default Features;
