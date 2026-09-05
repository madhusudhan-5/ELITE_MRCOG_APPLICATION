import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import ContentCard from '../../components/Student/ContentCard';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [featuredReading, setFeaturedReading] = useState([]);
    const [featuredVideos, setFeaturedVideos] = useState([]);

    const readingCarouselRef = useRef(null);
    const videoCarouselRef = useRef(null);

    const scroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = ref.current.clientWidth * 0.75 || 320;
            ref.current.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                // Fetch recent reading articles directly for the carousel
                const resReading = await api.get('/api/content/reading/?type=course_material');
                const readingData = resReading.data.results || resReading.data;
                setFeaturedReading(Array.isArray(readingData) ? readingData.slice(0, 12) : []);

                // For videos, fetch video modules
                const resModules = await api.get('/api/content/modules/');
                const modulesData = resModules.data.results || resModules.data;
                const modulesArray = Array.isArray(modulesData) ? modulesData : [];
                setFeaturedVideos(modulesArray.filter(m => m.video_count > 0).slice(0, 12));
                
            } catch (err) {
                console.error("Failed to load dashboard content", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardInfo();
    }, []);

    if (loading) {
        return <div className="loading-state"><Loader className="animate-spin" size={40} /></div>;
    }

    return (
        <div className="dashboard-home">
            <div className="dashboard-white-box dashboard-home-box">
                {/* Featured Reading Modules */}
                <section className="dh-section">
                    <div className="dh-section-header">
                        <h2>Featured Reading Modules</h2>
                        <Link to="/dashboard/reading" className="dh-see-all">See All</Link>
                    </div>
                    
                    <div className="dh-carousel-wrapper">
                        {featuredReading.length > 1 && (
                            <button 
                                className="dh-carousel-arrow dh-carousel-arrow--left" 
                                onClick={() => scroll(readingCarouselRef, -1)}
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div className="dh-carousel" ref={readingCarouselRef}>
                            {featuredReading.length > 0 ? (
                                featuredReading.map(module => (
                                    <div key={module.id} className="dh-carousel-item">
                                        <ContentCard material={module} type="home" basePath="/dashboard/modules" />
                                    </div>
                                ))
                            ) : (
                                <div className="dh-empty-state">No reading modules available yet.</div>
                            )}
                        </div>
                        {featuredReading.length > 1 && (
                            <button 
                                className="dh-carousel-arrow dh-carousel-arrow--right" 
                                onClick={() => scroll(readingCarouselRef, 1)}
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </section>

                {/* Featured Video Modules */}
                <section className="dh-section">
                    <div className="dh-section-header">
                        <h2>Featured Video Modules</h2>
                        <Link to="/dashboard/video" className="dh-see-all">See All</Link>
                    </div>
                    
                    <div className="dh-carousel-wrapper">
                        {featuredVideos.length > 1 && (
                            <button 
                                className="dh-carousel-arrow dh-carousel-arrow--left" 
                                onClick={() => scroll(videoCarouselRef, -1)}
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div className="dh-carousel" ref={videoCarouselRef}>
                            {featuredVideos.length > 0 ? (
                                featuredVideos.map(module => (
                                    <div key={module.id} className="dh-carousel-item">
                                        <ContentCard material={module} type="home" basePath="/dashboard/video-modules" />
                                    </div>
                                ))
                            ) : (
                                <div className="dh-empty-state">No video modules available yet.</div>
                            )}
                        </div>
                        {featuredVideos.length > 1 && (
                            <button 
                                className="dh-carousel-arrow dh-carousel-arrow--right" 
                                onClick={() => scroll(videoCarouselRef, 1)}
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardHome;
