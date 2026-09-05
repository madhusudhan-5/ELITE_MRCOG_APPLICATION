import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ContentCard from '../../components/Student/ContentCard';
import { Loader, Search } from 'lucide-react';
import './Library.css'; // Shared CSS

const VideoLibrary = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const modulesRes = await api.get('/api/content/modules/');
                const fetchedModules = modulesRes.data.results || modulesRes.data;
                const modulesArray = Array.isArray(fetchedModules) ? fetchedModules : [];
                setModules(modulesArray.filter(m => m.video_count > 0));
            } catch (err) {
                console.error("Failed to load video library", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const filteredModules = modules.filter(module =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.tags && module.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return <div className="loading-state"><Loader className="animate-spin" size={40} /></div>;

    return (
        <div className="library-container">
            <header className="lib-header">
                <div>
                    <h1>Video Library</h1>
                    <p>Watch deeply recorded lectures and roleplays.</p>
                </div>
                
                <div className="lib-search">
                    <Search size={18} className="lib-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search videos, tags..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="lib-grid">
                {filteredModules.length > 0 ? (
                    filteredModules.map(module => (
                        <ContentCard key={module.id} material={module} type="module" basePath="/dashboard/video-modules" />
                    ))
                ) : (
                    <div className="lib-empty">
                        <p>No video courses found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoLibrary;
