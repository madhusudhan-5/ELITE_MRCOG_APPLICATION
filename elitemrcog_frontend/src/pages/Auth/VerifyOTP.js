import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const email = location.state?.email;

    // Reacting if someone visits this directly without an email
    if (!email) {
        navigate('/login');
        return null;
    }

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/auth/verify-otp/', { 
                email, 
                otp: code,
                purpose: 'email_verify'
            });
            login(response.data.user, response.data.tokens);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container" style={{textAlign: 'center'}}>
            <h2>Verify your Email</h2>
            <p className="auth-subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleVerify} className="auth-form">
                <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
                    {otp.map((data, index) => {
                        return (
                            <input
                                className="otp-field"
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onFocus={e => e.target.select()}
                                style={{
                                    width: '45px', height: '50px', fontSize: '1.5rem', 
                                    textAlign: 'center', borderRadius: '8px', 
                                    border: '1px solid #e0e0e0', outline: 'none'
                                }}
                            />
                        );
                    })}
                </div>
                
                <button type="submit" className="primary-btn" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                </button>
                
                <p className="auth-switch" style={{marginTop: '1.5rem'}}>
                    Didn't receive the code? <button type="button" style={{background: 'none', border:'none', color: '#2a2a72', fontWeight: 600, cursor: 'pointer'}}>Resend</button>
                </p>
            </form>
        </div>
    );
};

export default VerifyOTP;
