import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    BookOpen, Plus, Trash2, Edit2, Search, ChevronDown, ChevronRight,
    FileText, Upload, Loader, Check, X, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './ManageReadingLibrary.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ARTICLE_TYPES = [
    { value: 'course_material', label: 'Course Material' },
    { value: 'easy_read', label: 'Easy Read' },
];

const Toast = ({ msg, type, onClose }) => (
    <div className={`rl-toast rl-toast--${type}`}>
        {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
        <span>{msg}</span>
        <button onClick={onClose}><X size={14} /></button>
    </div>
);

// ─── Article Form Modal ────────────────────────────────────────────────────────
const ArticleModal = ({ isOpen, onClose, onSave, articleData, modules }) => {
    const [form, setForm] = useState({
        module: '', title: '', article_type: 'course_material',
        short_description: '', overview_text: '', duration_display: '',
        is_free: false, is_active: true, order: 0,
    });
    const [thumb, setThumb] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (articleData) {
            setForm({
                module: articleData.module || '',
                title: articleData.title || '',
                article_type: articleData.article_type || 'course_material',
                short_description: articleData.short_description || '',
                overview_text: articleData.overview_text || '',
                duration_display: articleData.duration_display || '',
                is_free: articleData.is_free || false,
                is_active: articleData.is_active !== undefined ? articleData.is_active : true,
                order: articleData.order || 0,
            });
        } else {
            setForm({ module: '', title: '', article_type: 'course_material', short_description: '', overview_text: '', duration_display: '', is_free: false, is_active: true, order: 0 });
        }
        setThumb(null);
    }, [articleData, isOpen]);

    const handleSave = async () => {
        if (!form.module || !form.title || !form.short_description) {
            alert('Module, Title and Short Description are required.');
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (thumb) fd.append('thumbnail', thumb);

            let res;
            if (articleData?.id) {
                res = await api.patch(`/api/content/manage/articles/${articleData.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/api/content/manage/articles/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSave(res.data, !!articleData?.id);
        } catch (err) {
            console.error(err);
            alert('Save failed: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="rl-modal-overlay" onClick={onClose}>
            <div className="rl-modal" onClick={e => e.stopPropagation()}>
                <div className="rl-modal-header">
                    <h3>{articleData?.id ? 'Edit Article' : 'New Reading Article'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="rl-modal-body">
                    <div className="rl-form-row">
                        <label>Module *</label>
                        <select value={form.module} onChange={e => setForm({ ...form, module: e.target.value })}>
                            <option value="">— Select Module —</option>
                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                    <div className="rl-form-row">
                        <label>Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
                    </div>
                    <div className="rl-form-row two-col">
                        <div>
                            <label>Type</label>
                            <select value={form.article_type} onChange={e => setForm({ ...form, article_type: e.target.value })}>
                                {ARTICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Duration (e.g. 2h 30m)</label>
                            <input value={form.duration_display} onChange={e => setForm({ ...form, duration_display: e.target.value })} placeholder="2h 30m" />
                        </div>
                    </div>
                    <div className="rl-form-row two-col">
                        <div>
                            <label>Order</label>
                            <input type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
                        </div>
                        <div className="rl-checkbox-row">
                            <label><input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} /> Free Preview</label>
                            <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
                        </div>
                    </div>
                    <div className="rl-form-row">
                        <label>Short Description *</label>
                        <textarea rows={2} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} placeholder="Brief summary shown on card..." />
                    </div>
                    <div className="rl-form-row">
                        <label>Overview Text</label>
                        <textarea rows={4} value={form.overview_text} onChange={e => setForm({ ...form, overview_text: e.target.value })} placeholder="Detailed overview shown on article page..." />
                    </div>
                    <div className="rl-form-row">
                        <label>Thumbnail Image</label>
                        <input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} />
                        {articleData?.thumbnail && !thumb && <img src={articleData.thumbnail} alt="thumb" className="rl-thumb-preview" />}
                    </div>
                </div>
                <div className="rl-modal-footer">
                    <button className="rl-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="rl-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
                        {saving ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Station Form Modal ────────────────────────────────────────────────────────
const StationModal = ({ isOpen, onClose, onSave, stationData, articleId }) => {
    const [form, setForm] = useState({ article: articleId, title: '', page_count: 1, is_free: false, is_active: true, order: 0 });
    const [pdf, setPdf] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (stationData) {
            setForm({ article: stationData.article || articleId, title: stationData.title || '', page_count: stationData.page_count || 1, is_free: stationData.is_free || false, is_active: stationData.is_active !== undefined ? stationData.is_active : true, order: stationData.order || 0 });
        } else {
            setForm({ article: articleId, title: '', page_count: 1, is_free: false, is_active: true, order: 0 });
        }
        setPdf(null);
    }, [stationData, articleId, isOpen]);

    const handleSave = async () => {
        if (!form.title) { alert('Station title is required.'); return; }
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (pdf) fd.append('pdf_file', pdf);

            let res;
            if (stationData?.id) {
                res = await api.patch(`/api/content/manage/stations/${stationData.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                res = await api.post('/api/content/manage/stations/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSave(res.data, !!stationData?.id);
        } catch (err) {
            alert('Save failed: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="rl-modal-overlay" onClick={onClose}>
            <div className="rl-modal rl-modal--sm" onClick={e => e.stopPropagation()}>
                <div className="rl-modal-header">
                    <h3>{stationData?.id ? 'Edit Station' : 'New Station'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="rl-modal-body">
                    <div className="rl-form-row">
                        <label>Station Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Station 01: Introduction" />
                    </div>
                    <div className="rl-form-row two-col">
                        <div>
                            <label>Page Count</label>
                            <input type="number" min="1" value={form.page_count} onChange={e => setForm({ ...form, page_count: +e.target.value })} />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} />
                        </div>
                    </div>
                    <div className="rl-form-row rl-checkbox-row">
                        <label><input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} /> Free Preview Station</label>
                        <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
                    </div>
                    <div className="rl-form-row">
                        <label>Upload PDF</label>
                        <div className="rl-pdf-upload">
                            <input type="file" accept=".pdf" onChange={e => setPdf(e.target.files[0])} id="station-pdf-input" />
                            <label htmlFor="station-pdf-input" className="rl-pdf-label">
                                <Upload size={18} /> {pdf ? pdf.name : (stationData?.pdf_file ? '✅ PDF already uploaded — choose new to replace' : 'Choose PDF file...')}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="rl-modal-footer">
                    <button className="rl-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="rl-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
                        {saving ? 'Saving...' : 'Save Station'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Station Row ───────────────────────────────────────────────────────────────
const StationRow = ({ station, onEdit, onDelete }) => (
    <div className="rl-station-row">
        <div className="rl-station-info">
            <FileText size={14} />
            <span className="rl-station-title">{station.title}</span>
            <span className="rl-badge">{station.page_count} pages</span>
            {station.is_free && <span className="rl-badge rl-badge--free">Free</span>}
            {!station.is_active && <span className="rl-badge rl-badge--draft">Draft</span>}
        </div>
        <div className="rl-station-actions">
            <button onClick={() => onEdit(station)} title="Edit"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(station.id)} title="Delete" className="danger"><Trash2 size={14} /></button>
        </div>
    </div>
);

// ─── Article Row ───────────────────────────────────────────────────────────────
const ArticleRow = ({ article, onEditArticle, onDeleteArticle }) => {
    const [expanded, setExpanded] = useState(false);
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [stationModal, setStationModal] = useState(false);
    const [editStation, setEditStation] = useState(null);

    const loadStations = useCallback(async () => {
        setLoadingStations(true);
        try {
            const res = await api.get(`/api/content/manage/stations/?article=${article.id}`);
            setStations(res.data.results || res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingStations(false); }
    }, [article.id]);

    const handleToggle = () => {
        if (!expanded) loadStations();
        setExpanded(!expanded);
    };

    const handleSaveStation = (s, isEdit) => {
        setStations(prev => isEdit ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]);
        setStationModal(false);
        setEditStation(null);
    };

    const handleDeleteStation = async (id) => {
        if (!window.confirm('Delete this station?')) return;
        await api.delete(`/api/content/manage/stations/${id}/`);
        setStations(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className={`rl-article-row ${expanded ? 'expanded' : ''}`}>
            <div className="rl-article-header" onClick={handleToggle}>
                <div className="rl-article-toggle">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className="rl-article-meta">
                    <span className="rl-article-title">{article.title}</span>
                    <span className={`rl-type-badge rl-type-badge--${article.article_type}`}>
                        {article.article_type === 'easy_read' ? 'Easy Read' : 'Course Material'}
                    </span>
                    {article.is_free && <span className="rl-badge rl-badge--free">Free</span>}
                    {!article.is_active && <span className="rl-badge rl-badge--draft">Draft</span>}
                    <span className="rl-badge">{article.station_count || 0} stations</span>
                </div>
                <div className="rl-article-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEditArticle(article)} title="Edit Article"><Edit2 size={15} /></button>
                    <button onClick={() => onDeleteArticle(article.id)} title="Delete Article" className="danger"><Trash2 size={15} /></button>
                </div>
            </div>

            {expanded && (
                <div className="rl-stations-panel">
                    <div className="rl-stations-header">
                        <span>Stations ({stations.length})</span>
                        <button className="rl-add-station-btn" onClick={() => { setEditStation(null); setStationModal(true); }}>
                            <Plus size={14} /> Add Station
                        </button>
                    </div>
                    {loadingStations ? <div className="rl-loading"><Loader size={20} className="spin" /></div> : (
                        stations.length > 0 ? stations.map(s => (
                            <StationRow key={s.id} station={s}
                                onEdit={st => { setEditStation(st); setStationModal(true); }}
                                onDelete={handleDeleteStation}
                            />
                        )) : <div className="rl-empty-stations">No stations yet. Add the first one!</div>
                    )}
                </div>
            )}

            <StationModal
                isOpen={stationModal}
                onClose={() => { setStationModal(false); setEditStation(null); }}
                onSave={handleSaveStation}
                stationData={editStation}
                articleId={article.id}
            />
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ManageReadingLibrary = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialModule = queryParams.get('module') || '';

    const [parts, setParts] = useState([]);
    const [modules, setModules] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPart, setFilterPart] = useState('');
    const [filterModule, setFilterModule] = useState(initialModule);
    const [filterType, setFilterType] = useState('');
    const [articleModal, setArticleModal] = useState(false);
    const [editArticle, setEditArticle] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [partsRes, modulesRes, articlesRes] = await Promise.all([
                api.get('/api/content/manage/parts/'),
                api.get('/api/content/manage/modules/'),
                api.get('/api/content/manage/articles/'),
            ]);
            setParts(partsRes.data.results || partsRes.data);
            setModules(modulesRes.data.results || modulesRes.data);
            setArticles(articlesRes.data.results || articlesRes.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load content. Check admin privileges.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSaveArticle = (a, isEdit) => {
        setArticles(prev => isEdit ? prev.map(x => x.id === a.id ? a : x) : [a, ...prev]);
        setArticleModal(false);
        setEditArticle(null);
        showToast(isEdit ? 'Article updated!' : 'Article created!');
    };

    const handleDeleteArticle = async (id) => {
        if (!window.confirm('Delete this article and all its stations?')) return;
        try {
            await api.delete(`/api/content/manage/articles/${id}/`);
            setArticles(prev => prev.filter(a => a.id !== id));
            showToast('Article deleted.');
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    const filtered = articles.filter(a => {
        const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || a.article_type === filterType;
        const matchPart = !filterPart || (modules.find(m => m.id === a.module)?.part === +filterPart);
        const matchModule = !filterModule || a.module === +filterModule;
        return matchSearch && matchType && matchPart && matchModule;
    });

    const filteredModules = filterPart ? modules.filter(m => m.part === +filterPart) : modules;

    return (
        <div className="rl-container">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="rl-header">
                <div>
                    <h2 className="rl-title"><BookOpen size={22} /> Reading Library Management</h2>
                    <p className="rl-subtitle">Create and manage reading articles and their station PDFs.</p>
                </div>
                <button className="rl-btn-primary" onClick={() => { setEditArticle(null); setArticleModal(true); }}>
                    <Plus size={18} /> New Article
                </button>
            </div>

            <div className="rl-filters">
                <div className="rl-search">
                    <Search size={16} />
                    <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="rl-filter-group">
                    <span>Type:</span>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {ARTICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div className="rl-filter-group">
                    <span>Part:</span>
                    <select value={filterPart} onChange={e => { setFilterPart(e.target.value); setFilterModule(''); }}>
                        <option value="">All Parts</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="rl-filter-group">
                    <span>Module:</span>
                    <select value={filterModule} onChange={e => setFilterModule(e.target.value)}>
                        <option value="">All Modules</option>
                        {filteredModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>
                <button className="rl-refresh-btn" onClick={fetchAll} title="Refresh"><Loader size={16} /></button>
            </div>



            {loading ? (
                <div className="rl-loading"><Loader size={36} className="spin" /><p>Loading...</p></div>
            ) : filtered.length === 0 ? (
                <div className="rl-empty">
                    <BookOpen size={48} />
                    <p>No articles found. Create the first one!</p>
                </div>
            ) : (
                <div className="rl-articles-list">
                    <div className="rl-list-header">
                        <span>{filtered.length} Article{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    {filtered.map(a => (
                        <ArticleRow key={a.id} article={a}
                            onEditArticle={art => { setEditArticle(art); setArticleModal(true); }}
                            onDeleteArticle={handleDeleteArticle}
                        />
                    ))}
                </div>
            )}

            <ArticleModal
                isOpen={articleModal}
                onClose={() => { setArticleModal(false); setEditArticle(null); }}
                onSave={handleSaveArticle}
                articleData={editArticle}
                modules={modules}
            />
        </div>
    );
};

export default ManageReadingLibrary;
