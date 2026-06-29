import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingCart, ArrowRight, BookOpen, PlayCircle, ClipboardList } from 'lucide-react';
import './CartPage.css';

const LibraryIcon = ({ type }) => {
    if (type === 'reading') return <BookOpen size={13} />;
    if (type === 'video') return <PlayCircle size={13} />;
    return <ClipboardList size={13} />;
};

const CartPage = () => {
    const navigate = useNavigate();
    const { refresh: refreshCart } = useCart();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [coupon, setCoupon] = useState('');
    const [couponResult, setCouponResult] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const fetchCart = async () => {
        try {
            const res = await api.get('/api/subscriptions/cart/');
            setCart(res.data);
        } catch (err) {
            console.error('Failed to load cart', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const handleRemove = async (itemId) => {
        setRemovingId(itemId);
        try {
            await api.delete(`/api/subscriptions/cart/remove/${itemId}/`);
            await fetchCart();
            refreshCart();
        } catch (err) {
            console.error('Failed to remove item', err);
        } finally {
            setRemovingId(null);
        }
    };

    const handleApplyCoupon = async () => {
        if (!coupon.trim()) return;
        setApplyingCoupon(true);
        setCouponResult(null);
        try {
            const res = await api.post('/api/subscriptions/coupon/apply/', { code: coupon });
            setCouponResult({ type: 'success', ...res.data });
        } catch (err) {
            setCouponResult({ type: 'error', message: err.response?.data?.error || 'Invalid coupon.' });
        } finally {
            setApplyingCoupon(false);
        }
    };

    const subtotal = parseFloat(cart?.total || 0);
    const discount = couponResult?.type === 'success' ? parseFloat(couponResult.discount_amount) : 0;
    const finalTotal = couponResult?.type === 'success' ? parseFloat(couponResult.new_total) : subtotal;

    if (loading) {
        return (
            <div className="cart-loading">
                <div className="cart-spinner" />
                <p>Loading your cart...</p>
            </div>
        );
    }

    const isEmpty = !cart || cart.item_count === 0;

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1><ShoppingCart size={24} /> Your Cart</h1>
                {!isEmpty && (
                    <button
                        className="cart-continue-btn"
                        onClick={() => navigate('/dashboard/subscription')}
                    >
                        + Add More Plans
                    </button>
                )}
            </div>

            {isEmpty ? (
                <div className="cart-empty">
                    <ShoppingCart size={60} className="cart-empty-icon" />
                    <h3>Your cart is empty</h3>
                    <p>Browse our subscription plans to unlock content.</p>
                    <button className="cart-empty-btn" onClick={() => navigate('/dashboard/subscription')}>
                        View Plans
                    </button>
                </div>
            ) : (
                <div className="cart-body">
                    {/* Cart Items */}
                    <div className="cart-items-section">
                        <h2 className="cart-section-title">
                            {cart.item_count} {cart.item_count === 1 ? 'Item' : 'Items'}
                        </h2>
                        {cart.items.map(item => (
                            <div key={item.id} className="cart-item-card">
                                <div className="cart-item-img-wrap">
                                    {item.bundle.thumbnail
                                        ? <img src={item.bundle.thumbnail} alt={item.bundle.title} />
                                        : <div className="cart-item-img-ph"><ShoppingCart size={24} /></div>
                                    }
                                </div>
                                <div className="cart-item-info">
                                    <h3>{item.bundle.title}</h3>
                                    <p>{item.bundle.short_description}</p>
                                    <div className="cart-item-libs">
                                        {item.bundle.included_libraries.map(lib => (
                                            <span key={lib} className={`cart-lib-chip chip-${lib}`}>
                                                <LibraryIcon type={lib} />
                                                {lib === 'mock_exam' ? 'Mock Exam' : lib.charAt(0).toUpperCase() + lib.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="cart-item-duration">Valid for {item.bundle.duration_days} days</span>
                                </div>
                                <div className="cart-item-right">
                                    <span className="cart-item-price">
                                        {item.bundle.currency} {parseFloat(item.bundle.price).toFixed(2)}
                                    </span>
                                    <button
                                        className="cart-remove-btn"
                                        onClick={() => handleRemove(item.id)}
                                        disabled={removingId === item.id}
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <aside className="cart-summary">
                        <h2 className="cart-section-title">Order Summary</h2>

                        <div className="cart-summary-row">
                            <span>Subtotal ({cart.item_count} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="cart-summary-row">
                                <span>Discount</span>
                                <span className="discount-value">- ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="cart-summary-row total">
                            <span>Total</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                        </div>

                        {/* Coupon */}
                        <div className="cart-coupon">
                            <input
                                type="text"
                                placeholder="Coupon code"
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                                className="cart-coupon-input"
                            />
                            <button
                                className="cart-coupon-btn"
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                            >
                                {applyingCoupon ? '...' : 'Apply'}
                            </button>
                        </div>
                        {couponResult && (
                            <p className={`cart-coupon-msg ${couponResult.type}`}>
                                {couponResult.message || couponResult.type === 'success' ? `✓ ${couponResult.message || 'Coupon applied!'}` : couponResult.message}
                            </p>
                        )}

                        <button
                            className="cart-checkout-btn"
                            onClick={() => navigate('/dashboard/checkout', { state: { couponCode: couponResult?.type === 'success' ? coupon : null } })}
                        >
                            Proceed to Checkout <ArrowRight size={16} />
                        </button>

                        <p className="cart-secure-note">🔒 Secure payment via Stripe</p>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default CartPage;
