import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ msg, type = 'error', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!msg) return null;

    // Handle HTML error messages safely (e.g. from Nginx)
    let displayMsg = msg;
    if (typeof msg === 'string') {
        if (msg.includes('<html')) {
            // For standard Nginx errors, provide a clean message
            if (msg.includes('413 Request Entity Too Large')) {
                displayMsg = "File is too large. Max limit is 500MB.";
            } else {
                displayMsg = "A server error occurred (500). Please try again.";
            }
        }
    } else if (typeof msg === 'object') {
        try {
            displayMsg = JSON.stringify(msg).substring(0, 100);
        } catch (e) {
            displayMsg = "An error occurred.";
        }
    }

    return (
        <div className={`toast-container toast-container--${type}`}>
            {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{displayMsg}</span>
            <button onClick={onClose}><X size={14} /></button>
        </div>
    );
};

export default Toast;
