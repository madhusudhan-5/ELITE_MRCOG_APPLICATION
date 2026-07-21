import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LegalModal from '../../components/Footer/LegalModal';
import { policies } from '../../constants/policies';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/images/logo.jpeg';
import './Auth.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Check if email was remembered
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
            setCredentials(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        // Clear field error as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!credentials.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(credentials.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!credentials.password) {
            newErrors.password = 'Password is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        
        try {
            const response = await api.post('/api/auth/login/', credentials);
            const user = response.data.user;
            const tokens = {
                access: response.data.access,
                refresh: response.data.refresh
            };
            login(user, tokens);
            
            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('remembered_email', credentials.email);
            } else {
                localStorage.removeItem('remembered_email');
            }
            
            if (user?.role === 'superadmin') {
                window.location.href = 'http://localhost:8000/admin'; // Redirect explicitly to Django admin
            } else if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData && typeof responseData === 'object') {
                // Check if specific field validation errors
                if (responseData.email || responseData.password) {
                    setErrors({
                        email: responseData.email?.[0] || responseData.email || '',
                        password: responseData.password?.[0] || responseData.password || ''
                    });
                } else if (responseData.error) {
                    setErrors({ general: responseData.error });
                } else {
                    setErrors({ general: 'Invalid credentials. Please try again.' });
                }
            } else {
                setErrors({ general: 'Server connection failed. Please try again.' });
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
            setErrors({ general: err.response?.data?.error || 'Google login failed' });
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

            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
            
            {errors.general && <div className="auth-error" role="alert">{errors.general}</div>}

            <form onSubmit={handleLogin} className="auth-form" noValidate>
                <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input 
                        id="login-email"
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        value={credentials.email}
                        onChange={handleChange}
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        required 
                    />
                    {errors.email && (
                        <span className="field-error" id="email-error" role="alert">
                            {errors.email}
                        </span>
                    )}
                </div>
                
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="password-input-wrapper">
                        <input 
                            id="login-password"
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="••••••••" 
                            value={credentials.password}
                            onChange={handleChange}
                            aria-invalid={errors.password ? "true" : "false"}
                            aria-describedby={errors.password ? "password-error" : undefined}
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
                    {errors.password && (
                        <span className="field-error" id="password-error" role="alert">
                            {errors.password}
                        </span>
                    )}
                </div>
                
                <div className="auth-actions">
                    <label className="remember-me">
                        <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        /> Remember me
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
                            setErrors({ general: 'Google Login Failed' });
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
