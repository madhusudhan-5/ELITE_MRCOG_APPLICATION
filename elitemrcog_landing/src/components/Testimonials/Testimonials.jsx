import React from 'react';
import './Testimonials.css';
import studentImage1 from '../../assets/images/4c6498cce2e253cf38639b4ba215c7df58ce5a53.jpg';

const Testimonials = () => {
    return (
        <section className="testimonials section" id="testimonials">
            <div className="container testimonials__inner">
                {/* Left Content */}
                <div className="testimonials__content">
                    <div className="testimonials__eyebrow">
                        <span className="testimonials__eyebrow-line"></span>
                        TESTIMONIAL
                    </div>
                    <h2 className="testimonials__title">What They Say?</h2>
                    <p className="testimonials__desc">
                        TOTC has got more than 100k positive ratings from our users
                        around the world.
                    </p>
                    <p className="testimonials__desc">
                        Some of the students and teachers were greatly helped by the
                        Skilline.
                    </p>
                    <p className="testimonials__desc">
                        Are you too? Please give your assessment
                    </p>

                    <div className="testimonials__actions">
                        <a href="/testimonials" className="testimonials__action-btn">
                            Write your assessment
                            <span className="testimonials__action-arrow">→</span>
                        </a>
                        <a href="/testimonials" className="testimonials__action-btn">
                            Video Testimonials
                            <span className="testimonials__action-arrow">→</span>
                        </a>
                    </div>
                </div>

                {/* Right: Photo + quote card */}
                <div className="testimonials__visual">
                    <div className="testimonials__photo-wrap">
                        <img
                            src={studentImage1}
                            alt="Gloria Rose - Student"
                            className="testimonials__photo"
                        />
                    </div>
                    {/* Quote card overlaid at bottom-right */}
                    <div className="testimonials__quote-card">
                        <p className="testimonials__quote">
                            "Thank you so much for your help. It's exactly what I've been
                            looking for. You won't regret it. It really saves me time and
                            effort. TOTC is exactly what our business has been lacking."
                        </p>
                        <div className="testimonials__reviewer">
                            <strong className="testimonials__reviewer-name">Gloria Rose</strong>
                            <div className="testimonials__stars">
                                ⭐⭐⭐⭐⭐
                                <span className="testimonials__review-count">12 reviews at Yelp</span>
                            </div>
                        </div>
                    </div>
                    {/* Next arrow button */}
                    <button className="testimonials__next-btn" aria-label="Next testimonial">›</button>
                    {/* Dot indicators */}
                    <div className="testimonials__dots">
                        <span className="testimonials__dot testimonials__dot--active"></span>
                        <span className="testimonials__dot"></span>
                        <span className="testimonials__dot"></span>
                        <span className="testimonials__dot"></span>
                        <span className="testimonials__dot"></span>
                        <span className="testimonials__dot"></span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

