import React from 'react';
import './Pricing.css';

const plans = [
    {
        id: 'starter',
        name: 'Immerse + Practice\nStarter',
        highlight: false,
        checkColor: '#94A3B8',
        cta: 'Try for free',
        ctaFeatured: false,
        items: [
            'Reading Library',
            'Video Library',
            'Reading Library + Video Library',
            'Elite Bootcamp (16 Weeks)',
            'One-to-One ELITE Exclusive Mentorship',
            '1 Mock Exam (Full Circuit)',
        ],
    },
    {
        id: 'pro',
        name: '3-in-1 Pro Bundle',
        badge: 'BEST!',
        highlight: true,
        checkColor: '#F5A623',
        cta: 'Regular license',
        ctaFeatured: true,
        items: [
            'Full Practice Library',
            'Reading Materials',
            '250+ Video sessions',
            'Premium Learning Access',
            'Will help to learn Plan',
        ],
    },
    {
        id: 'premium',
        name: 'Premium Mastery Pack',
        highlight: false,
        checkColor: '#00CBB8',
        cta: 'Extended license',
        ctaFeatured: false,
        items: [
            'Components-driven system',
            'Sales-boosting landing pages',
            'Awesome Feather icons pack',
            'Themed into 3 different styles',
        ],
    },
];

const Pricing = () => {
    return (
        <section className="pricing section" id="pricing">
            <div className="container">
                <h2 className="pricing__heading">Save more with bundles</h2>

                <div className="pricing__grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`pricing__card${plan.highlight ? ' pricing__card--featured' : ''}`}
                        >
                            <div className="pricing__card-header">
                                <h3 className="pricing__plan-name" style={{ whiteSpace: 'pre-line' }}>{plan.name}</h3>
                                {plan.badge && (
                                    <span className="pricing__badge">{plan.badge}</span>
                                )}
                            </div>

                            <ul className="pricing__features">
                                {plan.items.map((item, i) => (
                                    <li key={i} className="pricing__feature-item">
                                        <span
                                            className="pricing__check"
                                            style={{ background: plan.checkColor }}
                                        >
                                            ✓
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#signup"
                                className={`pricing__cta${plan.ctaFeatured ? ' pricing__cta--featured' : ''}`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
