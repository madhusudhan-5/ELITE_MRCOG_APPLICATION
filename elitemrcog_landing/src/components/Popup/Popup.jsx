import React, { useState, useEffect } from 'react';
import './Popup.css';

const POPUP_KEY = 'elitemrcog_popup_dismissed';

const Popup = () => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const alreadyDismissed = sessionStorage.getItem(POPUP_KEY);
        if (!alreadyDismissed) {
            const timer = setTimeout(() => setVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem(POPUP_KEY, 'true');
        }, 300);
    };

    const handleJoin = () => {
        window.open('https://t.me/elitemrcog', '_blank');
        handleClose();
    };

    if (!visible) return null;

    return (
        <>
            <div
                className={`popup-overlay${closing ? ' closing' : ''}`}
                onClick={handleClose}
            />
            <div
                className={`popup${closing ? ' closing' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="popup-title"
            >
                <button className="popup__close" onClick={handleClose} aria-label="Close">
                    ✕
                </button>

                {/* Left Panel — Telegram themed */}
                <div className="popup__left">
                    <div className="popup__tg-icon-wrap">
                        {/* Telegram SVG icon — properly sized */}
                        <svg
                            className="popup__tg-icon"
                            viewBox="0 0 240 240"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="120" cy="120" r="120" fill="url(#tg-grad)" />
                            <defs>
                                <linearGradient id="tg-grad" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#37AEE2" />
                                    <stop offset="1" stopColor="#1E96C8" />
                                </linearGradient>
                            </defs>
                            <path d="M81.229 128.772l14.237 39.406s1.78 3.687 3.686 3.687c1.906 0 30.377-29.561 30.377-29.561l31.561-60.733L81.229 128.772z" fill="#C8DAEA" />
                            <path d="M100.106 138.878l-2.733 29.046s-1.144 8.9 7.754 0l17.415-15.763" fill="#A9C6D4" />
                            <path d="M81.486 130.178l-40.32-13.03s-4.83-1.958-3.287-6.41c.324-.924 1.049-1.713 3.146-3.073 9.99-6.976 184.958-69.64 184.958-69.64s4.422-1.488 7.03-.501c1.323.493 2.173 1.022 2.893 2.945.244.658.386 2.044.362 3.41-.24 14.014-62.476 171.43-62.476 171.43s-3.616 8.983-10.75 9.264c-3.073.12-6.84-1.167-9.264-4.526" fill="white" />
                        </svg>
                    </div>
                    <h3 className="popup__left-title">Join Our Free<br />Telegram Group!</h3>
                    <p className="popup__left-subtitle">
                        Connect with 10,000+ MRCOG aspirants
                    </p>
                </div>

                {/* Right Panel — Benefits */}
                <div className="popup__right">
                    <h2 className="popup__title" id="popup-title">
                        Join Our Free Elite<br />
                        <span className="highlight-teal">MRCOG Community</span>
                    </h2>

                    <ul className="popup__benefits">
                        {[
                            '🎯 Daily MRCOG prep tips & strategies',
                            '📚 Free study materials & resources',
                            '🤝 Connect with mentors & peers',
                            '📢 Latest MRCOG updates & news',
                            '✅ Exclusive practice questions',
                        ].map((b, i) => (
                            <li key={i} className="popup__benefit">{b}</li>
                        ))}
                    </ul>

                    <button className="popup__join-btn" onClick={handleJoin}>
                        <span className="popup__join-icon">
                            <svg width="20" height="20" viewBox="0 0 240 240" fill="none">
                                <circle cx="120" cy="120" r="120" fill="white" fillOpacity="0.2" />
                                <path d="M81.486 130.178l-40.32-13.03s-4.83-1.958-3.287-6.41c.324-.924 1.049-1.713 3.146-3.073 9.99-6.976 184.958-69.64 184.958-69.64s4.422-1.488 7.03-.501c1.323.493 2.173 1.022 2.893 2.945.244.658.386 2.044.362 3.41-.24 14.014-62.476 171.43-62.476 171.43s-3.616 8.983-10.75 9.264c-3.073.12-6.84-1.167-9.264-4.526" fill="white" />
                            </svg>
                        </span>
                        Join Free Telegram Group
                    </button>

                    <p className="popup__disclaimer">100% Free · No spam · Leave anytime</p>
                </div>
            </div>
        </>
    );
};

export default Popup;
