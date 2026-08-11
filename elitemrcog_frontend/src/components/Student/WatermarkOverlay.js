import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './WatermarkOverlay.css';
import logoRemoveBg from '../../assets/images/logo-removebg-preview.png';

const WatermarkOverlay = () => {
    const { user } = useAuth();

    if (!user) return null;

    const watermarkText = `${user.email} - ${user.name || user.first_name || 'Student'}`;

    return (
        <div className="watermark-overlay" style={{ pointerEvents: 'none' }}>
            <div className="watermark-center-logo">
                <img src={logoRemoveBg} alt="Watermark Logo" />
            </div>
            <div className="watermark-pattern">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="watermark-item">
                        {watermarkText}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WatermarkOverlay;
