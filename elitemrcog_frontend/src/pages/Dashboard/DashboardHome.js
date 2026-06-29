import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import ContentCard from '../../components/Student/ContentCard';
import { Loader, PlayCircle, BookOpen } from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                // Fetch recent reading articles directly for the carousel
                const resReading = await api.get('/api/content/reading/?type=course_material');
                const readingData = resReading.data.results || resReading.data;
                setFeaturedReading(Array.isArray(readingData) ? readingData.slice(0, 12) : []);

                // For videos, fetch videos or video modules
                // Assuming we want video modules for the video row:
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

    const [featuredReading, setFeaturedReading] = useState([]);
    const [featuredVideos, setFeaturedVideos] = useState([]);

    if (loading) {
        return <div className="loading-state"><Loader className="animate-spin" size={40} /></div>;
    }

    return (
        <div className="dashboard-home">
            {/* Hero / Greeting Section */}
            <header className="dh-hero">
                <div className="dh-hero-content">
                    <h1>Welcome back, {user?.name || 'Student'}!</h1>
                    <p>Continue your preparation for the MRCOG exams. You have <strong>3</strong> modules in progress.</p>
                </div>
                <div className="dh-hero-image-placeholder">
                    {/* Placeholder for an illustration */}
                </div>
            </header>

            <div className="dashboard-white-box">
                {/* Featured Reading Modules */}
                <section className="dh-section">
                    <div className="dh-section-header">
                        <h2><BookOpen size={24} className="section-icon" /> Featured Reading Modules</h2>
                        <Link to="/dashboard/reading" className="dh-see-all">See All</Link>
                    </div>
                    
                    <div className="dh-carousel">
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
                </section>

                {/* Featured Video Modules */}
                <section className="dh-section">
                    <div className="dh-section-header">
                        <h2><PlayCircle size={24} className="section-icon" /> Featured Video Modules</h2>
                        <Link to="/dashboard/video" className="dh-see-all">See All</Link>
                    </div>
                    
                    <div className="dh-carousel">
                        {featuredVideos.length > 0 ? (
                            featuredVideos.map(module => (
                                <div key={module.id} className="dh-carousel-item">
                                    <ContentCard material={module} type="home" basePath="/dashboard/modules" />
                                </div>
                            ))
                        ) : (
                            <div className="dh-empty-state">No video modules available yet.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardHome;
