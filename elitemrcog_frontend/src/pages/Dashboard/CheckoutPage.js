import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Globe, CreditCard, CheckCircle, Loader } from 'lucide-react';
import './CheckoutPage.css';

// ── Stripe Payment Form ────────────────────────────────────────────────────────
const StripePaymentForm = ({ clientSecret, transactionId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState(null);
    const { refresh: refreshCart } = useCart();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setPaying(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (stripeError) {
            setError(stripeError.message);
            setPaying(false);
            return;
        }

        if (paymentIntent?.status === 'succeeded') {
            try {
                const res = await api.post('/api/subscriptions/checkout/stripe/confirm/', {
                    payment_intent_id: paymentIntent.id,
                    transaction_id: transactionId,
                });
                refreshCart();
                onSuccess(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Confirmation failed. Contact support.');
                setPaying(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <PaymentElement />
            {error && <p className="stripe-error">{error}</p>}
            <button type="submit" className="stripe-pay-btn" disabled={!stripe || paying}>
                {paying ? <><Loader size={16} className="spin-icon" /> Processing...</> : <><CreditCard size={16} /> Pay Now</>}
            </button>
        </form>
    );
};

// ── Pakistan Payment Info ──────────────────────────────────────────────────────
const PakistanPaymentInfo = ({ paymentInfo, transactionId, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await api.post('/api/subscriptions/checkout/pakistan/confirm/', { transaction_id: transactionId });
            setDone(true);
            onSubmit();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (done) return (
        <div className="pk-done">
            <CheckCircle size={48} className="pk-done-icon" />
            <h3>Reference Submitted!</h3>
            <p>Your payment reference has been submitted. Access will be granted within 24 hours after verification.</p>
        </div>
    );

    return (
        <div className="pk-payment">
            <h3>Pakistan Payment Instructions</h3>
            <p className="pk-info-text">Please transfer the amount to the details below and click confirm.</p>
            <div className="pk-details">
                <div className="pk-row"><span>Bank</span><strong>{paymentInfo?.bank_name || 'TBD'}</strong></div>
                <div className="pk-row"><span>Account</span><strong>{paymentInfo?.account_number || 'TBD'}</strong></div>
                <div className="pk-row"><span>Reference</span><strong>{paymentInfo?.reference || `MRCOG-${transactionId}`}</strong></div>
                <div className="pk-row"><span>Amount</span><strong>₹{paymentInfo?.amount}</strong></div>
            </div>
            <button className="pk-confirm-btn" onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Submitting...' : 'I Have Transferred — Confirm'}
            </button>
        </div>
    );
};

// ── Main Checkout Page ────────────────────────────────────────────────────────
const COUNTRY_LIST = [
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'IE', name: 'Ireland' },
    { code: 'AE', name: 'UAE' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'OTHER', name: 'Other' },
];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const couponCode = location.state?.couponCode || null;
    const { refresh: refreshCart } = useCart();

    const [step, setStep] = useState('country'); // country | payment | success
    const [country, setCountry] = useState('GB');
    const [initiating, setInitiating] = useState(false);
    const [error, setError] = useState(null);

    // After initiate
    const [gateway, setGateway] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [publishableKey, setPublishableKey] = useState(null);
    const [transactionId, setTransactionId] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [orderTotal, setOrderTotal] = useState(null);
    const [successData, setSuccessData] = useState(null);

    const handleInitiate = async () => {
        setInitiating(true);
        setError(null);
        try {
            const res = await api.post('/api/subscriptions/checkout/initiate/', {
                country_code: country,
                coupon_code: couponCode || '',
            });
            setGateway(res.data.gateway);
            setTransactionId(res.data.transaction_id);
            setOrderTotal(res.data.total);

            if (res.data.gateway === 'stripe') {
                setClientSecret(res.data.client_secret);
                setPublishableKey(res.data.publishable_key);
            } else {
                setPaymentInfo(res.data.payment_instructions);
            }
            setStep('payment');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to initiate checkout.');
        } finally {
            setInitiating(false);
        }
    };

    const handleSuccess = (data) => {
        setSuccessData(data);
        refreshCart();
        setStep('success');
    };

    const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

    // ── Success Screen ──
    if (step === 'success') {
        return (
            <div className="checkout-success">
                <CheckCircle size={72} className="success-icon" />
                <h2>Payment Successful!</h2>
                <p>Your libraries are now unlocked. Start learning!</p>
                {successData?.unlocked_libraries && (
                    <div className="success-libs">
                        {successData.unlocked_libraries.map(lib => (
                            <span key={lib} className={`success-lib-chip chip-${lib}`}>
                                {lib === 'reading' ? '📖 Reading' : lib === 'video' ? '🎬 Video' : '📝 Mock Exam'}
                            </span>
                        ))}
                    </div>
                )}
                <div className="success-actions">
                    <button className="success-btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                    <button className="success-btn-outline" onClick={() => navigate('/dashboard/my-subscriptions')}>My Subscriptions</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Progress steps */}
            <div className="checkout-steps">
                <div className={`checkout-step ${step === 'country' ? 'active' : step === 'payment' ? 'done' : ''}`}>
                    <span>1</span> Country
                </div>
                <div className="checkout-divider" />
                <div className={`checkout-step ${step === 'payment' ? 'active' : step === 'success' ? 'done' : ''}`}>
                    <span>2</span> Payment
                </div>
                <div className="checkout-divider" />
                <div className={`checkout-step ${step === 'success' ? 'done' : ''}`}>
                    <span>3</span> Confirm
                </div>
            </div>

            <div className="checkout-card">
                {/* ── Step 1: Country ── */}
                {step === 'country' && (
                    <div className="checkout-country">
                        <div className="checkout-card-header">
                            <Globe size={22} />
                            <h2>Select Your Country</h2>
                        </div>
                        <p className="checkout-hint">
                            Your country determines the payment method available to you.
                        </p>
                        <select
                            className="checkout-country-select"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                        >
                            {COUNTRY_LIST.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>

                        {country === 'PK' && (
                            <div className="checkout-pk-note">
                                🇵🇰 Pakistan users: You'll receive manual bank transfer instructions.
                            </div>
                        )}
                        {country !== 'PK' && (
                            <div className="checkout-stripe-note">
                                💳 Secure card payment via Stripe.
                            </div>
                        )}

                        {error && <p className="checkout-error">{error}</p>}

                        <button
                            className="checkout-next-btn"
                            onClick={handleInitiate}
                            disabled={initiating}
                        >
                            {initiating ? 'Please wait...' : 'Continue to Payment →'}
                        </button>
                    </div>
                )}

                {/* ── Step 2: Payment ── */}
                {step === 'payment' && (
                    <div className="checkout-payment">
                        <div className="checkout-card-header">
                            <CreditCard size={22} />
                            <h2>{gateway === 'pakistan' ? 'Bank Transfer' : 'Card Payment'}</h2>
                        </div>
                        {orderTotal && (
                            <div className="checkout-total-display">
                                Total: <strong>₹{parseFloat(orderTotal).toFixed(2)}</strong>
                            </div>
                        )}

                        {gateway === 'stripe' && clientSecret && stripePromise && (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripePaymentForm
                                    clientSecret={clientSecret}
                                    transactionId={transactionId}
                                    onSuccess={handleSuccess}
                                />
                            </Elements>
                        )}

                        {gateway === 'pakistan' && (
                            <PakistanPaymentInfo
                                paymentInfo={paymentInfo}
                                transactionId={transactionId}
                                onSubmit={() => setStep('success')}
                            />
                        )}

                        {gateway === 'stripe' && !clientSecret && (
                            <div className="checkout-no-stripe">
                                <p>Payment gateway is not configured yet. Please contact support.</p>
                                <a href="mailto:support@elitemrcog.com">support@elitemrcog.com</a>
                            </div>
                        )}

                        <button className="checkout-back-btn" onClick={() => setStep('country')}>
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
