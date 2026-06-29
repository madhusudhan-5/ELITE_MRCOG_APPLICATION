import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import UserRoleModal from '../../components/SuperAdmin/UserRoleModal';
import { Search, Loader, Shield, User, Star, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/accounts/manage/users/');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            // Ignore for demo purposes if it's 403, we just won't show data.
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveRole = async (updatedData) => {
        try {
            const res = await api.put(`/api/accounts/manage/users/${updatedData.id}/`, updatedData);
            setUsers(users.map(u => u.id === res.data.id ? res.data : u));
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to update user", err);
            alert("Error updating user. Please check permissions.");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        if (role === 'superadmin') return <span className="u-badge superadmin"><Star size={12}/> Super Admin</span>;
        if (role === 'admin') return <span className="u-badge admin"><Shield size={12}/> Admin</span>;
        return <span className="u-badge student"><User size={12}/> Student</span>;
    };

    if (loading) return <div className="loading-state"><Loader className="animate-spin" size={40} /></div>;

    return (
        <div className="manage-users-container">
            <header className="mu-header">
                <div>
                    <h1><ShieldAlert size={28} className="mu-header-icon" /> User Management</h1>
                    <p>Manage access levels, suspend accounts, and view all registered members.</p>
                </div>
            </header>

            <div className="mu-controls">
                <div className="mu-search">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="mu-filters">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="mu-select">
                        <option value="all">All Roles</option>
                        <option value="superadmin">Super Admins</option>
                        <option value="admin">Admins</option>
                        <option value="student">Students</option>
                    </select>
                </div>
            </div>

            <div className="mu-table-wrapper">
                <table className="mu-table">
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id} className={!user.is_active ? 'suspended-row' : ''}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-placeholder">
                                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <strong>{user.name || "No Name Provided"}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>
                                        {user.is_active ? (
                                            <span className="status-dot active">Active</span>
                                        ) : (
                                            <span className="status-dot suspended">Suspended</span>
                                        )}
                                    </td>
                                    <td className="date-cell">
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="mu-action-btn edit" onClick={() => handleEdit(user)} title="Edit Privileges">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="mu-action-btn delete" title="Hard Delete Data (WIP)">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="mu-empty">No users found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <UserRoleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={editingUser}
                onSave={handleSaveRole}
            />
        </div>
    );
};

export default ManageUsers;
