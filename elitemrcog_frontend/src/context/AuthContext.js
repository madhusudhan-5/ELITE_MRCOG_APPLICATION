import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const res = await api.get('/api/auth/me/');
                    setUser(res.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        
        loadUser();
    }, []);

    const login = (userData, tokens) => {
        localStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
            localStorage.setItem('refresh_token', tokens.refresh);
        }
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                await api.post('/api/auth/logout/', { refresh });
            }
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
