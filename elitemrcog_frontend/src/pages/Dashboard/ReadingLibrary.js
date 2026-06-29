import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ContentCard from '../../components/Student/ContentCard';
import { Loader, BookOpen, Search } from 'lucide-react';
import './Library.css'; // Shared CSS for both libraries

const ReadingLibrary = () => {
    const [activeTab, setActiveTab] = useState('Course Materials');
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const category = activeTab === 'Easy Reads' ? 'easy_read' : 'course_material';
                const res = await api.get(`/api/content/reading/?type=${category}`);
                const fetchedData = res.data.results || res.data;
                const articlesArray = Array.isArray(fetchedData) ? fetchedData : [];
                setModules(articlesArray);
            } catch (err) {
                console.error("Failed to load reading library", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [activeTab]);

    const filteredModules = modules.filter(module =>
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.tags && module.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return <div className="loading-state"><Loader className="animate-spin" size={40} /></div>;

    return (
        <div className="library-container">
            <header className="lib-header">
                <div>
                    <h1><BookOpen size={28} className="lib-header-icon reading" /> Reading Library</h1>
                    <p>Browse your assigned syllabus and reading materials.</p>
                </div>
                
                <div className="lib-search">
                    <Search size={18} className="lib-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search topics, tags..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="lib-tabs">
                <button 
                    className={`lib-tab ${activeTab === 'Easy Reads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Easy Reads')}
                >
                    Easy Reads
                </button>
                <button 
                    className={`lib-tab ${activeTab === 'Course Materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Course Materials')}
                >
                    Course Materials
                </button>
            </div>

            <div className="lib-grid">
                {filteredModules.length > 0 ? (
                    filteredModules.map(module => (
                        <ContentCard key={module.id} material={module} type="module" />
                    ))
                ) : (
                    <div className="lib-empty">
                        <p>No reading materials found for {activeTab}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingLibrary;
