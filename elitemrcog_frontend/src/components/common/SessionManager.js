import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes total
const WARNING_BEFORE = 30 * 1000; // 30 seconds before timeout, show popup -> 9.5 mins

const SessionManager = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const timeoutId = useRef(null);
    const warningId = useRef(null);

    const resetTimers = () => {
        if (!isAuthenticated) return;
        
        setShowWarning(false);
        
        if (timeoutId.current) clearTimeout(timeoutId.current);
        if (warningId.current) clearTimeout(warningId.current);

        warningId.current = setTimeout(() => {
            setShowWarning(true);
        }, TIMEOUT_DURATION - WARNING_BEFORE);

        timeoutId.current = setTimeout(() => {
            handleLogout();
        }, TIMEOUT_DURATION);
    };

    const handleLogout = async () => {
        setShowWarning(false);
        if (timeoutId.current) clearTimeout(timeoutId.current);
        if (warningId.current) clearTimeout(warningId.current);
        
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart', 'scroll'];
        
        const handleActivity = () => resetTimers();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timers
        resetTimers();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutId.current) clearTimeout(timeoutId.current);
            if (warningId.current) clearTimeout(warningId.current);
        };
    }, [isAuthenticated]);

    return (
        <>
            {children}
            {showWarning && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0, color: '#333' }}>Session Expiring</h3>
                        <p style={{ color: '#555', marginBottom: '20px' }}>Your session is about to expire due to inactivity. Do you want to continue working?</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button style={btnCancel} onClick={handleLogout}>Log Out</button>
                            <button style={btnContinue} onClick={resetTimers}>Continue Session</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
};

const modalStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '400px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
};

const btnCancel = {
    padding: '8px 16px',
    background: '#f1f1f1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#333'
};

const btnContinue = {
    padding: '8px 16px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: 'bold'
};

export default SessionManager;
