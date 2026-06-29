import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
    const faqs = [
        {
            question: "How long do I have access to the materials?",
            answer: "You will have uninterrupted access for the duration of your chosen subscription plan."
        },
        {
            question: "Are the mock exams timed?",
            answer: "Yes, our platform simulates the real exam environment, including strict time limits."
        },
        {
            question: "Can I access the content on my mobile device?",
            answer: "Absolutely. Our platform is fully responsive and optimized for all mobile devices."
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
