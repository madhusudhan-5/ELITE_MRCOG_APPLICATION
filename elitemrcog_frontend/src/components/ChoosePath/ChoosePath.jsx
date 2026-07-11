import React from 'react';
import './ChoosePath.css';
import imgCourse from '../../assets/images/fullcourseaccess.png';
import imgMock from '../../assets/images/mocktests.png';

const ChoosePath = () => {
    return (
        <section className="choosepath section" id="about">
            <div className="container">
                <h2 className="section-heading">
                    Your Complete <span className="highlight-teal">MRCOG Part 3 companion</span>
                </h2>
                <p className="section-subheading">
                    Structured learning, recent exam recalls, live OSCE practice, personalised feedback and continuous mentorship - all in one place
                </p>
                <h3 style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem', color: 'var(--color-navy)', fontSize: '2rem' }}>
                    Why Choose Elite MRCOG?
                </h3>

                <div className="choosepath__grid">
                    {/* Full Course Access Card */}
                    <div className="choosepath__card">
                        <div className="choosepath__image-wrapper">
                            <img
                                src={imgCourse}
                                alt="Full Course Access"
                                className="choosepath__card-img"
                            />
                        </div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Full Course Access</h3>
                        </div>
                    </div>

                    {/* Mock Tests Card */}
                    <div className="choosepath__card">
                        <div className="choosepath__image-wrapper">
                            <img
                                src={imgMock}
                                alt="Online Mock Circuits"
                                className="choosepath__card-img"
                            />
                        </div>
                        <div className="choosepath__card-content">
                            <h3 className="choosepath__card-title">Online Mock Circuits</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChoosePath;
