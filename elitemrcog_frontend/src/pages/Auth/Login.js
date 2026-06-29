import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Auth.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        </div>
    );
};

export default Login;
