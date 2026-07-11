import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import heroGraduate from '../../assets/images/heromentors.png';


const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="container hero__inner">
                {/* Left Content */}
                <div className="hero__content">
                    <h1 className="hero__headline">
                        Elite <span className="highlight-navy-bold">MRCOG</span> -<br />
                        <span className="highlight-teal">Guiding You</span> to MRCOG Success
                    </h1>
                    <p className="hero__subtext">
                        Everything You Need to Pass MRCOG Part 3 — <br />Structured Courses • Recent Exam Recall Discussions • Live OSCE Practice • Personalised Feedback • Continuous mentorship
                    </p>
                    <div className="hero__actions">
                        <Link to="/register" className="btn btn-primary hero__btn-main">Join for free</Link>
                        <a href="https://www.youtube.com/watch?v=NWUBU9bPAVU" target="_blank" rel="noopener noreferrer" className="hero__btn-watch" style={{ textDecoration: 'none', textAlign: 'left' }}>
                            <span className="hero__btn-play">&#9654;</span>
                            <span className="hero__btn-watch-text">
                                <div style={{ lineHeight: 1.2 }}>Watch a 10-Minute Demo</div>
                                <small style={{ fontSize: '0.85em', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>Learn the Elite Way</small>
                            </span>
                        </a>
                    </div>

                </div>

                {/* Right Visual */}
                <div className="hero__visual">
                    {/* Graduate photo background */}
                    <div className="hero__photo-wrap">
                        <img
                            src={heroGraduate}
                            alt="MRCOG Graduate"
                            className="hero__photo hero__photo--graduate"
                        />
                    </div>

                    {/* Floating Card: 150k */}
                    <div className="hero__card hero__card--students">
                        <div className="hero__card-icon">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="6" fill="var(--color-navy)" />
                                <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <rect x="4" y="5" width="16" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <div>
                            <div className="hero__card-stat">150k</div>
                            <div className="hero__card-label">Assisted Student</div>
                        </div>
                    </div>


                    {/* Floating icon top-right */}
                    <div className="hero__float-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="6" fill="#E05780" />
                            <path d="M7 14l3-3 2 2 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

