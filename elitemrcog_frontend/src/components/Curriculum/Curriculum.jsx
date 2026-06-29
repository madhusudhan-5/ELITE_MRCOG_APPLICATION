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
                        <img src={part1Img} alt="Part 1" className="curriculum-icon" />
                        <h3 className="curriculum-part">Part 1</h3>
                        <p className="curriculum-desc">
                            Master the basic sciences with our extensive library of SBA questions, video lectures, and mock exams.
                        </p>
                    </div>
                    <div className="curriculum-card">
                        <img src={part2Img} alt="Part 2" className="curriculum-icon" />
                        <h3 className="curriculum-part">Part 2</h3>
                        <p className="curriculum-desc">
                            Deep dive into clinical practice with high-yield notes, clinical guidelines, and case-based discussions.
                        </p>
                    </div>
                    <div className="curriculum-card">
                        <img src={part3Img} alt="Part 3" className="curriculum-icon" />
                        <h3 className="curriculum-part">Part 3</h3>
                        <p className="curriculum-desc">
                            Ace the OSCE with our communication skills workshops, simulated stations, and one-on-one mentorship.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Curriculum;
