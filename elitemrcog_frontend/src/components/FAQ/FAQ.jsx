import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
    const faqs = [
        {
            question: "Will I receive daily homework stations?",
            answer: "Yes. You'll receive structured daily homework stations throughout the course to reinforce learning and build exam confidence."
        },
        {
            question: "Are the recall stations based on recent exams?",
            answer: "Yes. Our library is continuously updated with the latest exam recalls, together with current GTG, TOG and NICE guidance."
        },
        {
            question: "How long will I have access to the course?",
            answer: "You'll have one year of access from the date of your subscription."
        },
        {
            question: "Are the live classes recorded?",
            answer: "Yes. All live sessions are recorded and uploaded on the same day, so you can revisit them anytime during your subscription."
        }
    ];

    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFaq = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    return (
        <section className="faq-section">
            <div className="faq-container">
                <h2 className="faq-title">Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="faq-question">
                                {faq.question}
                                <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
export default FAQ;
