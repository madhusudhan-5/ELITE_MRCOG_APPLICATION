import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PdfViewer from '../../components/Student/PdfViewer';
import { Lock, CheckCircle, ChevronRight, Home } from 'lucide-react';
import './ModuleDetail.css';

const ModuleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const getStationColor = (station, idx) => {
        const progress = stationProgress[station.id];
        if (progress?.completed) return 'station-complete';
        if (station.is_locked) return 'station-locked';
        if (progress?.percent > 0) return 'station-progress';
        if (station.is_free) return 'station-free';
        return 'station-locked';
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
                            const colorClass = getStationColor(station, idx);

                            return (
                                <button
                                    key={station.id}
                                    className={`md-station-card ${colorClass} ${isActive ? 'active' : ''}`}
                                    onClick={() => !isLocked && setSelectedStation(station)}
                                    disabled={isLocked}
                                >
                                    <div className="md-card-top">
                                        <span className="md-card-num">{String(idx + 1).padStart(2, '0')}</span>
                                        <span className="md-card-name">{station.title}</span>
                                        {isLocked && <Lock size={13} className="md-card-lock" />}
                                        {station.is_free && !isLocked && (
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
                                                style={{ width: `${progress.percent}%` }}
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
