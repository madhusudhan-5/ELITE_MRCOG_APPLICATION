import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import VideoViewer from '../../components/Student/VideoViewer';
import { Lock, PlayCircle, Clock, Home, Video, CheckCircle, Star } from 'lucide-react';
import './VideoModuleDetail.css';

const VideoModuleDetail = () => {
    const { id } = useParams();
    const outletContext = useOutletContext();
    const setCustomBreadcrumbs = outletContext?.setCustomBreadcrumbs;

    const [moduleData, setModuleData] = useState(null);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoDetails, setVideoDetails] = useState({}); // Cache for video details (embed_url)
    const [loading, setLoading] = useState(true);
    const [videoProgress, setVideoProgress] = useState({});

    useEffect(() => {
        const fetchModuleData = async () => {
            try {
                // Fetch module details
                const moduleRes = await api.get(`/api/content/modules/${id}/`);
                setModuleData(moduleRes.data);

                // Fetch list of videos for this module
                const videosRes = await api.get(`/api/content/videos/?module=${id}`);
                const videoList = videosRes.data.results || videosRes.data;
                setVideos(videoList);

                // Fetch user video progress
                try {
                    const progRes = await api.get('/api/content/video-progress/');
                    const progData = progRes.data.results || progRes.data;
                    const progressMap = {};
                    progData.forEach(p => {
                        progressMap[p.video] = p;
                    });
                    setVideoProgress(progressMap);
                } catch (e) {
                    console.warn("Could not load video progress", e);
                }

                if (videoList.length > 0) {
                    handleSelectVideo(videoList[0]);
                }
            } catch (err) {
                console.error('Failed to load video module', err);
            } finally {
                setLoading(false);
            }
        };
        fetchModuleData();
    }, [id]);

    // Update complete breadcrumbs path (Home > Video Library > Module Name > Video Name)
    useEffect(() => {
        if (moduleData && setCustomBreadcrumbs) {
            const crumbs = [
                { label: 'Home', path: '/dashboard', icon: Home },
                { label: 'Video Library', path: '/dashboard/video', icon: PlayCircle }
            ];

            if (moduleData.title) {
                crumbs.push({
                    label: moduleData.title,
                    path: selectedVideo ? `/dashboard/video-modules/${id}` : null
                });
            }

            if (selectedVideo?.title) {
                crumbs.push({
                    label: selectedVideo.title,
                    icon: Video
                });
            }

            setCustomBreadcrumbs(crumbs);
        }
    }, [moduleData, selectedVideo, id, setCustomBreadcrumbs]);

    const handleSelectVideo = async (videoItem) => {
        setSelectedVideo(videoItem);
        // Fetch detail if not already cached (need embed_url)
        if (!videoDetails[videoItem.id]) {
            try {
                const detailRes = await api.get(`/api/content/videos/${videoItem.id}/`);
                setVideoDetails(prev => ({
                    ...prev,
                    [videoItem.id]: detailRes.data
                }));
            } catch (err) {
                console.error("Failed to load video details, maybe locked", err);
                if (err.response && err.response.status === 403) {
                    // It's locked
                    setVideoDetails(prev => ({
                        ...prev,
                        [videoItem.id]: { locked: true }
                    }));
                }
            }
        }
    };

    const handleProgressUpdate = useCallback((progressData) => {
        setVideoProgress(prev => ({
            ...prev,
            [progressData.video]: progressData
        }));
    }, []);

    const COLOR_PALETTE = ['#49BBBD', '#F48C06', '#9DCCFF', '#EE645B', '#BF9A72'];

    const getVideoColor = (idx) => {
        return COLOR_PALETTE[idx % COLOR_PALETTE.length];
    };

    if (loading) {
        return (
            <div className="vmd-loading">
                <div className="vmd-spinner" />
                <p>Loading video module...</p>
            </div>
        );
    }

    if (!moduleData) {
        return (
            <div className="vmd-error">
                <p>Module not found. <Link to="/dashboard/video">Back to Video Library</Link></p>
            </div>
        );
    }

    const currentDetail = selectedVideo ? videoDetails[selectedVideo.id] : null;

    return (
        <div className="video-module-detail">
            <div className="vmd-body">
                {/* Left: Video List Sidebar */}
                <aside className="vmd-sidebar">
                    <div className="vmd-sidebar-header">
                        <h2 className="vmd-sidebar-title" title={moduleData.title}>{moduleData.title}</h2>
                        <span className="vmd-count">{videos.length} {videos.length === 1 ? 'Video' : 'Videos'}</span>
                    </div>

                    <div className="vmd-video-list">
                        {videos.map((video, idx) => {
                            const progress = videoProgress[video.id];
                            const isActive = selectedVideo?.id === video.id;
                            const isCompleted = progress?.progress_percent >= 100;
                            const isLocked = videoDetails[video.id]?.locked || (!video.is_free && currentDetail?.locked);
                            const cardColor = getVideoColor(idx);

                            return (
                                <button
                                    key={video.id}
                                    className={`vmd-card ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                    aria-current={isActive ? 'true' : undefined}
                                    title={video.title}
                                    style={{
                                        '--card-accent': cardColor,
                                        borderLeftColor: isActive ? '#2563eb' : cardColor,
                                        backgroundColor: isActive ? '#eff6ff' : `${cardColor}0F`
                                    }}
                                    onClick={() => handleSelectVideo(video)}
                                >
                                    <div className="vmd-card-top">
                                        <span className="vmd-card-num" style={{ backgroundColor: isActive ? '#2563eb' : cardColor, color: '#ffffff' }}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className="vmd-card-name" title={video.title}>{video.title}</span>
                                        {isActive && (
                                            <span className="vmd-card-active-badge" aria-label="Currently playing video">
                                                <span className="vmd-active-dot"></span>
                                                Playing
                                            </span>
                                        )}
                                        {isLocked && <Lock size={13} className="vmd-card-lock" aria-label="Locked Video" role="img" />}
                                        {video.is_free && !isActive && !isLocked && (
                                            <span className="vmd-card-free-badge">Free</span>
                                        )}
                                    </div>

                                    <div className="vmd-card-bottom">
                                        {isCompleted ? (
                                            <span className="vmd-card-status complete">Complete ✓</span>
                                        ) : progress?.progress_percent > 0 ? (
                                            <span className="vmd-card-status in-progress">{progress.progress_percent}% Watched</span>
                                        ) : (
                                            <span className="vmd-card-status">
                                                {video.is_free ? 'Free Video' : 'Locked'}
                                            </span>
                                        )}
                                        {video.duration_display && (
                                            <span className="vmd-card-duration">
                                                <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                                {video.duration_display}
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress accent bar at bottom */}
                                    {progress && (
                                        <div className="vmd-card-progress-bar">
                                            <div
                                                className="vmd-card-progress-fill"
                                                style={{ width: `${progress.progress_percent || 0}%`, backgroundColor: cardColor }}
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                        {videos.length === 0 && (
                            <div className="vmd-no-videos">
                                <PlayCircle size={32} className="vmd-no-videos-icon" />
                                <p>No videos available in this module yet.</p>
                            </div>
                        )}
                        
                        {videos.some(v => !v.is_free) && (
                            <div className="vmd-subscribe-cta">
                                <p>🔒 Unlock all videos</p>
                                <Link to="/dashboard/subscription" className="vmd-subscribe-btn">
                                    View Plans
                                </Link>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right: Video Viewer + Description */}
                <main className="vmd-content-area">
                    {selectedVideo ? (
                        currentDetail && currentDetail.locked ? (
                            <div className="vmd-locked-state">
                                <div className="vmd-locked-cinema">
                                    <div className="vmd-locked-cinema-overlay">
                                        <div className="vmd-locked-badge">
                                            <Lock size={16} className="vmd-locked-badge-icon" />
                                            <span>Premium Video Lecture</span>
                                        </div>
                                        <h3 className="vmd-locked-video-title" title={selectedVideo.title}>{selectedVideo.title}</h3>
                                        <p className="vmd-locked-video-subtitle">This clinical station video lecture requires an active subscription.</p>
                                        
                                        <div className="vmd-locked-benefits">
                                            <div className="vmd-benefit-item">
                                                <CheckCircle size={15} className="vmd-benefit-icon" />
                                                <span>Full High-Definition Clinical Demonstrations & Roleplays</span>
                                            </div>
                                            <div className="vmd-benefit-item">
                                                <CheckCircle size={15} className="vmd-benefit-icon" />
                                                <span>Complete station-wise video guides & examiner tips</span>
                                            </div>
                                            <div className="vmd-benefit-item">
                                                <CheckCircle size={15} className="vmd-benefit-icon" />
                                                <span>Unlimited access across all Reading & Video modules</span>
                                            </div>
                                        </div>

                                        <div className="vmd-locked-actions">
                                            <Link to="/dashboard/subscription" className="vmd-subscribe-btn-large">
                                                <Star size={16} /> Unlock All Content — View Plans
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : currentDetail && (currentDetail.embed_url || currentDetail.has_video_file) ? (
                            <>
                                <div className="vmd-playing-header">
                                    <h2 className="vmd-playing-title" title={selectedVideo.title}>
                                        {selectedVideo.title}
                                    </h2>
                                </div>
                                <VideoViewer
                                    key={selectedVideo.id}
                                    videoId={selectedVideo.id}
                                    embedUrl={currentDetail.embed_url}
                                    hasVideoFile={currentDetail.has_video_file}
                                    videoTitle={selectedVideo.title}
                                    onProgressUpdate={handleProgressUpdate}
                                />
                            </>
                        ) : (
                            <div className="vmd-loading-viewer">
                                <div className="vmd-spinner" />
                                <p>Loading video...</p>
                            </div>
                        )
                    ) : (
                        <div className="vmd-placeholder">
                            <PlayCircle size={48} />
                            <h3>Select a video to begin watching</h3>
                        </div>
                    )}

                    {/* Extended Description */}
                    {(currentDetail?.long_description || moduleData.long_text) && (
                        <div className="vmd-description-section">
                            <h3 className="vmd-desc-title" title={currentDetail?.title || moduleData.title}>
                                {currentDetail?.title || moduleData.title}
                            </h3>
                            <div className="vmd-desc-text">
                                {(currentDetail?.long_description || moduleData.long_text)
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

export default VideoModuleDetail;
