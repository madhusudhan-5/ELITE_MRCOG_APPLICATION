import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
    // Step 1: User info & email
    // Step 2: OTP Entry
    // Step 3: Password 
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({ 
        first_name: '', last_name: '', email: '', phone: '', password: '', password2: '', otp: '' 
    });
    
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleVerifyNow = async () => {
        if (!formData.email) {
            setError("Please enter your email address to verify.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/api/auth/send-otp/', { email: formData.email, purpose: 'register_verify' });
            setStep(2); // Move to OTP input
        } catch (err) {
            setError(err.response?.data?.email?.[0] || 'Verification failed to send');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp) {
            setError("Please enter the OTP.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/api/auth/verify-otp/', { email: formData.email, otp: formData.otp, purpose: 'register_verify' });
            setStep(3); // Setup Passwords
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const payload = { ...formData };
            if (!payload.phone) {
                delete payload.phone;
            }
            const response = await api.post('/api/auth/register/', payload);
            
            // Registration successfully returns tokens now. Log in immediately!
            const user = response.data.user;
            const tokens = {
                access: response.data.access,
                refresh: response.data.refresh
            };
            login(user, tokens);
            
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
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
            setError(err.response?.data?.error || 'Google sign-up failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Create an Account</h2>
            <p className="auth-subtitle">Sign up to get started.</p>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={(e) => e.preventDefault()} className="auth-form">
                
                {step === 1 && (
                    <>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>First Name</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group half">
                                <label>Last Name</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ paddingRight: '100px' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleVerifyNow}
                                    disabled={isLoading || !formData.email}
                                    style={{
                                        position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600,
                                        cursor: 'pointer', padding: '5px 10px', fontSize: '0.9rem'
                                    }}
                                >
                                    Verify Now
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone Number (Optional)</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="form-group">
                            <label>Enter OTP sent to {formData.email}</label>
                            <input 
                                type="text" 
                                name="otp" 
                                value={formData.otp} 
                                onChange={handleChange} 
                                placeholder="123456" 
                                maxLength="6"
                                required 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setStep(1)} className="secondary-btn" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff' }}>
                                Back
                            </button>
                            <button type="button" onClick={handleVerifyOTP} className="primary-btn" disabled={isLoading} style={{ flex: 2 }}>
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            </div>
                            <div className="form-group half">
                                <label>Confirm Password</label>
                                <input type="password" name="password2" value={formData.password2} onChange={handleChange} required />
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
                                    setError('Google Sign-up Failed');
                                }}
                            />
                        </div>
                    </>
                )}
            </form>
            
            <p className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
};

export default Register;
