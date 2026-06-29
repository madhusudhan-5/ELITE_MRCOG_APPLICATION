import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    PlayCircle, Plus, Trash2, Edit2, Search,
    Upload, Loader, Check, X, AlertCircle, Video
} from 'lucide-react';
import api from '../../services/api';
import './ManageVideoLibrary.css';

const Toast = ({ msg, type, onClose }) => (
    <div className={`vl-toast vl-toast--${type}`}>
        {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
        <span>{msg}</span>
        <button onClick={onClose}><X size={14} /></button>
    </div>
);

// ─── Video Form Modal ────────────────────────────────────────────────────────
const VideoModal = ({ isOpen, onClose, onSave, videoData, modules }) => {
    const [form, setForm] = useState({
        module: '', title: '', embed_url: '',
        short_description: '', long_description: '', duration_display: '',
        is_free: false, is_active: true, order: 0,
    });
    const [thumb, setThumb] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (videoData) {
            setForm({
                module: videoData.module || '',
                title: videoData.title || '',
                embed_url: videoData.embed_url || '',
                short_description: videoData.short_description || '',
                long_description: videoData.long_description || '',
                duration_display: videoData.duration_display || '',
                is_free: videoData.is_free || false,
                is_active: videoData.is_active !== undefined ? videoData.is_active : true,
                order: videoData.order || 0,
            });
        } else {
            setForm({ module: '', title: '', embed_url: '', short_description: '', long_description: '', duration_display: '', is_free: false, is_active: true, order: 0 });
        }
        setThumb(null);
        setVideoFile(null);
    }, [videoData, isOpen]);

    const handleSave = async () => {
        if (!form.module || !form.title) {
            alert('Module and Title are required.');
            return;
        }
        if (!form.embed_url && !videoFile && !videoData?.video_file && !videoData?.embed_url) {
            alert('Please provide an embed URL or upload a video file.');
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (thumb) fd.append('thumbnail', thumb);
            if (videoFile) fd.append('video_file', videoFile);

            let res;
            if (videoData?.id) {
                res = await api.patch(`/api/content/manage/videos/${videoData.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/api/content/manage/videos/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSave(res.data, !!videoData?.id);
        } catch (err) {
            console.error(err);
            alert('Save failed: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="vl-modal-overlay" onClick={onClose}>
            <div className="vl-modal" onClick={e => e.stopPropagation()}>
                <div className="vl-modal-header">
                    <h3>{videoData?.id ? 'Edit Video' : 'New Video'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="vl-modal-body">
                    <div className="vl-form-row">
                        <label>Module *</label>
                        <select value={form.module} onChange={e => setForm({ ...form, module: e.target.value })}>
                            <option value="">— Select Module —</option>
                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                    <div className="vl-form-row">
                        <label>Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
                    </div>
                    <div className="vl-form-row">
                        <label>Embed URL</label>
                        <input value={form.embed_url} onChange={e => setForm({ ...form, embed_url: e.target.value })} placeholder="Optional: YouTube or Vimeo iframe src URL" />
                    </div>
                    <div className="vl-form-row">
                        <label>OR Upload Video File</label>
                        <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={e => setVideoFile(e.target.files[0])} />
                        {videoData?.has_video_file && !videoFile && <span className="vl-file-badge">✅ Video file uploaded</span>}
                        <small>Max file size: 100MB</small>
                    </div>
                    <div className="vl-form-row two-col">
                        <div>
                            <label>Duration (e.g. 15m 30s)</label>
                            <input value={form.duration_display} onChange={e => setForm({ ...form, duration_display: e.target.value })} placeholder="15m 30s" />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
                        </div>
                    </div>
                    <div className="vl-form-row vl-checkbox-row">
                        <label><input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} /> Free Preview</label>
                        <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
                    </div>
                    <div className="vl-form-row">
                        <label>Short Description</label>
                        <textarea rows={2} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="Brief summary shown on card..." />
                    </div>
                    <div className="vl-form-row">
                        <label>Long Description</label>
                        <textarea rows={4} value={form.long_description} onChange={e => setForm({ ...form, long_description: e.target.value })} placeholder="Detailed overview shown on video page..." />
                    </div>
                    <div className="vl-form-row">
                        <label>Thumbnail Image</label>
                        <input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} />
                        {videoData?.thumbnail && !thumb && <img src={videoData.thumbnail} alt="thumb" className="vl-thumb-preview" />}
                    </div>
                </div>
                <div className="vl-modal-footer">
                    <button className="vl-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="vl-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
                        {saving ? 'Saving...' : 'Save Video'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Video Row ───────────────────────────────────────────────────────────────
const VideoRow = ({ video, onEdit, onDelete }) => (
    <div className="vl-video-row">
        <div className="vl-video-info">
            <Video size={16} className="vl-video-icon"/>
            <div className="vl-video-meta">
                <span className="vl-video-title">{video.title}</span>
                <span className="vl-video-module">{video.module_title}</span>
            </div>
            <div className="vl-video-badges">
                {video.duration_display && <span className="vl-badge">{video.duration_display}</span>}
                {video.is_free && <span className="vl-badge vl-badge--free">Free</span>}
                {!video.is_active && <span className="vl-badge vl-badge--draft">Draft</span>}
            </div>
        </div>
        <div className="vl-video-actions">
            <button onClick={() => onEdit(video)} title="Edit"><Edit2 size={15} /></button>
            <button onClick={() => onDelete(video.id)} title="Delete" className="danger"><Trash2 size={15} /></button>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ManageVideoLibrary = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialModule = queryParams.get('module') || '';

    const [parts, setParts] = useState([]);
    const [modules, setModules] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPart, setFilterPart] = useState('');
    const [filterModule, setFilterModule] = useState(initialModule);
    const [videoModal, setVideoModal] = useState(false);
    const [editVideo, setEditVideo] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [partsRes, modulesRes, videosRes] = await Promise.all([
                api.get('/api/content/manage/parts/'),
                api.get('/api/content/manage/modules/'),
                api.get('/api/content/manage/videos/'),
            ]);
            setParts(partsRes.data.results || partsRes.data);
            setModules(modulesRes.data.results || modulesRes.data);
            setVideos(videosRes.data.results || videosRes.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load content. Check admin privileges.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSaveVideo = (v, isEdit) => {
        setVideos(prev => isEdit ? prev.map(x => x.id === v.id ? v : x) : [v, ...prev]);
        setVideoModal(false);
        setEditVideo(null);
        showToast(isEdit ? 'Video updated!' : 'Video created!');
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await api.delete(`/api/content/manage/videos/${id}/`);
            setVideos(prev => prev.filter(v => v.id !== id));
            showToast('Video deleted.');
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    const filtered = videos.filter(v => {
        const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase());
        const matchPart = !filterPart || (modules.find(m => m.id === v.module)?.part === +filterPart);
        const matchModule = !filterModule || v.module === +filterModule;
        return matchSearch && matchPart && matchModule;
    });

    const filteredModules = filterPart ? modules.filter(m => m.part === +filterPart) : modules;

    return (
        <div className="vl-container">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="vl-header">
                <div>
                    <h2 className="vl-title"><PlayCircle size={22} /> Video Library Management</h2>
                    <p className="vl-subtitle">Create and manage video lessons for modules.</p>
                </div>
                <button className="vl-btn-primary" onClick={() => { setEditVideo(null); setVideoModal(true); }}>
                    <Plus size={18} /> New Video
                </button>
            </div>

            <div className="vl-filters">
                <div className="vl-search">
                    <Search size={16} />
                    <input placeholder="Search videos..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="vl-filter-group">
                    <span>Part:</span>
                    <select value={filterPart} onChange={e => { setFilterPart(e.target.value); setFilterModule(''); }}>
                        <option value="">All Parts</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="vl-filter-group">
                    <span>Module:</span>
                    <select value={filterModule} onChange={e => setFilterModule(e.target.value)}>
                        <option value="">All Modules</option>
                        {filteredModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>
                <button className="vl-refresh-btn" onClick={fetchAll} title="Refresh"><Loader size={16} /></button>
            </div>

            {loading ? (
                <div className="vl-loading"><Loader size={36} className="spin" /><p>Loading...</p></div>
            ) : filtered.length === 0 ? (
                <div className="vl-empty">
                    <PlayCircle size={48} />
                    <p>No videos found. Add the first one!</p>
                </div>
            ) : (
                <div className="vl-videos-list">
                    <div className="vl-list-header">
                        <span>{filtered.length} Video{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    {filtered.map(v => (
                        <VideoRow key={v.id} video={v}
                            onEdit={vid => { setEditVideo(vid); setVideoModal(true); }}
                            onDelete={handleDeleteVideo}
                        />
                    ))}
                </div>
            )}

            <VideoModal
                isOpen={videoModal}
                onClose={() => { setVideoModal(false); setEditVideo(null); }}
                onSave={handleSaveVideo}
                videoData={editVideo}
                modules={modules}
            />
        </div>
    );
};

export default ManageVideoLibrary;
