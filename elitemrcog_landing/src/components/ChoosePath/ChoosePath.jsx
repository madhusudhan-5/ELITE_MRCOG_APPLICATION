import React from 'react';
import './ChoosePath.css';

const ChoosePath = () => {
    return (
        <section className="choosepath section" id="about">
            <div className="container">
                <h2 className="section-heading">
                    What is <span className="highlight-teal">Elite MRCOG?</span>
                </h2>
                <p className="section-subheading">
                    Your journey to becoming a confident, exam ready O&amp;G specialist begins here.
                    With <strong>Elite MRCOG</strong>, you gain access to curated resources, live mentor-led sessions,
                    immersive case-based learning, and structured exam preparation tailored to MRCOG Part 3.
                    Everything you need delivered in one powerful platform.
                </p>

                <div className="choosepath__grid">
                    {/* Self-Study Card */}
                    <div className="choosepath__card">
                        <img
                            src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=700&q=80"
                            alt="Self-Study Resources"
                            className="choosepath__card-img"
                        />
                        <div className="choosepath__card-overlay"></div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Self-Study Resources</h3>
                            <a href="#features" className="choosepath__btn choosepath__btn--outline">
                                Explore Library
                            </a>
                        </div>
                    </div>

                    {/* Mentor-Guided Card */}
                    <div className="choosepath__card">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                            alt="Mentor-Guided Learning"
                            className="choosepath__card-img"
                        />
                        <div className="choosepath__card-overlay choosepath__card-overlay--dark"></div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Mentor-Guided Learning</h3>
                            <a href="#pricing" className="choosepath__btn choosepath__btn--solid">
                                Join Course
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChoosePath;
