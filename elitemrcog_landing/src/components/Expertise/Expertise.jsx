import React from 'react';
import './Expertise.css';
import classroomimage from '../../assets/images/teachingexpertise.png';
import studentImage from '../../assets/images/2f32d3a9082c2e2832481561feec93a5e5c5e8d6.png';

const PeopleIcon = () => (
    <span className="expertise__bullet-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
    </span>
);

export default function Expertise() {
    return (
        <section className="expertise" id="expertise">

            {/* ─── Intro block ─────────────────────────────── */}
            <div className="expertise__block expertise__block--light">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left */}
                        <div className="expertise__content">
                            <div className="expertise__green-dot"></div>
                            <h2 className="expertise__big-title">
                                Everything you learn with Expertise ,<br />
                                <span style={{ color: 'var(--color-teal)' }}>you can do with Elite MRCOG</span>
                            </h2>
                            <p className="expertise__desc">
                                Candidates often struggle not from lack of effort, but from
                                unclear priorities. A focused, time-boxed plan with practice
                                that mirrors the real test keeps you on track especially
                                when the exam structure is strict and timed.
                            </p>
                        </div>
                        {/* Right – classroom video thumbnail */}
                        <div style={{ position: 'relative', padding: '12px' }}>
                            <div className="expertise__video-corner--tl"></div>
                            <div className="expertise__video-thumb">
                                <img
                                    src={classroomimage}
                                    alt="Classroom session"
                                    className="expertise__video-img"
                                />
                                <button className="expertise__play-btn" aria-label="Play video">
                                    <svg viewBox="0 0 24 24" width="24" height="24">
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                </button>
                            </div>
                            <div className="expertise__video-corner--br"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── "Our Features" header ───────────────────── */}
            <div className="expertise__block--features-header" style={{ background: '#fff', padding: '3rem 0 1rem' }}>
                <div className="container">
                    <p className="expertise__eyebrow" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Why Thousands of Aspirants Prefer Our <strong>Elite MRCOG</strong> Training
                    </p>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>
                        Our <span style={{ color: 'var(--color-teal)' }}>Features</span>
                    </h2>
                </div>
            </div>

            {/* ─── Feature 1: Unlimited station recordings ─── */}
            <div className="expertise__block expertise__block--white">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – quiz card */}
                        <div className="expertise__visual" style={{ position: 'relative' }}>
                            {/* Decorative circles behind card */}
                            <div style={{
                                position: 'absolute', top: -20, left: -10,
                                width: 100, height: 100, borderRadius: '50%',
                                background: 'var(--color-teal)', opacity: 0.85, zIndex: 0
                            }}></div>
                            <div style={{
                                position: 'absolute', top: 10, left: 70,
                                width: 36, height: 36, borderRadius: '50%',
                                background: '#F5A623', zIndex: 0
                            }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div className="expertise__quiz-card">
                                    <div className="expertise__quiz-deco">
                                        <span className="expertise__dot expertise__dot--green"></span>
                                        <span className="expertise__dot expertise__dot--navy"></span>
                                        <span className="expertise__dot expertise__dot--orange"></span>
                                    </div>
                                    <div className="expertise__quiz-question">
                                        <span className="expertise__quiz-label">Question 1</span>
                                        <p className="expertise__quiz-text">
                                            True or false? This play<br />takes place in Italy
                                        </p>
                                    </div>
                                    <div className="expertise__quiz-img-wrap">
                                        <img
                                            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=500&q=80"
                                            alt="Venice Italy"
                                            className="expertise__quiz-img"
                                        />
                                        <div className="expertise__quiz-dark-circle"></div>
                                    </div>
                                    <div className="expertise__quiz-options">
                                        <button className="expertise__option expertise__option--wrong">✗</button>
                                        <button className="expertise__option expertise__option--right">✓</button>
                                    </div>
                                    <div className="expertise__quiz-success">
                                        <span className="expertise__quiz-success-icon">🚀</span>
                                        <span>Your answer was<br /><strong>sent successfully</strong></span>
                                    </div>
                                </div>
                            </div>
                            {/* Small green dot bottom-left */}
                            <div style={{
                                position: 'absolute', bottom: -10, left: 10,
                                width: 16, height: 16, borderRadius: '50%',
                                background: 'var(--color-teal)', zIndex: 0
                            }}></div>
                            {/* Small pink dot right side */}
                            <div style={{
                                position: 'absolute', bottom: '30%', right: -8,
                                width: 12, height: 12, borderRadius: '50%',
                                background: 'var(--color-pink)', zIndex: 0
                            }}></div>
                        </div>
                        {/* Right – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-teal)' }}>Unlimited</span> station recordings
                            </h3>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Easily share and review your station recordings to pinpoint exactly where you struggle.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Simplify complex scenarios by replaying and analyzing them step by step.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Get quick expert tips so each recording becomes a clear action plan for improvement.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 2: Personalized feedback ─────────── */}
            <div className="expertise__block expertise__block--light">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>Personalized feedback</span><br />
                                from <span style={{ color: 'var(--color-teal)' }}>Mentors</span>
                            </h3>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Receive tailored insights from expert tutors who call out your strengths.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Understand and fix your weaknesses with precise, focused guidance.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Turn every practice into progress, not just more practice.</span>
                                </li>
                            </ul>
                        </div>
                        {/* Right – student photo with pink circle */}
                        <div className="expertise__visual--right">
                            <div className="expertise__student-wrap">
                                <div className="expertise__pink-circle"></div>
                                <img
                                    src={studentImage}
                                    alt="Student with books"
                                    className="expertise__student-img"
                                />
                                <div className="expertise__floating-icons">
                                    {/* <div className="expertise__fi expertise__fi--1"></div> */}
                                    {/* <div className="expertise__fi expertise__fi--2"></div> */}
                                    {/* <div className="expertise__fi expertise__fi--3"></div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 3: Mentor-led case discussions ────── */}
            <div className="expertise__block expertise__block--white">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – 5-person video call UI */}
                        <div className="expertise__visual">
                            <div className="expertise__video-call">
                                <div className="expertise__vc-header">
                                    <span className="expertise__vc-dot red"></span>
                                    <span className="expertise__vc-dot yellow"></span>
                                    <span className="expertise__vc-dot green"></span>
                                </div>
                                <div className="expertise__vc-grid">
                                    {/* Main: Instructor Deepika */}
                                    <div className="expertise__vc-cell expertise__vc-cell--main">
                                        <img
                                            src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80"
                                            alt="Instructor Deepika"
                                        />
                                        <span className="expertise__vc-label expertise__vc-label--blue">Instructor Deepika</span>
                                    </div>
                                    {/* 4 small tiles */}
                                    <div className="expertise__vc-cell">
                                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" alt="Tamara Clarke" />
                                        <span className="expertise__vc-label">Tamara Clarke</span>
                                    </div>
                                    <div className="expertise__vc-cell">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" alt="Adam Levin" />
                                        <span className="expertise__vc-label">Adam Levin</span>
                                    </div>
                                    <div className="expertise__vc-cell">
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="Humbert Holland" />
                                        <span className="expertise__vc-label">Humbert Holland</span>
                                    </div>
                                    <div className="expertise__vc-cell" style={{ gridColumn: 'span 2' }}>
                                        <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80" alt="Patricia Mendoza" />
                                        <span className="expertise__vc-label">Patricia Mendoza</span>
                                    </div>
                                </div>
                                <div className="expertise__vc-actions">
                                    <button className="expertise__vc-btn expertise__vc-btn--blue">Present</button>
                                    <button className="expertise__vc-btn expertise__vc-btn--red">📞 Call</button>
                                </div>
                            </div>
                        </div>
                        {/* Right – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-teal)' }}>Mentor-led</span> case<br />discussions
                            </h3>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Join sessions that deliver targeted tips and practical strategies for each stage of MRCOG prep.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Learn from real-world examples and mentor experience, not just theory.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Walk away with clear next steps you can use immediately in your study plan.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 4: Access to session recordings ───── */}
            <div className="expertise__block expertise__block--light">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-navy)' }}>Access to</span>{' '}
                                <span style={{ color: 'var(--color-teal)' }}>session</span><br />
                                <span style={{ color: 'var(--color-teal)' }}>recordings</span>
                            </h3>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Practice on your own schedule—anytime, anywhere.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Unlimited access to all recordings means you can rewind, repeat, and review as often as needed.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Fits busy routines: catch up or drill topics whenever you have free time.</span>
                                </li>
                            </ul>
                        </div>
                        {/* Right – Mock Exam leaderboard */}
                        <div className="expertise__exam-outer">
                            <div className="expertise__exam-star-wrap">
                                <span className="expertise__exam-hand">🖐</span>
                            </div>
                            <div className="expertise__exam-dots">
                                <span className="expertise__exam-dot-blue"></span>
                                <span className="expertise__exam-dot-small"></span>
                            </div>
                            <div className="expertise__exam-card">
                                <div className="expertise__exam-header">
                                    <span style={{ fontSize: '1.4rem' }}>⭐</span>
                                    <div className="expertise__exam-title-wrap">
                                        <span className="expertise__exam-title">MOCk Exam samples</span>
                                        <span className="expertise__exam-book">📘</span>
                                    </div>
                                </div>
                                <div className="expertise__exam-rows">
                                    {/* Row 1 */}
                                    <div className="expertise__exam-row">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="User 1" className="expertise__exam-avatar" />
                                        <div className="expertise__exam-bar-wrap">
                                            <div className="expertise__exam-bar expertise__exam-bar--sky" style={{ width: '60%' }}></div>
                                        </div>
                                        <div className="expertise__exam-scores-stacked">
                                            <span className="expertise__exam-score expertise__exam-score--gold">100</span>
                                            <span style={{ fontSize: '0.65rem' }}>⭐</span>
                                        </div>
                                    </div>
                                    {/* Row 2 */}
                                    <div className="expertise__exam-row" style={{ justifyContent: 'flex-end' }}>
                                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="User 2" className="expertise__exam-avatar" />
                                        <div className="expertise__exam-bar-wrap">
                                            <div className="expertise__exam-bar expertise__exam-bar--blue" style={{ width: '50%' }}></div>
                                        </div>
                                        <div className="expertise__exam-scores-stacked">
                                            <span className="expertise__exam-score expertise__exam-score--green">9</span>
                                            <span className="expertise__exam-num">8</span>
                                        </div>
                                    </div>
                                    {/* Row 3 */}
                                    <div className="expertise__exam-row">
                                        <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80" alt="User 3" className="expertise__exam-avatar" />
                                        <div className="expertise__exam-bar-wrap">
                                            <div className="expertise__exam-bar expertise__exam-bar--green" style={{ width: '40%' }}></div>
                                        </div>
                                        <span className="expertise__exam-score expertise__exam-score--green">85</span>
                                    </div>
                                    {/* Row 4 */}
                                    <div className="expertise__exam-row" style={{ justifyContent: 'flex-end' }}>
                                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="User 4" className="expertise__exam-avatar" />
                                        <div className="expertise__exam-bar-wrap">
                                            <div className="expertise__exam-bar expertise__exam-bar--red" style={{ width: '30%' }}></div>
                                        </div>
                                        <span className="expertise__exam-score expertise__exam-score--pink">75</span>
                                    </div>
                                </div>
                                <div className="expertise__exam-footer">
                                    <span className="expertise__exam-wave">👋</span>
                                    <button className="expertise__exam-export">Export</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Feature 5: One-One Immersive learning ────── */}
            <div className="expertise__block expertise__block--white">
                <div className="container">
                    <div className="expertise__inner">
                        {/* Left – Private Discussion UI */}
                        <div className="expertise__visual">
                            <div className="expertise__private-call">
                                <div className="expertise__pc-corner-accent"></div>
                                {/* Group icon */}
                                <div className="expertise__pc-group-icon">👥</div>
                                {/* Blurred top bar to show locked group */}
                                <div className="expertise__pc-bg-window">
                                    <div className="expertise__pc-blurred-row">
                                        <div className="expertise__pc-blurred-face"></div>
                                        <div className="expertise__pc-blurred-face"></div>
                                        <div className="expertise__pc-blurred-face"></div>
                                    </div>
                                </div>
                                {/* 2-person grid */}
                                <div className="expertise__pc-main">
                                    <div className="expertise__pc-cell">
                                        <img src="https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=300&q=80" alt="Mentor" />
                                    </div>
                                    <div className="expertise__pc-cell">
                                        <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80" alt="Patricia Mendoza" />
                                        <span className="expertise__vc-label">Patricia Mendoza</span>
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className="expertise__pc-info">
                                    <div>
                                        <span className="expertise__pc-title">Private Discussion</span>
                                        <p className="expertise__pc-sub">Your video can't be seen by others</p>
                                    </div>
                                    <button className="expertise__pc-end-btn">End Discussion</button>
                                </div>
                                <div className="expertise__pc-corner-accent expertise__pc-corner-accent--orange"></div>
                            </div>
                        </div>
                        {/* Right – text */}
                        <div className="expertise__content">
                            <h3 className="expertise__title">
                                <span style={{ color: 'var(--color-teal)' }}>One-One Immersive learning</span><br />
                                with continuous support
                            </h3>
                            <ul className="expertise__feature-list">
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Train with interactive tools and simulations that mirror real exam scenarios.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>Stay ahead with ongoing support, regular material updates, and fresh study content.</span>
                                </li>
                                <li className="expertise__feature-item">
                                    <PeopleIcon />
                                    <span>We guide you from first practice through final readiness, every step of the way.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
