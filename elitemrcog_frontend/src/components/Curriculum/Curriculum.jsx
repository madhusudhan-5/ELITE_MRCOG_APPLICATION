import React from 'react';
import './Curriculum.css';
import part1Img from '../../assets/images/curriculum_part1.png';
import part2Img from '../../assets/images/curriculum_part2.png';
import part3Img from '../../assets/images/curriculum_part3.png';

const Curriculum = () => {
    return (
        <section className="curriculum-section">
            <div className="curriculum-container">
                <h2 className="curriculum-title">Comprehensive MRCOG Curriculum</h2>
                <div className="curriculum-grid">
                    <div className="curriculum-card">
                        <div className="curriculum-badge">PART 1</div>
                        <h3 className="curriculum-status">COMING SOON</h3>
                        <div className="curriculum-divider"><span></span></div>
                        <img src={part1Img} alt="Part 1" className="curriculum-icon" />
                        <p className="curriculum-desc">
                            Comprehensive learning<br/>for MRCOG Part 1 launching soon.
                        </p>
                    </div>
                    <div className="curriculum-card">
                        <div className="curriculum-badge">PART 2</div>
                        <h3 className="curriculum-status">COMING SOON</h3>
                        <div className="curriculum-divider"><span></span></div>
                        <img src={part2Img} alt="Part 2" className="curriculum-icon" />
                        <p className="curriculum-desc">
                            Comprehensive learning<br/>for MRCOG Part 2 launching soon.
                        </p>
                    </div>
                    <div className="curriculum-card">
                        <div className="curriculum-badge">PART 3</div>
                        <h3 className="curriculum-status curriculum-status--dark">COMPLETE LEARNING PLATFORM</h3>
                        <div className="curriculum-divider"><span></span></div>
                        <img src={part3Img} alt="Part 3" className="curriculum-icon" />
                        <p className="curriculum-desc">
                            Your complete companion for<br/>MRCOG Part 3 success.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Curriculum;
