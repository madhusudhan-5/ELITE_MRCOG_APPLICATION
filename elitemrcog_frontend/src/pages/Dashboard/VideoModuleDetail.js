import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import VideoViewer from '../../components/Student/VideoViewer';
import { Lock, Home, PlayCircle, Clock } from 'lucide-react';
import './VideoModuleDetail.css';

const VideoModuleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const handleProgressUpdate = (progressData) => {
        setVideoProgress(prev => ({
            ...prev,
            [progressData.video]: progressData
        }));
    };

    const getVideoColor = (video) => {
        const progress = videoProgress[video.id];
        if (progress?.progress_percent >= 100) return 'video-complete';
        if (videoDetails[video.id]?.locked) return 'video-locked';
        if (video.is_free) return 'video-free';
        return 'video-locked'; // Default to locked styling if not free, actual lock state is verified on click
    };

    if (loading) {
        return (
            <div className="vmd-loading">
                <div className="vmd-spinner" />
                <p>Loading module...</p>
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
            {/* Breadcrumb */}
            <nav className="vmd-breadcrumb">
                <Link to="/dashboard"><Home size={14} /> Home</Link>
                <span>›</span>
                <Link to="/dashboard/video">Video Library</Link>
                <span>›</span>
                <span className="vmd-breadcrumb-current">{moduleData.title}</span>
            </nav>

            <div className="vmd-body">
                {/* Left: Video List Sidebar */}
                <aside className="vmd-sidebar">
                    <div className="vmd-sidebar-header">
                        <h2 className="vmd-sidebar-title">{moduleData.title}</h2>
                        <span className="vmd-count">{videos.length} Videos</span>
                    </div>

                    <div className="vmd-video-list">
                        {videos.map((video, idx) => {
                            const progress = videoProgress[video.id];
                            const isActive = selectedVideo?.id === video.id;
                            const isCompleted = progress?.progress_percent >= 100;
                            const isLocked = currentDetail?.locked && isActive ? true : (!video.is_free && !currentDetail);
                            const colorClass = getVideoColor(video);

                            return (
                                <button
                                    key={video.id}
                                    className={`vmd-card ${colorClass} ${isActive ? 'active' : ''}`}
                                    onClick={() => handleSelectVideo(video)}
                                >
                                    <div className="vmd-card-top">
                                        <span className="vmd-card-num">{String(idx + 1).padStart(2, '0')}</span>
                                        <span className="vmd-card-name">{video.title}</span>
                                        {videoDetails[video.id]?.locked && <Lock size={13} className="vmd-card-lock" />}
                                        {video.is_free && (
                                            <span className="vmd-card-free-badge">Free</span>
                                        )}
                                    </div>

                                    <div className="vmd-card-bottom">
                                        {isCompleted ? (
                                            <span className="vmd-card-status complete">Complete ✓</span>
                                        ) : (
                                            <span className="vmd-card-status">
                                                <Clock size={12}/> {video.duration_display || 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {videos.length === 0 && (
                            <p className="vmd-no-videos">No videos available yet.</p>
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
                                <Lock size={48} className="vmd-locked-icon" />
                                <h2>Premium Content</h2>
                                <p>This video requires an active subscription.</p>
                                <Link to="/dashboard/subscription" className="vmd-subscribe-btn-large">
                                    Subscribe Now
                                </Link>
                            </div>
                        ) : currentDetail && (currentDetail.embed_url || currentDetail.has_video_file) ? (
                            <VideoViewer
                                key={selectedVideo.id}
                                videoId={selectedVideo.id}
                                embedUrl={currentDetail.embed_url}
                                hasVideoFile={currentDetail.has_video_file}
                                videoTitle={selectedVideo.title}
                                onProgressUpdate={handleProgressUpdate}
                            />
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
                            <h3 className="vmd-desc-title">{currentDetail?.title || moduleData.title}</h3>
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
