import React, { useState, useEffect } from 'react';
import { X, Shield, ShieldAlert, User } from 'lucide-react';
import './UserRoleModal.css';

const UserRoleModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        is_staff: false,
        is_superuser: false,
        is_active: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                is_staff: user.is_staff,
                is_superuser: user.is_superuser,
                is_active: user.is_active
            });
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleRoleChange = (role) => {
        if (role === 'student') {
            setFormData({ ...formData, is_staff: false, is_superuser: false });
        } else if (role === 'admin') {
            setFormData({ ...formData, is_staff: true, is_superuser: false });
        } else if (role === 'superadmin') {
            setFormData({ ...formData, is_staff: true, is_superuser: true });
        }
    };

    const handleStatusToggle = () => {
        setFormData({ ...formData, is_active: !formData.is_active });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...user,
            is_staff: formData.is_staff,
            is_superuser: formData.is_superuser,
            is_active: formData.is_active
        });
    };

    // Calculate current UI role state for active styles
    const currentRole = formData.is_superuser ? 'superadmin' : formData.is_staff ? 'admin' : 'student';

    return (
        <div className="ur-modal-overlay" onClick={onClose}>
            <div className="ur-modal-container" onClick={e => e.stopPropagation()}>
                <div className="ur-header">
                    <h2>Edit User Access</h2>
                    <button className="ur-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="ur-user-banner">
                    <div className="ur-avatar">
                        {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                    </div>
                    <div className="ur-info">
                        <strong>{user.name || "Unnamed User"}</strong>
                        <span>{user.email}</span>
                        <div className="ur-since">Joined: {new Date(user.date_joined).toLocaleDateString()}</div>
                    </div>
                </div>

                <form className="ur-form" onSubmit={handleSubmit}>
                    
                    <div className="ur-section">
                        <h3>Account Status</h3>
                        <div className={`ur-status-banner ${formData.is_active ? 'active' : 'suspended'}`}>
                            <div className="ur-status-info">
                                <strong>{formData.is_active ? 'Account is Active' : 'Account Suspended'}</strong>
                                <p>
                                    {formData.is_active 
                                        ? "This user can log in and access their subscriptions normally." 
                                        : "This user cannot log in. Their access is completely revoked."
                                    }
                                </p>
                            </div>
                            <button 
                                type="button" 
                                className={`ur-toggle-btn ${formData.is_active ? 'suspend' : 'activate'}`}
                                onClick={handleStatusToggle}
                            >
                                {formData.is_active ? 'Suspend User' : 'Restore Access'}
                            </button>
                        </div>
                    </div>

                    <div className="ur-section">
                        <h3>Platform Role</h3>
                        <p className="ur-section-desc">Changes take effect immediately upon saving.</p>
                        
                        <div className="ur-role-grid">
                            <label className={`ur-role-card ${currentRole === 'student' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="student" 
                                    checked={currentRole === 'student'}
                                    onChange={() => handleRoleChange('student')}
                                    hidden 
                                />
                                <User className="ur-role-icon" size={24} />
                                <strong>Student</strong>
                                <span>Can only view purchased content.</span>
                            </label>

                            <label className={`ur-role-card admin ${currentRole === 'admin' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="admin" 
                                    checked={currentRole === 'admin'}
                                    onChange={() => handleRoleChange('admin')}
                                    hidden 
                                />
                                <Shield className="ur-role-icon" size={24} />
                                <strong>Admin</strong>
                                <span>Can create and edit course content.</span>
                            </label>

                            <label className={`ur-role-card superadmin ${currentRole === 'superadmin' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="superadmin" 
                                    checked={currentRole === 'superadmin'}
                                    onChange={() => handleRoleChange('superadmin')}
                                    hidden 
                                />
                                <ShieldAlert className="ur-role-icon" size={24} />
                                <strong>Super Admin</strong>
                                <span>Full system access. Can manage users.</span>
                            </label>
                        </div>
                    </div>

                    <div className="ur-footer">
                        <button type="button" className="ur-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="ur-save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRoleModal;
