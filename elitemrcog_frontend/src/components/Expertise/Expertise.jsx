import React from 'react';
import './Expertise.css';
import classroomimage from '../../assets/images/teachingexpertise.png';
import mentorImg from '../../assets/images/mentorimage.png';
import studyMaterialImg from '../../assets/images/extensivestudymaterial.png';
import interactiveClassImg from '../../assets/images/interactiveliveclass.png';
import communitySupportImg from '../../assets/images/comunitysupport.png';

const PeopleIcon = () => (
    <span className="expertise__bullet-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
    </span>
);

export default function Expertise() {
    return (
        <section className="expertise" id="expertise">

            {/* ─── "Our Features" header ───────────────────── */}
            <div className="expertise__block--features-header" style={{ background: '#fff', padding: '5rem 0 1rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="section-heading" style={{ marginBottom: '1rem' }}>
                        Our <span className="highlight-teal">Features</span>
                    </h2>
                    <p className="section-subheading">
                        Discover why hundreds of students trust Elite MRCOG for exam preparation.
                    </p>
                </div>
            </div>

            {/* ─── Feature 1: Unlimited station recordings ─── */}
            <div className="expertise__block expertise__block--white">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – Image */}
                        <div className="expertise__visual" style={{ textAlign: 'center' }}>
                            <img 
                                src={studyMaterialImg} 
                                alt="Extensive study materials" 
                                style={{ width: '100%', maxWidth: '420px', margin: '0 auto', display: 'block', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
                            />
                        </div>
                        {/* Right – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>1. Extensive</span><br />
                                <span style={{ color: 'var(--color-teal)' }}>Study Materials</span>
                            </h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 25px 0', maxWidth: '300px' }}>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                                <span style={{ color: '#D9B44A', fontSize: '1.2rem', margin: '0 15px' }}>⭐</span>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                            </div>

                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>300+ Meticulously Written Recall Stations</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Complete Station Templates with Role Player Instructions</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Domain-wise Answer Keys</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Regularly Updated with Latest Guidelines & Recent Exam Recalls</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 2: Expert Mentor Support ─────────── */}
            <div className="expertise__block expertise__block--light">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>2. Expert</span><br />
                                <span style={{ color: 'var(--color-teal)' }}>Mentor Support</span>
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 25px 0', maxWidth: '300px' }}>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                                <span style={{ color: '#D9B44A', fontSize: '1.2rem', margin: '0 15px' }}>⭐</span>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                            </div>
                            <p style={{marginBottom: '1rem', color: 'var(--color-text-body)'}}>
                                Get guidance from mentors who have successfully navigated the MRCOG journey.
                            </p>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Direct access to mentors</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Personalised feedback</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Discussion of difficult stations</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Continuous support until exam day</span>
                                </li>
                            </ul>
                        </div>
                        {/* Right – Image */}
                        <div className="expertise__visual--right">
                            <div className="expertise__student-wrap">
                                <div className="expertise__pink-circle"></div>
                                <img
                                    src={mentorImg}
                                    alt="Expert Mentor"
                                    className="expertise__student-img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 3: Interactive Live Classes ────── */}
            <div className="expertise__block expertise__block--white">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – Image */}
                        <div className="expertise__visual" style={{ textAlign: 'center' }}>
                            <img 
                                src={interactiveClassImg} 
                                alt="Interactive Live Classes" 
                                style={{ width: '100%', maxWidth: '420px', margin: '0 auto', display: 'block', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
                            />
                        </div>
                        {/* Right – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>3. Interactive</span><br />
                                <span style={{ color: 'var(--color-teal)' }}>Live Classes</span>
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 25px 0', maxWidth: '300px' }}>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                                <span style={{ color: '#D9B44A', fontSize: '1.2rem', margin: '0 15px' }}>⭐</span>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                            </div>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Participate in real-time discussions</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Case-based learning approach</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {/* ─── Feature 4: Join the Elite MRCOG Community ─── */}
            <div className="expertise__block expertise__block--light">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>4. Join the</span><br />
                                <span style={{ color: 'var(--color-teal)' }}>Elite MRCOG Community</span>
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 25px 0', maxWidth: '300px' }}>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                                <span style={{ color: '#D9B44A', fontSize: '1.2rem', margin: '0 15px' }}>⭐</span>
                                <span style={{ flex: 1, height: '1px', background: '#D9B44A' }}></span>
                            </div>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Free WhatsApp Community</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Free Telegram Community</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Weekly Free Webinar Announcements</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Latest Exam Recall Updates</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Mentor Announcements & Study Support</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <span style={{color: '#fff', background: 'var(--color-teal)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '0.8rem', flexShrink: 0}}>✓</span>
                                    <span>Connect with MRCOG Aspirants Worldwide</span>
                                </li>
                            </ul>
                        </div>
                        {/* Right – Image */}
                        <div className="expertise__visual--right" style={{ textAlign: 'center' }}>
                            <img 
                                src={communitySupportImg} 
                                alt="Join the Community" 
                                style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'block', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
                            />
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
