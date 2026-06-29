import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../../services/api';
import './PdfViewer.css';

// Set up the PDF.js worker — must match installed pdfjs-dist version (5.x)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ stationId, pageCount: initialPageCount, stationTitle, onProgressUpdate }) => {
    const [numPages, setNumPages] = useState(initialPageCount || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerRef = useRef(null);

    // Fetch PDF as blob via protected API — never exposes direct URL
    useEffect(() => {
        if (!stationId) return;
        setLoading(true);
        setError(null);
        setPdfBlob(null);

        // Anti-piracy: Block keyboard shortcuts
        const handleKeyDown = (e) => {
            // Block Print Screen, F12, Ctrl+P, Ctrl+S, Ctrl+Shift+I, Cmd+S, Cmd+P
            if (
                e.key === 'PrintScreen' ||
                e.key === 'F12' ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I'))
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

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
        };
    }, [stationId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Tracks container size for responsive PDF sizing
    const [containerWidth, setContainerWidth] = useState(700);
    const [containerHeight, setContainerHeight] = useState(500);
    const canvasAreaRef = useRef(null);

    useEffect(() => {
        const updateSize = () => {
            if (canvasAreaRef.current) {
                let newWidth = canvasAreaRef.current.clientWidth - 40;
                let newHeight = canvasAreaRef.current.clientHeight - 40;

                if (isFullscreen) {
                    newWidth = window.innerWidth - 100;
                }

                setContainerWidth(Math.max(300, newWidth));
                setContainerHeight(Math.max(300, newHeight));
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        const timeout = setTimeout(updateSize, 100); // Hack for initial render layout shift

        return () => {
            window.removeEventListener('resize', updateSize);
            clearTimeout(timeout);
        };
    }, [isFullscreen, pdfBlob]);

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
        if (!isFullscreen) {
            viewerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handler = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const total = numPages || initialPageCount || 1;

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

    return (
        <div
            className="pdf-viewer-wrapper"
            ref={viewerRef}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
        >
            {/* Fullscreen toggle — top right corner only */}
            <div className="pdf-topbar">
                <button
                    className="pdf-fullscreen-btn"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
                >
                    {isFullscreen ? '⤡' : '⤢'}
                </button>
            </div>

            {/* PDF Canvas */}
            <div className={`pdf-canvas-area ${isFullscreen ? 'scrollable' : ''}`} ref={canvasAreaRef}>
                <Document
                    file={pdfBlob}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div className="pdf-loading"><div className="pdf-spinner" /></div>}
                >
                    {isFullscreen ? (
                        Array.from(new Array(total), (el, index) => (
                            <div key={`page_${index + 1}`} className="pdf-page-container">
                                <Page
                                    pageNumber={index + 1}
                                    width={containerWidth}
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
                                height={containerHeight}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </div>
                    )}
                </Document>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="pdf-bottom-bar">
                {!isFullscreen && (
                    <div className="pdf-nav-controls">
                        <button 
                            className="pdf-nav-btn" 
                            disabled={currentPage <= 1} 
                            onClick={handlePrev}
                        >
                            Previous
                        </button>
                        <span className="pdf-page-info">
                            Page {currentPage} of {total}
                        </span>
                        <button 
                            className="pdf-nav-btn" 
                            disabled={currentPage >= total} 
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                )}
                {isFullscreen && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span className="pdf-page-info">Total Pages: {total}</span>
                        <button 
                            className="pdf-subscribe-btn" 
                            style={{ margin: 0, padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => saveProgress(total, total)}
                        >
                            Mark as Complete ✓
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;
