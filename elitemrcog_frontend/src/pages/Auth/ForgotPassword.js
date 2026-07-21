import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';
import './Auth.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value.replace(/[^0-9]/g, ''));
        if (errors.otp) {
            setErrors(prev => ({ ...prev, otp: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!otp) {
            newErrors.otp = 'OTP is required.';
        } else if (otp.length < 6) {
            newErrors.otp = 'OTP must be 6 digits.';
        }

        if (!passwords.password) {
            newErrors.password = 'New password is required.';
        } else if (passwords.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
        }

        if (!passwords.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password.';
        } else if (passwords.password !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await api.post('/api/auth/send-otp/', { email, purpose: 'password_reset' });
            setStep(2);
        } catch (err) {
            setErrors({ email: err.response?.data?.error || err.response?.data?.email?.[0] || 'Failed to send reset OTP. Please check the email.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsLoading(true);
        setErrors({});

        try {
            await api.post('/api/auth/password-reset/', {
                email,
                otp,
                new_password: passwords.password,
                confirm_password: passwords.confirmPassword
            });
            setSuccessMessage('Password reset successful! Redirecting to login page...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData && typeof responseData === 'object') {
                if (responseData.error) {
                    setErrors({ general: responseData.error });
                } else {
                    setErrors({
                        otp: responseData.otp?.[0] || '',
                        password: responseData.new_password?.[0] || '',
                        confirm_password: responseData.confirm_password?.[0] || ''
                    });
                }
            } else {
                setErrors({ general: 'Failed to reset password. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            {/* Mobile brand header */}
            <div className="auth-mobile-header">
                <img src={logo} alt="Elite MRCOG Logo" />
                <h2>ELITE MRCOG</h2>
            </div>

            <h2>Reset Password</h2>
            <p className="auth-subtitle">
                {step === 1 ? 'Enter your registered email to receive an OTP reset code.' : `Enter the 6-digit OTP code sent to ${email} and choose a new password.`}
            </p>

            {successMessage && <div className="auth-error" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }} role="alert">{successMessage}</div>}
            {errors.general && <div className="auth-error" role="alert">{errors.general}</div>}

            {step === 1 ? (
                <form onSubmit={handleSendOTP} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="reset-email">Email Address</label>
                        <input 
                            id="reset-email"
                            type="email" 
                            name="email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={handleEmailChange}
                            aria-invalid={errors.email ? "true" : "false"}
                            required 
                        />
                        {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                    </div>

                    <button type="submit" className="primary-btn" disabled={isLoading}>
                        {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="reset-otp">OTP Code</label>
                        <input 
                            id="reset-otp"
                            type="text" 
                            name="otp" 
                            placeholder="Enter 6-digit OTP" 
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength="6"
                            aria-invalid={errors.otp ? "true" : "false"}
                            required 
                        />
                        {errors.otp && <span className="field-error" role="alert">{errors.otp}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="new-password">New Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                id="new-password"
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder="Min 8 characters"
                                value={passwords.password}
                                onChange={handlePasswordChange}
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

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input 
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword" 
                                placeholder="••••••••" 
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                aria-invalid={errors.confirmPassword ? "true" : "false"}
                                required 
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="field-error" role="alert">{errors.confirmPassword}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                            Back
                        </button>
                        <button type="submit" className="primary-btn" disabled={isLoading} style={{ flex: 2, marginTop: 0 }}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            )}

            <p className="auth-switch">
                Back to <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
};

export default ForgotPassword;
