import React, { useState, useEffect, useCallback } from 'react';
import {
    CreditCard, Users, Search, RefreshCw, CheckCircle, XCircle,
    Clock, AlertCircle, TrendingUp, X, Check, Loader,
    Package, ShieldCheck, ShieldOff, Edit2, Trash2
} from 'lucide-react';
import api from '../../services/api';
import './ManageSubscriptions.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    active: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
    expired: { bg: '#fee2e2', color: '#dc2626', icon: XCircle },
    cancelled: { bg: '#f1f5f9', color: '#64748b', icon: XCircle },
    pending: { bg: '#fef3c7', color: '#d97706', icon: Clock },
    success: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
    failed: { bg: '#fee2e2', color: '#dc2626', icon: AlertCircle },
    refunded: { bg: '#ede9fe', color: '#7c3aed', icon: RefreshCw },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_COLORS[status] || STATUS_COLORS.pending;
    const Icon = cfg.icon;
    return (
        <span className="sub-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            <Icon size={12} /> {status}
        </span>
    );
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (v, currency = 'INR') => {
    const symbols = { 'INR': '₹', 'GBP': '£', 'USD': '$', 'EUR': '€' };
    const sym = symbols[currency] || (currency === 'INR' ? '₹' : '£');
    return `${sym}${parseFloat(v || 0).toFixed(2)}`;
};

