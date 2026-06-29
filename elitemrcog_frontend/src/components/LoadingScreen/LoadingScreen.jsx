import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';
import logoSvg from '../../assets/images/logo.svg';

const LoadingScreen = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setFadeOut(true);
        }, 1800);

        const timer2 = setTimeout(() => {
            onComplete && onComplete();
        }, 2400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <div className={`loading-screen ${fadeOut ? 'loading-screen--fade-out' : ''}`}>
            <div className="loading-screen__content">
                <div className="loading-screen__logo-wrap">
                    <img src={logoSvg} alt="Elite MRCOG" className="loading-screen__logo" />
                </div>
                <div className="loading-screen__brand">
                    <span className="loading-screen__brand-elite">Elite</span>
                    <span className="loading-screen__brand-mrcog">MRCOG</span>
                </div>
                <div className="loading-screen__bar-wrap">
                    <div className="loading-screen__bar"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
