import React from 'react';
import './ChoosePath.css';

const ChoosePath = () => {
    return (
        <section className="choosepath section" id="about">
            <div className="container">
                <h2 className="section-heading">
                    Why Choose <span className="highlight-teal">ELITE MRCOG?</span>
                </h2>
                <p className="section-subheading">
                    We provide an immersive learning experience with everything you need to succeed in your MRCOG journey.
                </p>

                <div className="choosepath__grid">
                    {/* Full Course Access Card */}
                    <div className="choosepath__card">
                        <img
                            src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=700&q=80"
                            alt="Full Course Access"
                            className="choosepath__card-img"
                        />
                        <div className="choosepath__card-overlay"></div>
                        <div className="choosepath__card-play">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                                <path d="M10 8l6 4-6 4V8z" fill="white" />
                            </svg>
                        </div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Full Course Access</h3>
                        </div>
                    </div>

                    {/* Mock Tests Card */}
                    <div className="choosepath__card">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                            alt="Mock Tests"
                            className="choosepath__card-img"
                        />
                        <div className="choosepath__card-overlay choosepath__card-overlay--dark"></div>
                        <div className="choosepath__card-play">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
                                <path d="M10 8l6 4-6 4V8z" fill="white" />
                            </svg>
                        </div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Mock Tests</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChoosePath;