const Toast = ({ msg, type, onClose }) => (
    <div className={`sub-toast sub-toast--${type}`}>
        {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
        <span>{msg}</span>
        <button onClick={onClose}><X size={14} /></button>
    </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="sub-stat-card" style={{ borderTop: `3px solid ${color}` }}>
        <div className="sub-stat-icon" style={{ background: color + '22', color }}>
            <Icon size={20} />
        </div>
        <div>
            <div className="sub-stat-value">{value}</div>
            <div className="sub-stat-label">{label}</div>
        </div>
    </div>
);

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ['Subscriptions', 'Bundles', 'Payments'];

// ─── Subscription Tab ─────────────────────────────────────────────────────────
const SubscriptionsTab = ({ showToast }) => {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSubs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (search) params.append('search', search);
            const res = await api.get(`/api/subscriptions/manage/subscriptions/?${params}`);
            setSubs(res.data.results || res.data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load subscriptions.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, search, showToast]);

    useEffect(() => { fetchSubs(); }, [fetchSubs]);

    const handleAction = async (id, action) => {
        setActionLoading(id + action);
        try {
            await api.post(`/api/subscriptions/manage/subscriptions/${id}/${action}/`);
            showToast(`Subscription ${action}d!`);
            fetchSubs();
        } catch {
            showToast('Action failed.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const active = subs.filter(s => s.status === 'active').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    const cancelled = subs.filter(s => s.status === 'cancelled').length;

    return (
        <div>
            <div className="sub-stats-row">
                <StatCard icon={Users} label="Total Subscriptions" value={subs.length} color="#6366f1" />
                <StatCard icon={CheckCircle} label="Active" value={active} color="#16a34a" />
                <StatCard icon={XCircle} label="Expired" value={expired} color="#dc2626" />
                <StatCard icon={ShieldOff} label="Cancelled" value={cancelled} color="#64748b" />
            </div>

            <div className="sub-filters">
                <div className="sub-search">
                    <Search size={16} />
                    <input placeholder="Search by email or bundle..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchSubs()} />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button className="sub-refresh-btn" onClick={fetchSubs}><RefreshCw size={16} /></button>
            </div>

            {loading ? (
                <div className="sub-loading"><Loader size={32} className="spin" /></div>
            ) : (
                <div className="sub-table-wrapper">
                    <table className="sub-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Bundle / Plan</th>
                                <th>Library</th>
                                <th>Status</th>
                                <th>Started</th>
                                <th>Expires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subs.length === 0 ? (
                                <tr><td colSpan={7} className="sub-no-data">No subscriptions found.</td></tr>
                            ) : subs.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="sub-user-cell">
                                            <span className="sub-user-name">{s.user_name || '—'}</span>
                                            <span className="sub-user-email">{s.user_email}</span>
                                        </div>
                                    </td>
                                    <td>{s.bundle_title || s.plan_name || '—'}</td>
                                    <td><span className="sub-library-badge">{s.library_access || '—'}</span></td>
                                    <td><StatusBadge status={s.status} /></td>
                                    <td>{formatDate(s.started_at)}</td>
                                    <td>{formatDate(s.expires_at)}</td>
                                    <td>
                                        <div className="sub-action-btns">
                                            {s.status !== 'active' && (
                                                <button className="sub-btn-activate"
                                                    disabled={actionLoading === s.id + 'reactivate'}
                                                    onClick={() => handleAction(s.id, 'reactivate')}
                                                    title="Reactivate">
                                                    {actionLoading === s.id + 'reactivate' ? <Loader size={14} className="spin" /> : <ShieldCheck size={14} />}
                                                </button>
                                            )}
                                            {s.status === 'active' && (
                                                <button className="sub-btn-cancel"
                                                    disabled={actionLoading === s.id + 'cancel'}
                                                    onClick={() => handleAction(s.id, 'cancel')}
                                                    title="Cancel">
                                                    {actionLoading === s.id + 'cancel' ? <Loader size={14} className="spin" /> : <ShieldOff size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Bundles Tab ──────────────────────────────────────────────────────────────
const BundlesTab = ({ showToast }) => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBundle, setEditingBundle] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', short_description: '', description: '', price: '', currency: 'INR', duration_days: 365, includes_reading: false, includes_video: false, includes_mock_exam: false, is_featured: false, is_active: true, order: 0 });
    const [saving, setSaving] = useState(false);

    const fetchBundles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/subscriptions/manage/bundles/');
            setBundles(res.data.results || res.data);
        } catch { showToast('Failed to load bundles.', 'error'); }
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchBundles(); }, [fetchBundles]);

    const openEdit = (bundle) => {
        setEditingBundle(bundle);
        setForm({ title: bundle.title, short_description: bundle.short_description, description: bundle.description, price: bundle.price, currency: bundle.currency, duration_days: bundle.duration_days, includes_reading: bundle.includes_reading, includes_video: bundle.includes_video, includes_mock_exam: bundle.includes_mock_exam, is_featured: bundle.is_featured, is_active: bundle.is_active, order: bundle.order });
        setShowForm(true);
    };

    const openNew = () => {
        setEditingBundle(null);
        setForm({ title: '', short_description: '', description: '', price: '', currency: 'INR', duration_days: 365, includes_reading: false, includes_video: false, includes_mock_exam: false, is_featured: false, is_active: true, order: 0 });
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingBundle?.id) {
                const res = await api.patch(`/api/subscriptions/manage/bundles/${editingBundle.id}/`, form);
                setBundles(prev => prev.map(b => b.id === res.data.id ? res.data : b));
                showToast('Bundle updated!');
            } else {
                const res = await api.post('/api/subscriptions/manage/bundles/', form);
                setBundles(prev => [res.data, ...prev]);
                showToast('Bundle created!');
            }
            setShowForm(false);
        } catch (err) {
            showToast('Save failed.', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this bundle?')) return;
        try {
            await api.delete(`/api/subscriptions/manage/bundles/${id}/`);
            setBundles(prev => prev.filter(b => b.id !== id));
            showToast('Bundle deleted.');
        } catch { showToast('Delete failed.', 'error'); }
    };

    return (
        <div>
            <div className="sub-tab-actions">
                <button className="sub-btn-primary" onClick={openNew}><Package size={16} /> New Bundle</button>
            </div>

            {showForm && (
                <div className="sub-bundle-form">
                    <h4>{editingBundle ? 'Edit Bundle' : 'New Bundle'}</h4>
                    <div className="sub-form-grid">
                        <div className="sub-form-row"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                        <div className="sub-form-row"><label>Short Description</label><input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} /></div>
                        <div className="sub-form-row sub-full"><label>Full Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        <div className="sub-form-row"><label>Price</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                        <div className="sub-form-row"><label>Currency</label><select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}><option>INR</option><option>GBP</option><option>USD</option><option>EUR</option></select></div>
                        <div className="sub-form-row"><label>Duration (days)</label><input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: +e.target.value })} /></div>
                        <div className="sub-form-row"><label>Display Order</label><input type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} /></div>
                    </div>
                    <div className="sub-checkbox-group">
                        <label><input type="checkbox" checked={form.includes_reading} onChange={e => setForm({ ...form, includes_reading: e.target.checked })} /> Includes Reading Library</label>
                        <label><input type="checkbox" checked={form.includes_video} onChange={e => setForm({ ...form, includes_video: e.target.checked })} /> Includes Video Library</label>
                        <label><input type="checkbox" checked={form.includes_mock_exam} onChange={e => setForm({ ...form, includes_mock_exam: e.target.checked })} /> Includes Mock Exam</label>
                        <label><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Featured (Best Value badge)</label>
                        <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
                    </div>
                    <div className="sub-form-btns">
                        <button className="sub-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                        <button className="sub-btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader size={16} className="spin" /> : <Check size={16} />} {saving ? 'Saving...' : 'Save Bundle'}
                        </button>
                    </div>
                </div>
            )}

            {loading ? <div className="sub-loading"><Loader size={32} className="spin" /></div> : (
                <div className="sub-bundles-grid">
                    {bundles.map(b => (
                        <div key={b.id} className={`sub-bundle-card ${b.is_featured ? 'featured' : ''}`}>
                            {b.is_featured && <div className="sub-featured-tag">⭐ Best Value</div>}
                            <div className="sub-bundle-top">
                                <h4>{b.title}</h4>
                                <span className={`sub-active-dot ${b.is_active ? 'on' : 'off'}`} />
                            </div>
                            <div className="sub-bundle-price">{formatCurrency(b.price, b.currency)}<span>/{b.duration_days}d</span></div>
                            <div className="sub-bundle-libs">
                                {b.includes_reading && <span className="sub-lib reading">📖 Reading</span>}
                                {b.includes_video && <span className="sub-lib video">🎬 Video</span>}
                                {b.includes_mock_exam && <span className="sub-lib mock">📝 Mock Exam</span>}
                            </div>
                            <p className="sub-bundle-desc">{b.short_description}</p>
                            <div className="sub-bundle-actions">
                                <button onClick={() => openEdit(b)}><Edit2 size={14} /> Edit</button>
                                <button className="danger" onClick={() => handleDelete(b.id)}><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Payments Tab ─────────────────────────────────────────────────────────────
const PaymentsTab = ({ showToast }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterGateway, setFilterGateway] = useState('');

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterGateway) params.append('gateway', filterGateway);
            if (search) params.append('search', search);
            const res = await api.get(`/api/subscriptions/manage/payments/?${params}`);
            setPayments(res.data.results || res.data);
        } catch { showToast('Failed to load payments.', 'error'); }
        finally { setLoading(false); }
    }, [filterStatus, filterGateway, search, showToast]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

    return (
        <div>
            <div className="sub-stats-row">
                <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} color="#059669" />
                <StatCard icon={CheckCircle} label="Successful" value={payments.filter(p => p.status === 'success').length} color="#16a34a" />
                <StatCard icon={Clock} label="Pending" value={payments.filter(p => p.status === 'pending').length} color="#d97706" />
                <StatCard icon={AlertCircle} label="Failed" value={payments.filter(p => p.status === 'failed').length} color="#dc2626" />
            </div>

            <div className="sub-filters">
                <div className="sub-search">
                    <Search size={16} />
                    <input placeholder="Search by email or transaction ID..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchPayments()} />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
                <select value={filterGateway} onChange={e => setFilterGateway(e.target.value)}>
                    <option value="">All Gateways</option>
                    <option value="stripe">Stripe</option>
                    <option value="pakistan">Pakistan</option>
                    <option value="free">Free/Manual</option>
                </select>
                <button className="sub-refresh-btn" onClick={fetchPayments}><RefreshCw size={16} /></button>
            </div>

            {loading ? <div className="sub-loading"><Loader size={32} className="spin" /></div> : (
                <div className="sub-table-wrapper">
                    <table className="sub-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Bundle</th>
                                <th>Amount</th>
                                <th>Gateway</th>
                                <th>Status</th>
                                <th>Transaction ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr><td colSpan={7} className="sub-no-data">No payments found.</td></tr>
                            ) : payments.map(p => (
                                <tr key={p.id}>
                                    <td><span className="sub-user-email">{p.user_email}</span></td>
                                    <td>{p.bundle_title || '—'}</td>
                                    <td><strong>{formatCurrency(p.total_amount)}</strong></td>
                                    <td><span className="sub-gateway-badge sub-gateway-badge--{p.gateway}">{p.gateway}</span></td>
                                    <td><StatusBadge status={p.status} /></td>
                                    <td><code className="sub-txn-id">{p.transaction_id ? p.transaction_id.slice(0, 20) + '...' : '—'}</code></td>
                                    <td>{formatDate(p.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ManageSubscriptions = () => {
    const [activeTab, setActiveTab] = useState('Subscriptions');
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    return (
        <div className="sub-container">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="sub-header">
                <div>
                    <h2 className="sub-title"><CreditCard size={22} /> Subscription Management</h2>
                    <p className="sub-subtitle">Manage bundles, user subscriptions, and payment transactions.</p>
                </div>
            </div>

            <div className="sub-tabs">
                {TABS.map(t => (
                    <button key={t} className={`sub-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                        {t === 'Subscriptions' && <Users size={16} />}
                        {t === 'Bundles' && <Package size={16} />}
                        {t === 'Payments' && <CreditCard size={16} />}
                        {t}
                    </button>
                ))}
            </div>

            <div className="sub-tab-content">
                {activeTab === 'Subscriptions' && <SubscriptionsTab showToast={showToast} />}
                {activeTab === 'Bundles' && <BundlesTab showToast={showToast} />}
                {activeTab === 'Payments' && <PaymentsTab showToast={showToast} />}
            </div>
        </div>
    );
};

export default ManageSubscriptions;
