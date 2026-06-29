import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { BookOpen, PlayCircle, ClipboardList, Star, Check, X, ShoppingCart, Info } from 'lucide-react';
import './SubscriptionPage.css';

const LibraryBadge = ({ type }) => {
    const config = {
        reading: { label: 'Reading', icon: <BookOpen size={12} />, cls: 'badge-reading' },
        video: { label: 'Video', icon: <PlayCircle size={12} />, cls: 'badge-video' },
        mock_exam: { label: 'Mock Exam', icon: <ClipboardList size={12} />, cls: 'badge-mock' },
    };
    const c = config[type] || {};
    return (
        <span className={`sub-lib-badge ${c.cls}`}>
            {c.icon} {c.label}
        </span>
    );
};

const BundleModal = ({ bundle, onClose, onAddToCart, adding }) => {
    if (!bundle) return null;
    return (
        <div className="sub-modal-overlay" onClick={onClose}>
            <div className="sub-modal" onClick={e => e.stopPropagation()}>
                <button className="sub-modal-close" onClick={onClose}><X size={20} /></button>
                {bundle.thumbnail && (
                    <img src={bundle.thumbnail} alt={bundle.title} className="sub-modal-img" />
                )}
                <div className="sub-modal-body">
                    <h2 className="sub-modal-title">{bundle.title}</h2>
                    <div className="sub-modal-libs">
                        {bundle.included_libraries.map(lib => <LibraryBadge key={lib} type={lib} />)}
                    </div>
                    <p className="sub-modal-desc">{bundle.description}</p>
                    <div className="sub-modal-includes">
                        <h4>What's Included:</h4>
                        <ul>
                            {bundle.includes_reading && <li><Check size={14} className="check-icon" /> Full access to Reading Library — Easy Reads & Course Materials</li>}
                            {bundle.includes_video && <li><Check size={14} className="check-icon" /> Full access to Video Library — HD lectures</li>}
                            {bundle.includes_mock_exam && <li><Check size={14} className="check-icon" /> Full access to Mock Exam — practice papers with explanations</li>}
                            <li><Check size={14} className="check-icon" /> Valid for {bundle.duration_days} days from purchase</li>
                            <li><Check size={14} className="check-icon" /> Immediate access after payment</li>
                        </ul>
                    </div>
                    <div className="sub-modal-footer">
                        <span className="sub-modal-price">
                            <span className="sub-modal-currency">
                                {bundle.currency === 'INR' ? '₹' : (bundle.currency === 'GBP' ? '£' : bundle.currency)}
                            </span>
                            {parseFloat(bundle.price).toFixed(0)}
                        </span>
                        <button
                            className="sub-modal-add-btn"
                            onClick={() => onAddToCart(bundle)}
                            disabled={adding}
                        >
                            {adding ? 'Adding...' : <><ShoppingCart size={16} /> Add to Cart</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const { refresh: refreshCart } = useCart();
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [feedback, setFeedback] = useState({});

    useEffect(() => {
        api.get('/api/subscriptions/bundles/')
            .then(res => setBundles(res.data.results || res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = async (bundle) => {
        setAddingId(bundle.id);
        try {
            await api.post('/api/subscriptions/cart/add/', { bundle_id: bundle.id });
            setFeedback(prev => ({ ...prev, [bundle.id]: 'added' }));
            refreshCart();
            setSelectedBundle(null);
            setTimeout(() => setFeedback(prev => ({ ...prev, [bundle.id]: null })), 2500);
        } catch (err) {
            if (err.response?.status === 200) {
                setFeedback(prev => ({ ...prev, [bundle.id]: 'already' }));
            } else {
                setFeedback(prev => ({ ...prev, [bundle.id]: 'error' }));
            }
            setTimeout(() => setFeedback(prev => ({ ...prev, [bundle.id]: null })), 2500);
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <div className="sub-loading">
                <div className="sub-spinner" />
                <p>Loading subscription plans...</p>
            </div>
        );
    }

    return (
        <div className="subscription-page">
            <div className="sub-header">
                <h1>Choose Your Plan</h1>
                <p>Unlock Reading, Video, and Mock Exam libraries for your MRCOG preparation.</p>
                <button className="sub-view-cart-btn" onClick={() => navigate('/dashboard/cart')}>
                    <ShoppingCart size={16} /> View Cart
                </button>
            </div>

            {bundles.length === 0 && (
                <div className="sub-empty">
                    <p>No subscription plans available yet. Check back soon!</p>
                </div>
            )}

            <div className="sub-grid">
                {bundles.map(bundle => {
                    const fb = feedback[bundle.id];
                    return (
                        <div key={bundle.id} className={`sub-card ${bundle.is_featured ? 'featured' : ''}`}>
                            {bundle.is_featured && <div className="sub-featured-ribbon">Best Value</div>}

                            <div className="sub-card-img-wrap">
                                {bundle.thumbnail
                                    ? <img src={bundle.thumbnail} alt={bundle.title} className="sub-card-img" />
                                    : <div className="sub-card-img-placeholder"><Star size={40} /></div>
                                }
                            </div>

                            <div className="sub-card-body">
                                <h3 className="sub-card-title">{bundle.title}</h3>
                                <p className="sub-card-desc">{bundle.short_description}</p>

                                <div className="sub-card-libs">
                                    {bundle.included_libraries.map(lib => <LibraryBadge key={lib} type={lib} />)}
                                </div>

                                <div className="sub-card-price">
                                    <span className="sub-card-currency">
                                        {bundle.currency === 'INR' ? '₹' : (bundle.currency === 'GBP' ? '£' : bundle.currency)}
                                    </span>
                                    <span className="sub-card-amount">{parseFloat(bundle.price).toFixed(0)}</span>
                                    <span className="sub-card-duration">/ {bundle.duration_days} days</span>
                                </div>

                                <div className="sub-card-actions">
                                    <button
                                        className="sub-info-btn"
                                        onClick={() => setSelectedBundle(bundle)}
                                        title="View details"
                                    >
                                        <Info size={15} /> Details
                                    </button>
                                    <button
                                        className={`sub-add-btn ${fb === 'added' ? 'success' : ''}`}
                                        onClick={() => handleAddToCart(bundle)}
                                        disabled={addingId === bundle.id}
                                    >
                                        {fb === 'added'
                                            ? '✓ Added!'
                                            : fb === 'already'
                                            ? 'In Cart'
                                            : addingId === bundle.id
                                            ? 'Adding...'
                                            : <><ShoppingCart size={14} /> Add to Cart</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <BundleModal
                bundle={selectedBundle}
                onClose={() => setSelectedBundle(null)}
                onAddToCart={handleAddToCart}
                adding={addingId === selectedBundle?.id}
            />
        </div>
    );
};

export default SubscriptionPage;
