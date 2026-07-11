import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, Loader } from 'lucide-react';
import './VideoViewer.css';
import logo from '../../assets/images/logo.jpeg';
import WatermarkOverlay from './WatermarkOverlay';

const VideoViewer = ({ videoId, embedUrl, hasVideoFile, videoTitle, onProgressUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [isBlurred, setIsBlurred] = useState(false);
    const videoRef = useRef(null);
    const progressInterval = useRef(null);
    const lastProgress = useRef(0);

    // Anti-piracy: Block keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                e.key === 'PrintScreen' ||
                e.key === 'F12' ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
                (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        const handleBlur = () => setIsBlurred(true);
        const handleFocus = () => setIsBlurred(false);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Auto-update progress for native video player
    useEffect(() => {
        if (!hasVideoFile) return;

        const updateBackendProgress = async (currentTime, duration) => {
            if (!duration) return;
            const percent = Math.min(100, Math.round((currentTime / duration) * 100));
            // Only update if progress increased by > 2% or reached 100% to save API calls
            if (percent >= 100 || percent - lastProgress.current >= 2) {
                lastProgress.current = percent;
                try {
                    const res = await api.post('/api/content/video-progress/update/', {
                        video: videoId,
                        current_time: currentTime,
                        progress_percent: percent
                    });
                    if (onProgressUpdate) {
                        onProgressUpdate(res.data);
                    }
                } catch (err) {
                    console.error("Auto progress update failed", err);
                }
            }
        };

        const handleTimeUpdate = () => {
            if (videoRef.current) {
                const ct = videoRef.current.currentTime;
                const dur = videoRef.current.duration;
                updateBackendProgress(ct, dur);
            }
        };

        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.addEventListener('timeupdate', handleTimeUpdate);
        }

        return () => {
            if (videoEl) {
                videoEl.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };
    }, [hasVideoFile, videoId, onProgressUpdate]);

    const markAsComplete = async () => {
        setUpdating(true);
        try {
            const res = await api.post('/api/content/video-progress/update/', {
                video: videoId,
                current_time: videoRef.current ? videoRef.current.duration : 0,
                progress_percent: 100
            });
            if (onProgressUpdate) {
                onProgressUpdate(res.data);
            }
        } catch (err) {
            console.error("Failed to update video progress", err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div 
            className={`video-viewer-container ${isBlurred ? 'anti-piracy-blur' : ''}`}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
        >
            <div className="video-iframe-wrapper">
                <WatermarkOverlay />
                {isBuffering && (
                    <div className="video-buffering-overlay">
                        <Loader size={48} className="animate-spin text-white" />
                    </div>
                )}
                {hasVideoFile ? (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay={true}
                        controlsList="nodownload"
                        disablePictureInPicture
                        className="video-iframe native-video"
                        poster={logo}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => setIsBuffering(false)}
                        onCanPlay={() => setIsBuffering(false)}
                        onLoadStart={() => setIsBuffering(true)}
                        onLoadedData={() => setIsBuffering(false)}
                        onPause={() => setIsBuffering(false)}
                        onSuspend={() => setIsBuffering(false)}
                        onError={() => setIsBuffering(false)}
                    >
                        <source src={api.defaults.baseURL ? `${api.defaults.baseURL}/api/content/videos/${videoId}/stream/` : `/api/content/videos/${videoId}/stream/`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <iframe
                        src={embedUrl}
                        title={videoTitle}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="video-iframe"
                        onLoad={() => setIsBuffering(false)}
                    ></iframe>
                )}
            </div>
            <div className="video-viewer-controls">
                <button 
                    className="mark-complete-btn" 
                    onClick={markAsComplete}
                    disabled={updating}
                >
                    {updating ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Mark as Complete
                </button>
            </div>
        </div>
    );
};

export default VideoViewer;
