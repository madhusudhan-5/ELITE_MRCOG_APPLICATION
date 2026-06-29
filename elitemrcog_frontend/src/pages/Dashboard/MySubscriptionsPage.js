import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, PlayCircle, ClipboardList, Calendar, CheckCircle } from 'lucide-react';
import './MySubscriptionsPage.css';

const LIBRARY_CONFIG = {
    reading: { label: 'Reading Library', icon: <BookOpen size={22} />, link: '/dashboard/reading', color: '#dcfce7', textColor: '#16a34a' },
    video: { label: 'Video Library', icon: <PlayCircle size={22} />, link: '/dashboard/videos', color: '#dbeafe', textColor: '#2563eb' },
    mock_exam: { label: 'Mock Exam', icon: <ClipboardList size={22} />, link: '/dashboard/mock-exam', color: '#fce7f3', textColor: '#db2777' },
};

const MySubscriptionsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/subscriptions/my/')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="mysub-loading">
                <div className="mysub-spinner" />
                <p>Loading your subscriptions...</p>
            </div>
        );
    }

    const subs = data?.subscriptions || [];
    const unlocked = data?.unlocked_libraries || [];

    // Group subscriptions by bundle
    const byBundle = {};
    subs.forEach(sub => {
        const key = sub.bundle?.id || sub.plan?.id || 'manual';
        const label = sub.bundle?.title || sub.plan?.name || 'Manual Subscription';
        if (!byBundle[key]) byBundle[key] = { label, subs: [] };
        byBundle[key].subs.push(sub);
    });

    return (
        <div className="mysub-page">
            <div className="mysub-header">
                <h1>My Subscriptions</h1>
                <Link to="/dashboard/subscription" className="mysub-upgrade-btn">Browse Plans</Link>
            </div>

            {/* Unlocked Libraries Quick Access */}
            {unlocked.length > 0 && (
                <div className="mysub-access-section">
                    <h2 className="mysub-section-title">Unlocked Libraries</h2>
                    <div className="mysub-libs-grid">
                        {unlocked.map(lib => {
                            const cfg = LIBRARY_CONFIG[lib];
                            if (!cfg) return null;
                            return (
                                <Link key={lib} to={cfg.link} className="mysub-lib-card" style={{ '--lib-bg': cfg.color, '--lib-color': cfg.textColor }}>
                                    <div className="mysub-lib-icon">{cfg.icon}</div>
                                    <span className="mysub-lib-label">{cfg.label}</span>
                                    <span className="mysub-lib-cta">Open Library →</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Subscriptions */}
            <div className="mysub-subs-section">
                <h2 className="mysub-section-title">Active Plans</h2>

                {Object.keys(byBundle).length === 0 ? (
                    <div className="mysub-empty">
                        <CheckCircle size={48} className="mysub-empty-icon" />
                        <h3>No active subscriptions</h3>
                        <p>Purchase a plan to unlock Reading, Video, and Mock Exam libraries.</p>
                        <Link to="/dashboard/subscription" className="mysub-browse-btn">Browse Subscription Plans</Link>
                    </div>
                ) : (
                    Object.entries(byBundle).map(([key, { label, subs: groupSubs }]) => (
                        <div key={key} className="mysub-bundle-card">
                            <div className="mysub-bundle-header">
                                <div className="mysub-bundle-title-row">
                                    <CheckCircle size={18} className="mysub-check" />
                                    <h3>{label}</h3>
                                </div>
                                <div className="mysub-expires">
                                    <Calendar size={13} />
                                    Expires {new Date(groupSubs[0]?.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="mysub-bundle-libs">
                                {groupSubs.map(sub => {
                                    const lib = sub.library_access;
                                    const cfg = LIBRARY_CONFIG[lib];
                                    if (!cfg) return null;
                                    return (
                                        <Link key={sub.id} to={cfg.link} className="mysub-bundle-lib-chip" style={{ background: cfg.color, color: cfg.textColor }}>
                                            {cfg.icon} {cfg.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MySubscriptionsPage;
