import React, { useState, useEffect } from 'react';
import './Testimonials.css';
import api from '../../services/api';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await api.get('/api/content/testimonials/');
                // Handle both paginated and non-paginated responses
                setTestimonials(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching testimonials:", error);
            }
        };

        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (testimonials.length === 0) return;
        
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 5000); // Auto-scroll every 5 seconds

        return () => clearInterval(interval);
    }, [testimonials]);

    const handleNext = () => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
    };

    const currentTestimonial = testimonials[activeIndex];

    if (testimonials.length === 0) {
        return null; // Don't show the section if no testimonials exist
    }

    // Determine photo URL (using a placeholder if not provided)
    const photoUrl = currentTestimonial?.photo 
        ? currentTestimonial.photo 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTestimonial?.student_name || 'Student')}&background=random`;

    return (
        <section className="testimonials section" id="testimonials">
            <div className="container testimonials__inner">
                {/* Left Content */}
                <div className="testimonials__content">
                    <div className="testimonials__eyebrow">
                        <span className="testimonials__eyebrow-line"></span>
                        TESTIMONIAL
                    </div>
                    <h2 className="testimonials__title">What Our Students Say</h2>
                    <p className="testimonials__desc">
                        Elite MRCOG has helped thousands of students achieve their dream of passing the exam.
                    </p>
                    <p className="testimonials__desc">
                        Our structured approach and dedicated mentors make all the difference.
                    </p>
                    <p className="testimonials__desc">
                        Ready to join them? Read their success stories below.
                    </p>

                    <div className="testimonials__actions">
                        <a href="/testimonials" className="testimonials__action-btn">
                            Read more reviews
                            <span className="testimonials__action-arrow">→</span>
                        </a>
                        <a href="/testimonials" className="testimonials__action-btn">
                            Video Testimonials
                            <span className="testimonials__action-arrow">→</span>
                        </a>
                    </div>
                </div>

                {/* Right: Photo + quote card */}
                <div className="testimonials__visual" style={{ opacity: 1, transition: 'opacity 0.5s ease-in-out' }}>
                    <div className="testimonials__photo-wrap">
                        <img
                            src={photoUrl}
                            alt="Student Success"
                            className="testimonials__photo"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    {/* Quote card overlaid at bottom-right */}
                    <div className="testimonials__quote-card">
                        <p className="testimonials__quote">
                            "{currentTestimonial?.quote}"
                        </p>
                        <div className="testimonials__reviewer">
                            <strong className="testimonials__reviewer-name">{currentTestimonial?.student_name}</strong>
                            <div className="testimonials__stars">
                                {'⭐'.repeat(currentTestimonial?.rating || 5)}
                                {currentTestimonial?.exam_passed && (
                                    <span className="testimonials__review-count">{currentTestimonial.exam_passed}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Next arrow button */}
                    <button className="testimonials__next-btn" aria-label="Next testimonial" onClick={handleNext}>›</button>
                    {/* Dot indicators */}
                    <div className="testimonials__dots">
                        {testimonials.map((_, idx) => (
                            <span 
                                key={idx} 
                                className={`testimonials__dot ${idx === activeIndex ? 'testimonials__dot--active' : ''}`}
                                onClick={() => setActiveIndex(idx)}
                                style={{ cursor: 'pointer' }}
                            ></span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

