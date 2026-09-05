import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../../services/api';
import './PdfViewer.css';
import WatermarkOverlay from './WatermarkOverlay';

// Set up the PDF.js worker — must match installed pdfjs-dist version (5.x)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ stationId, pageCount: initialPageCount, stationTitle, onProgressUpdate }) => {
    const [numPages, setNumPages] = useState(initialPageCount || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState('1');
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBlurred, setIsBlurred] = useState(false);
    const [zoomScale, setZoomScale] = useState(1.0);
    const viewerRef = useRef(null);

    // Orientation lock helpers
    const lockLandscape = () => {
        try {
            if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
                window.screen.orientation.lock('landscape').catch(err => {
                    console.warn("Screen orientation lock error:", err);
                });
            } else if (window.screen?.lockOrientation) {
                window.screen.lockOrientation('landscape');
            } else if (window.screen?.mozLockOrientation) {
                window.screen.mozLockOrientation('landscape');
            } else if (window.screen?.msLockOrientation) {
                window.screen.msLockOrientation('landscape');
            }
        } catch (err) {
            console.warn("Orientation lock error:", err);
        }
    };

    const unlockOrientation = () => {
        try {
            if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
                window.screen.orientation.unlock();
            } else if (window.screen?.unlockOrientation) {
                window.screen.unlockOrientation();
            } else if (window.screen?.mozUnlockOrientation) {
                window.screen.mozUnlockOrientation();
            } else if (window.screen?.msUnlockOrientation) {
                window.screen.msUnlockOrientation();
            }
        } catch (err) {
            console.warn("Orientation unlock error:", err);
        }
    };

    // Fetch PDF as blob via protected API — never exposes direct URL
    useEffect(() => {
        if (!stationId) return;
        setLoading(true);
        setError(null);
        setPdfBlob(null);

        // Anti-piracy: Block keyboard shortcuts on desktop
        const handleKeyDown = (e) => {
            // Block Print Screen, F12, Ctrl+P, Ctrl+S, Ctrl+Shift+I, Cmd+S, Cmd+P
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

        const handleBlur = () => {
            // Reliably detect mobile devices including iPadOS desktop mode
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            const isMobile = isIOS || /Mobi|Android/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (!isMobile) {
                setIsBlurred(true);
            }
        };
        const handleFocus = () => setIsBlurred(false);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        api.get(`/api/content/stations/${stationId}/pdf/`, { responseType: 'blob' })
            .then(res => {
                const blob = new Blob([res.data], { type: 'application/pdf' });
                setPdfBlob(URL.createObjectURL(blob));
                setLoading(false);
            })
            .catch(err => {
                if (err.response?.status === 403) {
                    setError('locked');
                } else {
                    setError('Failed to load PDF. Please try again.');
                }
                setLoading(false);
            });

        return () => {
            if (pdfBlob) URL.revokeObjectURL(pdfBlob);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [stationId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Tracks container size for responsive PDF sizing
    const [containerWidth, setContainerWidth] = useState(700);
    const canvasAreaRef = useRef(null);
    const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
    const isFullscreenActive = isFullscreen || isPseudoFullscreen;

    useEffect(() => {
        const updateSize = () => {
            if (canvasAreaRef.current) {
                let newWidth = canvasAreaRef.current.clientWidth - 32;

                if (isFullscreenActive) {
                    const isMobile = window.innerWidth < 768;
                    newWidth = window.innerWidth - (isMobile ? 20 : 80);
                }

                setContainerWidth(Math.max(280, newWidth));
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        const timeout = setTimeout(updateSize, 100);

        return () => {
            window.removeEventListener('resize', updateSize);
            clearTimeout(timeout);
        };
    }, [isFullscreenActive, pdfBlob]);

    // Pinch to zoom support with hardware accelerated live transforms
    const touchStartDistRef = useRef(null);
    const touchStartScaleRef = useRef(1.0);

    const handleTouchStart = (e) => {
        setIsBlurred(false);
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartDistRef.current = dist;
            touchStartScaleRef.current = zoomScale;
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && touchStartDistRef.current) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = dist / touchStartDistRef.current;
            const liveScale = Math.min(2.5, Math.max(0.6, +(touchStartScaleRef.current * factor).toFixed(2)));
            if (canvasAreaRef.current) {
                const docWrapper = canvasAreaRef.current.querySelector('.react-pdf__Document');
                if (docWrapper) {
                    docWrapper.style.transform = `scale(${liveScale / zoomScale})`;
                    docWrapper.style.transformOrigin = 'center top';
                    docWrapper.style.transition = 'none';
                }
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (e.touches.length < 2 && touchStartDistRef.current) {
            if (canvasAreaRef.current) {
                const docWrapper = canvasAreaRef.current.querySelector('.react-pdf__Document');
                if (docWrapper) {
                    const currentTransform = docWrapper.style.transform;
                    const match = currentTransform.match(/scale\(([^)]+)\)/);
                    if (match) {
                        const ratio = parseFloat(match[1]);
                        if (!isNaN(ratio) && ratio !== 1) {
                            const newScale = Math.min(2.5, Math.max(0.6, +(zoomScale * ratio).toFixed(2)));
                            setZoomScale(newScale);
                        }
                    }
                    docWrapper.style.transform = '';
                    docWrapper.style.transformOrigin = '';
                    docWrapper.style.transition = '';
                }
            }
            touchStartDistRef.current = null;
        }
    };

    const handleZoomIn = () => {
        setZoomScale(prev => Math.min(2.5, +(prev + 0.2).toFixed(2)));
    };

    const handleZoomOut = () => {
        setZoomScale(prev => Math.max(0.6, +(prev - 0.2).toFixed(2)));
    };

    const handleResetZoom = () => {
        setZoomScale(1.0);
    };

    const saveProgress = useCallback((page, total) => {
        if (!stationId || !total) return;
        api.post('/api/content/progress/update/', {
            station: stationId,
            current_page: page,
        }).then(res => {
            if (onProgressUpdate) onProgressUpdate(res.data);
        }).catch(() => { });
    }, [stationId, onProgressUpdate]);

    const toggleFullscreen = () => {
        const docEl = viewerRef.current;
        if (!docEl) return;

        if (!isFullscreenActive) {
            lockLandscape();
            const requestFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
            if (requestFS) {
                requestFS.call(docEl).catch((err) => {
                    console.warn("Fullscreen request failed, using pseudo-fullscreen:", err);
                    setIsPseudoFullscreen(true);
                });
            } else {
                setIsPseudoFullscreen(true);
            }
        } else {
            unlockOrientation();
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (exitFS) {
                    exitFS.call(document).catch((err) => console.warn(err));
                }
            }
            setIsPseudoFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => {
            const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            setIsFullscreen(isFS);
            if (!isFS) {
                setIsPseudoFullscreen(false);
                unlockOrientation();
            } else {
                lockLandscape();
            }
        };
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);
        document.addEventListener('mozfullscreenchange', handler);
        document.addEventListener('MSFullscreenChange', handler);
        return () => {
            document.removeEventListener('fullscreenchange', handler);
            document.removeEventListener('webkitfullscreenchange', handler);
            document.removeEventListener('mozfullscreenchange', handler);
            document.removeEventListener('MSFullscreenChange', handler);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPseudoFullscreen) {
                setIsPseudoFullscreen(false);
                unlockOrientation();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPseudoFullscreen]);

    const total = numPages || initialPageCount || 1;

    useEffect(() => {
        setInputPage(String(currentPage));
    }, [currentPage]);

    if (loading) {
        return (
            <div className="pdf-loading">
                <div className="pdf-spinner" />
                <p>Loading station content...</p>
            </div>
        );
    }

    if (error === 'locked') {
        return (
            <div className="pdf-locked">
                <div className="pdf-lock-icon">🔒</div>
                <h3>This station is locked</h3>
                <p>Subscribe to unlock all stations and course content.</p>
                <a href="/dashboard/subscription" className="pdf-subscribe-btn">View Plans</a>
            </div>
        );
    }

    if (error) {
        return <div className="pdf-error">{error}</div>;
    }

    const handlePrev = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            saveProgress(newPage, total);
        }
    };

    const handleNext = () => {
        if (currentPage < total) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            saveProgress(newPage, total);
        }
    };

    const handlePageInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handlePageInputSubmit = (targetVal) => {
        const rawVal = targetVal !== undefined ? targetVal : inputPage;
        const pageNum = parseInt(rawVal, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= total) {
            if (pageNum !== currentPage) {
                setCurrentPage(pageNum);
                saveProgress(pageNum, total);
            }
            if (isFullscreenActive) {
                const el = document.getElementById(`pdf-page-${pageNum}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            setInputPage(String(pageNum));
        } else {
            setInputPage(String(currentPage));
        }
    };

    const handlePageInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePageInputSubmit();
            e.target.blur();
        }
    };

    const handlePageInputBlur = () => {
        handlePageInputSubmit();
    };

    // Calculate effective page width
    const effectiveWidth = Math.min(containerWidth, isFullscreenActive ? containerWidth : 750);
    const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3.0) : 1;

    return (
        <div
            className={`pdf-viewer-wrapper ${isBlurred ? 'anti-piracy-blur' : ''} ${isPseudoFullscreen ? 'pseudo-fullscreen' : ''}`}
            ref={viewerRef}
            onClick={() => setIsBlurred(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', position: 'relative' }}
        >
            <WatermarkOverlay />
            
            {/* Topbar — fullscreen toggle */}
            <div className="pdf-topbar">
                <button
                    className="pdf-fullscreen-btn"
                    onClick={toggleFullscreen}
                    title={isFullscreenActive ? 'Exit fullscreen (Esc)' : 'Fullscreen (Landscape)'}
                >
                    {isFullscreenActive ? '⤡' : '⤢'}
                </button>
            </div>

            {/* PDF Canvas with pinch & scroll */}
            <div 
                className={`pdf-canvas-area ${isFullscreenActive ? 'scrollable' : ''}`} 
                ref={canvasAreaRef}
            >
                <Document
                    file={pdfBlob}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="pdf-loading"><div className="pdf-spinner" /></div>}
                >
                    {isFullscreenActive ? (
                        Array.from(new Array(total), (el, index) => (
                            <div key={`page_${index + 1}`} id={`pdf-page-${index + 1}`} className="pdf-page-container">
                                <Page
                                    pageNumber={index + 1}
                                    width={effectiveWidth}
                                    scale={zoomScale}
                                    devicePixelRatio={pixelRatio}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                                <div className="pdf-page-divider" />
                            </div>
                        ))
                    ) : (
                        <div className="pdf-page-container">
                            <Page
                                pageNumber={currentPage}
                                width={effectiveWidth}
                                scale={zoomScale}
                                devicePixelRatio={pixelRatio}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </div>
                    )}
                </Document>
            </div>

            {/* Bottom Navigation & Zoom Controls Bar */}
            <div className="pdf-bottom-bar">
                {!isFullscreenActive ? (
                    <div className="pdf-bottom-bar-inner">
                        {/* Page navigation */}
                        <div className="pdf-nav-controls">
                            <button 
                                type="button"
                                className="pdf-nav-btn" 
                                disabled={currentPage <= 1} 
                                onClick={handlePrev}
                                title="Previous page"
                            >
                                Previous
                            </button>

                            <div className="pdf-page-jump-container" title="Type a page number and press Enter to jump">
                                <span className="pdf-page-jump-label">Page</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={total}
                                    value={inputPage}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputKeyDown}
                                    onBlur={handlePageInputBlur}
                                    className="pdf-page-input"
                                    aria-label="Current page number"
                                />
                                <span className="pdf-page-jump-total">of {total}</span>
                            </div>

                            <button 
                                type="button"
                                className="pdf-nav-btn" 
                                disabled={currentPage >= total} 
                                onClick={handleNext}
                                title="Next page"
                            >
                                Next
                            </button>
                        </div>

                        {/* Zoom controls */}
                        <div className="pdf-zoom-controls">
                            <button 
                                type="button" 
                                className="pdf-zoom-btn" 
                                onClick={handleZoomOut} 
                                disabled={zoomScale <= 0.6}
                                title="Zoom Out"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button 
                                type="button" 
                                className="pdf-zoom-level" 
                                onClick={handleResetZoom}
                                title="Reset Zoom to 100%"
                            >
                                {Math.round(zoomScale * 100)}%
                            </button>
                            <button 
                                type="button" 
                                className="pdf-zoom-btn" 
                                onClick={handleZoomIn} 
                                disabled={zoomScale >= 2.5}
                                title="Zoom In"
                            >
                                <ZoomIn size={16} />
                            </button>
                        </div>

                        {/* Fullscreen button */}
                        <button 
                            type="button"
                            className="pdf-fullscreen-btn-styled" 
                            onClick={toggleFullscreen}
                            title="Fullscreen (Turns to Landscape)"
                        >
                            {isFullscreenActive ? <Minimize size={16} /> : <Maximize size={16} />}
                            <span className="pdf-fs-text">{isFullscreenActive ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="pdf-bottom-bar-inner">
                        <div className="pdf-page-jump-container" title="Type a page number and press Enter to jump">
                            <span className="pdf-page-jump-label">Jump to Page</span>
                            <input
                                type="number"
                                min={1}
                                max={total}
                                value={inputPage}
                                onChange={handlePageInputChange}
                                onKeyDown={handlePageInputKeyDown}
                                onBlur={handlePageInputBlur}
                                className="pdf-page-input"
                                aria-label="Jump to page number"
                            />
                            <span className="pdf-page-jump-total">of {total}</span>
                        </div>
                        
                        {/* Zoom controls in fullscreen */}
                        <div className="pdf-zoom-controls">
                            <button 
                                type="button" 
                                className="pdf-zoom-btn" 
                                onClick={handleZoomOut} 
                                disabled={zoomScale <= 0.6}
                                title="Zoom Out"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button 
                                type="button" 
                                className="pdf-zoom-level" 
                                onClick={handleResetZoom}
                                title="Reset Zoom"
                            >
                                {Math.round(zoomScale * 100)}%
                            </button>
                            <button 
                                type="button" 
                                className="pdf-zoom-btn" 
                                onClick={handleZoomIn} 
                                disabled={zoomScale >= 2.5}
                                title="Zoom In"
                            >
                                <ZoomIn size={16} />
                            </button>
                        </div>

                        <div className="pdf-fullscreen-actions">
                            <button 
                                type="button"
                                className="pdf-fullscreen-btn-styled" 
                                onClick={toggleFullscreen}
                                title="Exit Fullscreen"
                            >
                                <Minimize size={16} /> <span className="pdf-fs-text">Exit Fullscreen</span>
                            </button>
                            <button 
                                className="pdf-subscribe-btn" 
                                style={{ margin: 0, padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                onClick={() => saveProgress(total, total)}
                            >
                                Mark Complete ✓
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;
