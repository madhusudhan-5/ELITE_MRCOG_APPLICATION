import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LegalModal from '../../components/Footer/LegalModal';
import { policies } from '../../constants/policies';
import './Auth.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value});
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/auth/login/', credentials);
            const user = response.data.user;
            const tokens = {
                access: response.data.access,
                refresh: response.data.refresh
            };
            login(user, tokens);
            
            if (user?.role === 'superadmin') {
                window.location.href = 'http://localhost:8000/admin'; // Redirect explicitly to Django admin
            } else if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
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
            setError(err.response?.data?.error || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        value={credentials.email}
                        onChange={handleChange}
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        value={credentials.password}
                        onChange={handleChange}
                        required 
                    />
                </div>
                
                <div className="auth-actions">
                    <label className="remember-me">
                        <input type="checkbox" /> Remember me
                    </label>
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
                
                <button type="submit" className="primary-btn" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
                
                <div className="auth-divider">Or sign in with</div>
                
                <div className="social-auth-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError('Google Login Failed');
                        }}
                    />
                </div>
            </form>
            
            <p className="auth-switch">
                Don't have an account? <Link to="/register">Sign up</Link>
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

export default Login;
