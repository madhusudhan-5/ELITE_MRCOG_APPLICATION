import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { CheckCircle, Loader, RotateCcw, RotateCw } from 'lucide-react';
import './VideoViewer.css';
import logo from '../../assets/images/logo.jpeg';
import WatermarkOverlay from './WatermarkOverlay';

const VideoViewer = ({ videoId, embedUrl, hasVideoFile, videoTitle, onProgressUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [isBlurred, setIsBlurred] = useState(false);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const lastProgress = useRef(0);
    const startXRef = useRef(0);
    const startTimeRef = useRef(0);

    const seekRelative = useCallback((seconds) => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime || 0;
            const duration = videoRef.current.duration || 0;
            const target = Math.min(duration, Math.max(0, current + seconds));
            videoRef.current.currentTime = target;
        }
    }, []);

    // Mouse / Touchpad Drag-to-Seek handling
    const handleMouseDown = (e) => {
        if (!videoRef.current || e.button !== 0) return;
        setIsScrubbing(true);
        startXRef.current = e.clientX;
        startTimeRef.current = videoRef.current.currentTime || 0;
    };

    const handleMouseMove = useCallback((e) => {
        if (!isScrubbing || !videoRef.current) return;
        const deltaX = e.clientX - startXRef.current;
        const sensitivity = 0.15; // 0.15 seconds per pixel dragged
        const duration = videoRef.current.duration || 0;
        const targetTime = Math.min(duration, Math.max(0, startTimeRef.current + deltaX * sensitivity));
        videoRef.current.currentTime = targetTime;
    }, [isScrubbing]);

    const handleMouseUp = useCallback(() => {
        setIsScrubbing(false);
    }, []);

    useEffect(() => {
        if (isScrubbing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isScrubbing, handleMouseMove, handleMouseUp]);

    // Anti-piracy & Keyboard Seek controls (Left/Right arrow, J/L keys)
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

            // Keyboard navigation for video seek/forward/backward
            if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
                    e.preventDefault();
                    seekRelative(10);
                } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
                    e.preventDefault();
                    seekRelative(-10);
                } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
                    if (videoRef.current) {
                        e.preventDefault();
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                    }
                }
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
    }, [seekRelative]);

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
            <div 
                className="video-iframe-wrapper" 
                ref={wrapperRef}
                onMouseDown={handleMouseDown}
                style={{ cursor: isScrubbing ? 'ew-resize' : 'default' }}
            >
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
                        controlsList="nofullscreen nodownload"
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
                <div className="video-seek-btn-group">
                    <button 
                        type="button"
                        className="video-seek-btn" 
                        onClick={() => seekRelative(-10)}
                        title="Rewind 10 seconds (← or J)"
                    >
                        <RotateCcw size={16} /> -10s
                    </button>
                    <button 
                        type="button"
                        className="video-seek-btn" 
                        onClick={() => seekRelative(10)}
                        title="Forward 10 seconds (→ or L)"
                    >
                        +10s <RotateCw size={16} />
                    </button>
                </div>
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
