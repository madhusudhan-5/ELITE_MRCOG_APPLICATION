import React from 'react';
import './Hero.css';
import heroGraduate from '../../assets/images/1b70f2b335533974a80fc333011bce813bfbfe3e.png';


const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="container hero__inner">
                {/* Left Content */}
                <div className="hero__content">
                    <h1 className="hero__headline">
                        Crack <span className="highlight-navy-bold">MRCOG</span>{' '}
                        <span className="highlight-teal">With</span>
                        <br />Confidence
                    </h1>
                    <p className="hero__subtext">
                        Ready to master the MRCOG?<br />
                        Unlock elite, mentor-crafted resources designed by those<br />
                        who've successfully walked the journey before you. Step<br />
                        in, level up, and start your path to success.
                    </p>
                    <div className="hero__actions">
                        <a href="#signup" className="btn btn-primary hero__btn-main">Join for free</a>
                        <button className="hero__btn-watch">
                            <span className="hero__btn-play">&#9654;</span>
                            <span className="hero__btn-watch-text">Watch how it works</span>
                        </button>
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
                                <rect width="24" height="24" rx="6" fill="#2F327D" />
                                <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <rect x="4" y="5" width="16" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <div>
                            <div className="hero__card-stat">150k</div>
                            <div className="hero__card-label">Assisted Student</div>
                        </div>
                    </div>

                    {/* Floating Card: Congratulations */}
                    <div className="hero__card hero__card--congrats">
                        <div className="hero__card-icon hero__card-icon--orange">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="6" fill="#F5A623" />
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="white" />
                            </svg>
                        </div>
                        <div>
                            <div className="hero__card-stat">Congratulations</div>
                            <div className="hero__card-label">Your Course completed</div>
                        </div>
                    </div>

                    {/* Floating Card: MRCOG Part 3 */}
                    <div className="hero__card hero__card--exam">
                        <div className="hero__card-avatar">
                            <img
                                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&q=80"
                                alt="Mentor"
                            />
                            <span className="hero__card-dot"></span>
                        </div>
                        <div className="hero__card-exam-info">
                            <div className="hero__card-stat">MRCOG Part 3 Exam</div>
                            <div className="hero__card-label">Today at 12.00 PM</div>
                            <button className="hero__card-join">Join Now</button>
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

