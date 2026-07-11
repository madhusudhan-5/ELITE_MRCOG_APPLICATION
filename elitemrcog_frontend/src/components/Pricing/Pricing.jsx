import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import './Pricing.css';
import api from '../../services/api';

const Pricing = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const response = await api.get('/api/subscriptions/bundles/');
                setBundles(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching bundles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBundles();
    }, []);

    const renderChecklist = (bundle, index) => {
        const features = [];
        if (bundle.includes_reading) features.push('Reading Library');
        if (bundle.includes_video) features.push('Video Library');
        if (bundle.includes_mock_exam) features.push('Mock Exams');
        
        // Ensure at least some features if none are strictly checked but libraries included
        if (features.length === 0 && bundle.included_libraries && bundle.included_libraries.length > 0) {
            bundle.included_libraries.forEach(lib => {
                features.push(lib.charAt(0).toUpperCase() + lib.slice(1).replace('_', ' '));
            });
        }
        
        // Add some standard ones based on short description or general access if needed
        if (features.length === 0) {
             features.push('Full Course Access');
        }

        let checkBgColor = '#e2e8f0';
        let checkColor = '#64748b';
        
        if (bundle.is_featured) {
            checkBgColor = '#F5A623';
            checkColor = '#ffffff';
        } else if (index % 2 !== 0 || index === 2) {
            checkBgColor = '#ccfbf1';
            checkColor = '#0f766e';
        }

        return features.map((item, i) => (
            <li key={i} className="pricing__feature-item">
                <span
                    className="pricing__check"
                    style={{ background: checkBgColor, color: checkColor }}
                >
                    ✓
                </span>
                <span>{item}</span>
            </li>
        ));
    };

    if (loading) {
        return (
            <section className="pricing section" id="pricing">
                <div className="container" style={{ textAlign: 'center' }}>Loading bundles...</div>
            </section>
        );
    }

    return (
        <section className="pricing section" id="pricing">
            <div className="container">
                <h2 className="pricing__heading" style={{ color: '#1e293b' }}>Save more with bundles</h2>

                <div className="pricing__grid">
                    {bundles.map((bundle, index) => (
                        <div
                            key={bundle.id}
                            className={`pricing__card${bundle.is_featured ? ' pricing__card--featured' : ''}`}
                        >
                            <div className="pricing__card-header">
                                <h3 className="pricing__plan-name" style={{ whiteSpace: 'pre-line' }}>{bundle.title}</h3>
                                {bundle.is_featured && (
                                    <span className="pricing__badge">BEST!</span>
                                )}
                                <div style={{marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                                    {bundle.currency} {bundle.price}
                                </div>
                            </div>

                            <ul className="pricing__features">
                                {renderChecklist(bundle, index)}
                            </ul>

                            <Link
                                to="/register"
                                className={`pricing__cta${bundle.is_featured ? ' pricing__cta--featured' : ''}`}
                            >
                                <ShoppingCart size={18} />
                                Buy now
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
