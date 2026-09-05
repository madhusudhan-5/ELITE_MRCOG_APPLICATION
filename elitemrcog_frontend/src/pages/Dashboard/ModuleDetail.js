import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import PdfViewer from '../../components/Student/PdfViewer';
import { Lock, BookOpen, Home, BookMarked } from 'lucide-react';
import './ModuleDetail.css';

const ModuleDetail = () => {
    const { id } = useParams();
    const outletContext = useOutletContext();
    const setCustomBreadcrumbs = outletContext?.setCustomBreadcrumbs;

    const [article, setArticle] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stationProgress, setStationProgress] = useState({});

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await api.get(`/api/content/reading/${id}/`);
                setArticle(res.data);
                // Auto-select first station
                const firstStation = res.data.stations?.[0];
                if (firstStation) setSelectedStation(firstStation);

                // Build progress map from API response
                const progressMap = {};
                res.data.stations?.forEach(s => {
                    if (s.user_progress) {
                        progressMap[s.id] = s.user_progress;
                    }
                });
                setStationProgress(progressMap);
            } catch (err) {
                console.error('Failed to load module', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    // Update complete breadcrumbs path (Home > Reading Library > Module Name > Article Name)
    useEffect(() => {
        if (article && setCustomBreadcrumbs) {
            const crumbs = [
                { label: 'Home', path: '/dashboard', icon: Home },
                { label: 'Reading Library', path: '/dashboard/reading', icon: BookOpen }
            ];

            if (article.module_title) {
                crumbs.push({
                    label: article.module_title,
                    path: '/dashboard/reading'
                });
            }

            if (article.title) {
                crumbs.push({
                    label: article.title,
                    icon: BookMarked
                });
            }

            setCustomBreadcrumbs(crumbs);
        }
    }, [article, setCustomBreadcrumbs]);

    const handleProgressUpdate = (progressData) => {
        setStationProgress(prev => ({
            ...prev,
            [progressData.station]: {
                percent: progressData.progress_percent,
                current_page: progressData.current_page,
                completed: progressData.progress_percent >= 100,
            }
        }));
    };

const COLOR_PALETTE = ['#49BBBD', '#F48C06', '#9DCCFF', '#EE645B', '#BF9A72'];

    const getStationColor = (idx) => {
        return COLOR_PALETTE[idx % COLOR_PALETTE.length];
    };

    if (loading) {
        return (
            <div className="md-loading">
                <div className="md-spinner" />
                <p>Loading module...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="md-error">
                <p>Module not found. <Link to="/dashboard/reading">Back to Library</Link></p>
            </div>
        );
    }

    return (
        <div className="module-detail">

            <div className="md-body">
                {/* Left: Station List */}
                <aside className="md-station-sidebar">
                    <div className="md-sidebar-header">
                        <h2 className="md-sidebar-title">{article.title}</h2>
                        <span className="md-station-count">{article.station_count} Stations</span>
                    </div>

                    <div className="md-station-list">
                        {article.stations?.map((station, idx) => {
                            const progress = stationProgress[station.id];
                            const isActive = selectedStation?.id === station.id;
                            const isCompleted = progress?.completed;
                            const isLocked = station.is_locked;
                            const cardColor = getStationColor(idx);

                            return (
                                <button
                                    key={station.id}
                                    className={`md-station-card ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                    aria-current={isActive ? 'true' : undefined}
                                    title={station.title}
                                    style={{
                                        '--card-accent': cardColor,
                                        borderLeftColor: isActive ? '#2563eb' : cardColor,
                                        backgroundColor: isActive ? '#eff6ff' : `${cardColor}0F`
                                    }}
                                    onClick={() => !isLocked && setSelectedStation(station)}
                                    disabled={isLocked}
                                >
                                    <div className="md-card-top">
                                        <span className="md-card-num" style={{ backgroundColor: isActive ? '#2563eb' : cardColor, color: '#ffffff' }}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className="md-card-name" title={station.title}>{station.title}</span>
                                        {isActive && (
                                            <span className="md-card-active-badge" aria-label="Currently active lesson">
                                                <span className="md-active-dot"></span>
                                                Active
                                            </span>
                                        )}
                                        {isLocked && <Lock size={13} className="md-card-lock" />}
                                        {station.is_free && !isLocked && !isActive && (
                                            <span className="md-card-free-badge">Free</span>
                                        )}
                                    </div>

                                    <div className="md-card-bottom">
                                        {isCompleted ? (
                                            <span className="md-card-status complete">Complete ✓</span>
                                        ) : progress?.percent > 0 ? (
                                            <span className="md-card-status in-progress">{progress.percent}% Complete</span>
                                        ) : (
                                            <span className="md-card-status">{station.is_free ? 'Free Preview' : 'Locked'}</span>
                                        )}
                                        {progress && !isCompleted && (
                                            <span className="md-card-page-count">
                                                {String(progress.current_page || 1).padStart(2, '0')}/{station.page_count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress accent bar at bottom */}
                                    {progress && (
                                        <div className="md-card-progress-bar">
                                            <div
                                                className="md-card-progress-fill"
                                                style={{ width: `${progress.percent}%`, backgroundColor: cardColor }}
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                        {article.stations?.length === 0 && (
                            <p className="md-no-stations">No stations available yet.</p>
                        )}

                        {/* Subscribe CTA */}
                        {article.stations?.some(s => s.is_locked) && (
                            <div className="md-subscribe-cta">
                                <p>🔒 Unlock all stations</p>
                                <Link to="/dashboard/subscription" className="md-subscribe-btn">
                                    View Plans
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right: PDF Viewer + Description */}
                <main className="md-content-area">
                    {selectedStation ? (
                        <PdfViewer
                            key={selectedStation.id}
                            stationId={selectedStation.id}
                            pageCount={selectedStation.page_count}
                            stationTitle={selectedStation.title}
                            onProgressUpdate={handleProgressUpdate}
                        />
                    ) : (
                        <div className="md-viewer-placeholder">
                            <h3>Select a station to begin reading</h3>
                        </div>
                    )}

                    {/* Extended Description below viewer */}
                    {(article.overview_text || article.module_long_text) && (
                        <div className="md-description-section">
                            <h3 className="md-desc-title">{article.title}</h3>
                            <div className="md-desc-text">
                                {(article.overview_text || article.module_long_text)
                                    .split('\n')
                                    .map((para, i) => para.trim() && <p key={i}>{para}</p>)
                                }
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ModuleDetail;
