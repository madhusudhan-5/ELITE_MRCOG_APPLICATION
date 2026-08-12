import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { CheckCircle, Loader, RotateCcw, RotateCw, Maximize, Minimize } from 'lucide-react';
import './VideoViewer.css';
import logo from '../../assets/images/logo.jpeg';
import WatermarkOverlay from './WatermarkOverlay';

const VideoViewer = ({ videoId, embedUrl, hasVideoFile, videoTitle, onProgressUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [isBlurred, setIsBlurred] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
    const isFullscreenActive = isFullscreen || isPseudoFullscreen;
    const videoRef = useRef(null);
    const wrapperRef = useRef(null);
    const lastProgress = useRef(0);

    const targetSeekRef = useRef(null);
    const targetSeekTimer = useRef(null);

    // Guaranteed safe seek relative (never NaN, supports rapid repeated clicks)
    const seekRelative = useCallback((seconds) => {
        const video = videoRef.current;
        if (!video) return;

        try {
            const baseTime = targetSeekRef.current !== null ? targetSeekRef.current : (video.currentTime || 0);
            const dur = video.duration;
            const duration = (Number.isFinite(dur) && dur > 0) ? dur : (baseTime + 3600);
            const target = Math.min(duration, Math.max(0, baseTime + seconds));

            targetSeekRef.current = target;
            if (targetSeekTimer.current) clearTimeout(targetSeekTimer.current);
            targetSeekTimer.current = setTimeout(() => {
                targetSeekRef.current = null;
            }, 800);

            if (typeof video.fastSeek === 'function') {
                video.fastSeek(target);
            } else {
                video.currentTime = target;
            }
        } catch (err) {
            console.warn("Relative seek error:", err);
        }
    }, []);

    // Fullscreen state tracking & toggle
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            setIsFullscreen(isFS);
            if (!isFS) {
                setIsPseudoFullscreen(false);
            }
            try {
                if (isFS) {
                    if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
                        window.screen.orientation.lock('landscape').catch(err => {
                            console.warn("Screen orientation lock failed:", err);
                        });
                    }
                } else {
                    if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
                        window.screen.orientation.unlock();
                    }
                }
            } catch (err) {
                console.warn("Fullscreen orientation lock caught error:", err);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        const target = wrapperRef.current || videoRef.current;
        if (!target) return;
        try {
            if (!isFullscreenActive) {
                const requestFS = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
                if (requestFS) {
                    requestFS.call(target).catch(err => {
                        console.warn("Fullscreen request failed, using pseudo-fullscreen:", err);
                        setIsPseudoFullscreen(true);
                    });
                } else {
                    setIsPseudoFullscreen(true);
                }
            } else {
                if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                    const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                    if (exitFS) {
                        exitFS.call(document).catch(err => console.warn(err));
                    }
                }
                setIsPseudoFullscreen(false);
            }
        } catch (err) {
            console.warn("Fullscreen toggle caught:", err);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPseudoFullscreen) {
                setIsPseudoFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPseudoFullscreen]);



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
        const handleBlur = () => {
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (!isMobile) {
                setIsBlurred(true);
            }
        };
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
            <div className={`video-iframe-wrapper ${isPseudoFullscreen ? 'pseudo-fullscreen' : ''}`} ref={wrapperRef}>
                <WatermarkOverlay />
                {isBuffering && (
                    <div className="video-buffering-overlay">
                        <Loader size={48} className="animate-spin text-white" />
                    </div>
                )}
                {isFullscreenActive && (
                    <button
                        type="button"
                        className="video-fullscreen-exit-overlay-btn"
                        onClick={toggleFullscreen}
                        title="Exit Fullscreen"
                    >
                        <Minimize size={18} />
                    </button>
                )}
                {hasVideoFile ? (
                    <video
                        ref={videoRef}
                        src={api.defaults.baseURL ? `${api.defaults.baseURL}/api/content/videos/${videoId}/stream/` : `/api/content/videos/${videoId}/stream/`}
                        controls
                        autoPlay={true}
                        preload="metadata"
                        playsInline
                        controlsList="nofullscreen nodownload"
                        disablePictureInPicture
                        className="video-iframe native-video"
                        poster={logo}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => setIsBuffering(false)}
                        onCanPlay={() => setIsBuffering(false)}
                        onSeeked={() => {
                            setIsBuffering(false);
                            targetSeekRef.current = null;
                        }}
                        onLoadStart={() => setIsBuffering(true)}
                        onLoadedData={() => setIsBuffering(false)}
                        onPause={() => setIsBuffering(false)}
                        onSuspend={() => setIsBuffering(false)}
                        onError={() => setIsBuffering(false)}
                    >
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
                    <button 
                        type="button"
                        className="video-seek-btn" 
                        onClick={toggleFullscreen}
                        title={isFullscreenActive ? 'Exit Fullscreen' : 'Fullscreen (Watermarked)'}
                    >
                        {isFullscreenActive ? <Minimize size={16} /> : <Maximize size={16} />}
                        {isFullscreenActive ? 'Exit Fullscreen' : 'Fullscreen'}
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
