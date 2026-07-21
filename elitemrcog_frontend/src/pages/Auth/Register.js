import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LegalModal from '../../components/Footer/LegalModal';
import { policies } from '../../constants/policies';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ 
        first_name: '', last_name: '', email: '', phone: '', password: '', password2: '', otp: '' 
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;
        
        if (name === 'phone') {
            // Allow only numbers, plus, minus, spaces, and parenthesis
            sanitizedValue = value.replace(/[^0-9+\-()\s]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        
        // Clear specific error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required.';
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required.';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        }

        if (!formData.password2) {
            newErrors.password2 = 'Please confirm your password.';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVerifyNow = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            setErrors({ email: 'Please enter your email address to verify.' });
            return;
        } else if (!emailRegex.test(formData.email)) {
            setErrors({ email: 'Please enter a valid email address.' });
            return;
        }
        
        setIsLoading(true);
        setErrors({});
        try {
            await api.post('/api/auth/send-otp/', { email: formData.email, purpose: 'register_verify' });
            setStep(2); // Move to OTP input
        } catch (err) {
            setErrors({ email: err.response?.data?.email?.[0] || err.response?.data?.error || 'Verification failed to send.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp) {
            setErrors({ otp: 'Please enter the OTP.' });
            return;
        } else if (formData.otp.length < 6) {
            setErrors({ otp: 'OTP must be 6 digits.' });
            return;
        }
        
        setIsLoading(true);
        setErrors({});
        try {
            await api.post('/api/auth/verify-otp/', { email: formData.email, otp: formData.otp, purpose: 'register_verify' });
            setStep(3); // Setup Passwords
        } catch (err) {
            setErrors({ otp: err.response?.data?.error || 'Invalid OTP. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateStep3()) return;

        setIsLoading(true);
        setErrors({});
        try {
            const payload = { ...formData };
            if (!payload.phone) {
                delete payload.phone;
            }
            const response = await api.post('/api/auth/register/', payload);
            
            // Log in immediately
            const user = response.data.user;
            const tokens = {
                access: response.data.access,
                refresh: response.data.refresh
            };
            login(user, tokens);
            
            navigate('/dashboard');
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData && typeof responseData === 'object') {
                if (responseData.error) {
                    setErrors({ general: responseData.error });
                } else {
                    setErrors({
                        first_name: responseData.first_name?.[0] || '',
                        last_name: responseData.last_name?.[0] || '',
                        email: responseData.email?.[0] || '',
                        phone: responseData.phone?.[0] || '',
                        password: responseData.password?.[0] || '',
                        password2: responseData.password2?.[0] || ''
                    });
                }
            } else {
                setErrors({ general: 'Registration failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setErrors({});
        try {
            const response = await api.post('/api/auth/google/', { id_token: credentialResponse.credential });
            const user = response.data.user;
            const tokens = {
                access: response.data.access,
                refresh: response.data.refresh
            };
            login(user, tokens);
            
            if (user?.role === 'superadmin') {
                window.location.href = 'http://localhost:8000/admin';
            } else if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setErrors({ general: err.response?.data?.error || 'Google sign-up failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            {/* Mobile-only brand header */}
            <div className="auth-mobile-header">
                <img src={logo} alt="Elite MRCOG Logo" />
                <h2>ELITE MRCOG</h2>
            </div>

            <h2>Create an Account</h2>
            <p className="auth-subtitle">Sign up to get started.</p>
            
            {errors.general && <div className="auth-error" role="alert">{errors.general}</div>}

            <form onSubmit={(e) => e.preventDefault()} className="auth-form" noValidate>
                
                {step === 1 && (
                    <>
                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="first_name">First Name</label>
                                <input 
                                    id="first_name"
                                    type="text" 
                                    name="first_name" 
                                    value={formData.first_name} 
                                    onChange={handleChange} 
                                    aria-invalid={errors.first_name ? "true" : "false"}
                                    required 
                                />
                                {errors.first_name && <span className="field-error" role="alert">{errors.first_name}</span>}
                            </div>
                            <div className="form-group half">
                                <label htmlFor="last_name">Last Name</label>
                                <input 
                                    id="last_name"
                                    type="text" 
                                    name="last_name" 
                                    value={formData.last_name} 
                                    onChange={handleChange} 
                                    aria-invalid={errors.last_name ? "true" : "false"}
                                    required 
                                />
                                {errors.last_name && <span className="field-error" role="alert">{errors.last_name}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="email-input-group">
                                <input 
                                    id="email"
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    aria-invalid={errors.email ? "true" : "false"}
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={handleVerifyNow}
                                    disabled={isLoading || !formData.email}
                                    className="verify-btn"
                                >
                                    Verify Email
                                </button>
                            </div>
                            {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number (Optional)</label>
                            <input 
                                id="phone"
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+1 (555) 000-0000"
                                aria-invalid={errors.phone ? "true" : "false"}
                            />
                            {errors.phone && <span className="field-error" role="alert">{errors.phone}</span>}
                        </div>

                        <button 
                            type="button" 
                            className="primary-btn" 
                            onClick={() => { if (validateStep1()) handleVerifyNow(); }}
                            disabled={isLoading}
                        >
                            Next: Verify Email
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP sent to {formData.email}</label>
                            <input 
                                id="otp"
                                type="text" 
                                name="otp" 
                                value={formData.otp} 
                                onChange={handleChange} 
                                placeholder="123456" 
                                maxLength="6"
                                aria-invalid={errors.otp ? "true" : "false"}
                                required 
                            />
                            {errors.otp && <span className="field-error" role="alert">{errors.otp}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                                Back
                            </button>
                            <button type="button" onClick={handleVerifyOTP} className="primary-btn" disabled={isLoading} style={{ flex: 2, marginTop: 0 }}>
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="form-row">
                            <div className="form-group half">
                                <label htmlFor="reg-password">Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="reg-password"
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        aria-invalid={errors.password ? "true" : "false"}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <span className="field-error" role="alert">{errors.password}</span>}
                            </div>
                            <div className="form-group half">
                                <label htmlFor="reg-password-confirm">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        id="reg-password-confirm"
                                        type={showPassword2 ? "text" : "password"} 
                                        name="password2" 
                                        value={formData.password2} 
                                        onChange={handleChange} 
                                        aria-invalid={errors.password2 ? "true" : "false"}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword2(!showPassword2)}
                                        aria-label={showPassword2 ? "Hide password confirmation" : "Show password confirmation"}
                                    >
                                        {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password2 && <span className="field-error" role="alert">{errors.password2}</span>}
                            </div>
                        </div>
                        <button type="button" onClick={handleRegister} className="primary-btn" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Complete Registration'}
                        </button>
                    </>
                )}
                
                {step === 1 && (
                    <>
                        <div className="auth-divider">Or sign up with</div>
                        
                        <div className="social-auth-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setErrors({ general: 'Google Sign-up Failed' });
                                }}
                            />
                        </div>
                    </>
                )}
            </form>
            
            <p className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <div className="auth-legal-links" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', fontSize: '0.8rem', color: '#888' }}>
                <button onClick={() => setActiveModal('refund')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textDecoration: 'underline' }}>Refund Policy</button>
                <span>|</span>
                <button onClick={() => setActiveModal('privacy')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</button>
                <span>|</span>
                <button onClick={() => setActiveModal('terms')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textDecoration: 'underline' }}>Terms &amp; Conditions</button>
            </div>

            <LegalModal
                isOpen={activeModal === 'privacy'}
                onClose={closeModal}
                title="Privacy Policy"
                content={policies.privacy}
            />
            <LegalModal
                isOpen={activeModal === 'terms'}
                onClose={closeModal}
                title="Terms &amp; Conditions"
                content={policies.terms}
            />
            <LegalModal
                isOpen={activeModal === 'refund'}
                onClose={closeModal}
                title="Refund Policy"
                content={policies.refund}
            />
        </div>
    );
};

export default Register;
