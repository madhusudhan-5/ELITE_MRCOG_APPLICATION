import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Tag, BookOpen, Video, Loader } from 'lucide-react';
import ModuleModal from '../../components/Admin/ModuleModal';
import api from '../../services/api';
import './ManageCourses.css';

const ManageCourses = () => {
    const [activeTab, setActiveTab] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [parts, setParts] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [partsRes, modulesRes] = await Promise.all([
                api.get('/api/content/manage/parts/'),
                api.get('/api/content/manage/modules/')
            ]);
            const fetchedParts = partsRes.data.results || partsRes.data;
            const fetchedModules = modulesRes.data.results || modulesRes.data;
            setParts(Array.isArray(fetchedParts) ? fetchedParts : []);
            setModules(Array.isArray(fetchedModules) ? fetchedModules : []);
            if (fetchedParts && fetchedParts.length > 0) {
                setActiveTab(fetchedParts[fetchedParts.length - 1]?.name || 'Part 3');
            }
        } catch (err) {
            console.error("Failed to load parts or courses:", err);
            alert("Error loading content. Please ensure you have Admin privileges.");
        } finally {
            setLoading(false);
        }
    };

    // Filter modules based on tab and search
    const filteredModules = modules.filter(module => {
        const matchesTab = module.part_name === activeTab;
        const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (module.tags && module.tags.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const handleCreateNew = () => {
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (module) => {
        setEditingModule(module);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this module?")) {
            try {
                await api.delete(`/api/content/manage/modules/${id}/`);
                setModules(modules.filter(m => m.id !== id));
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete module.");
            }
        }
    };

    const handleSaveModule = (newOrUpdatedModule, isEdit) => {
        if (isEdit) {
            setModules(modules.map(m => m.id === newOrUpdatedModule.id ? newOrUpdatedModule : m));
        } else {
            setModules([...modules, newOrUpdatedModule]);
        }
        setIsModalOpen(false);
    };

    const navigate = useNavigate();

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader className="animate-spin" size={32} /></div>;

    return (
        <div className="manage-courses-container">
            <div className="mc-header">
                <div>
                    <h2 className="mc-title">Course Management</h2>
                    <p className="mc-subtitle">Create and organize learning modules across different parts.</p>
                </div>
                <button className="mc-primary-btn" onClick={handleCreateNew}>
                    <Plus size={20} /> Create Module
                </button>
            </div>

            <div className="mc-filters">
                <div className="mc-tabs">
                    {parts.map(part => (
                        <button 
                            key={part.id}
                            className={`mc-tab ${activeTab === part.name ? 'active' : ''}`}
                            onClick={() => setActiveTab(part.name)}
                            disabled={part.name !== 'Part 3'}
                        >
                            {part.name}
                        </button>
                    ))}
                </div>

                <div className="mc-search-bar">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search modules or tags..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="mc-icon-btn"><Filter size={18} /></button>
                </div>
            </div>

            {/* List View */}
            <div className="mc-grid">
                {filteredModules.length > 0 ? (
                    filteredModules.map(module => (
                        <div key={module.id} className="mc-card">
                            <div className="mc-card-header">
                                <span className={`mc-status-badge ${module.is_active ? 'active' : 'draft'}`}>
                                    {module.is_active ? 'Published' : 'Draft'}
                                </span>
                                <div className="mc-card-actions">
                                    <button onClick={() => handleEdit(module)} title="Edit Module"><Edit2 size={16} /></button>
                                    <button className="delete" title="Delete Module" onClick={() => handleDelete(module.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                            
                            <h3 className="mc-card-title">{module.title}</h3>
                            <p className="mc-card-desc">{module.short_text}</p>
                            
                            <div className="mc-card-tags">
                                <Tag size={14} className="tag-icon" />
                                <span>{module.tags}</span>
                            </div>

                            <div className="mc-card-footer">
                                <div className="mc-stat">
                                    <BookOpen size={16} /> {module.article_count || 0} Articles
                                </div>
                                <div className="mc-stat">
                                    <Video size={16} /> {module.video_count || 0} Videos
                                </div>
                                <button className="mc-manage-content-btn" onClick={() => navigate(`/admin/reading-library?module=${module.id}`)}>
                                    Manage Content
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="mc-empty-state">
                        <p>No modules found for {activeTab}.</p>
                        <button className="mc-secondary-btn" onClick={handleCreateNew}>Create the first module</button>
                    </div>
                )}
            </div>


            {/* Module Creation/Edit Modal */}
            <ModuleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveModule}
                moduleData={editingModule}
                parts={parts}
                defaultPart={activeTab}
            />
        </div>
    );
};

export default ManageCourses;
