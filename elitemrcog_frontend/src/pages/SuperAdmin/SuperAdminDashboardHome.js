import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './SuperAdminDashboardHome.css';

const SuperAdminDashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/core/admin/analytics/')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching analytics", err);
                setError("Failed to load dashboard data");
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="sa-dashboard-home">
            <h1 className="sa-dashboard-title">Super Admin Dashboard</h1>
            <p className="sa-dashboard-subtitle">Platform overview and performance analytics.</p>

            <div className="sa-stats-grid">
                <div className="sa-stat-card">
                    <div className="sa-stat-icon navy">
                        <Users size={24} />
                    </div>
                    <div className="sa-stat-content">
                        <h3>Total Students</h3>
                        <p className="sa-stat-value">{stats?.total_students || 0}</p>
                    </div>
                </div>

                <div className="sa-stat-card">
                    <div className="sa-stat-icon teal">
                        <DollarSign size={24} />
                    </div>
                    <div className="sa-stat-content">
                        <h3>Total Earnings</h3>
                        <p className="sa-stat-value">£{stats?.total_earnings?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                <div className="sa-stat-card">
                    <div className="sa-stat-icon pink">
                        <Activity size={24} />
                    </div>
                    <div className="sa-stat-content">
                        <h3>Platform Health</h3>
                        <p className="sa-stat-value">Excellent</p>
                    </div>
                </div>
            </div>

            <div className="sa-chart-container">
                <h2>Revenue (Last 6 Months)</h2>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats?.chart_data || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `£${value}`} />
                            <Tooltip cursor={{fill: 'rgba(47, 50, 125, 0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="earnings" fill="var(--color-navy)" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboardHome;
