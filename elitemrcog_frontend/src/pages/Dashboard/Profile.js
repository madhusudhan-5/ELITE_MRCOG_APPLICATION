import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Lock } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        country: '',
        exam_batch: ''
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                country: user.country || '',
                exam_batch: user.exam_batch || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            // Wait, we need an endpoint for updating profile.
            // But we can hit /api/auth/me/ if we set it up to accept PUT/PATCH
            const response = await api.patch('/api/auth/me/', formData);
            setUser(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-left">
                <div className="profile-avatar-large">
                    <img 
                        src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U')} 
                        alt="Profile avatar" 
                    />
                </div>
                <h3 className="profile-name-large">{user?.first_name} {user?.last_name}</h3>
                
                <div className="profile-info-block">
                    <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{user?.email}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Mobile:</span>
                        <span className="info-value">{user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Batch:</span>
                        <span className="info-value">{user?.exam_batch || 'No batch selected'}</span>
                    </div>
                </div>
            </div>

            <div className="profile-right">
                <h2>Edit your profile</h2>
                
                {message && (
                    <div className={`alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="profile-form">
                    <div className="form-row-three">
                        <div className="form-group">
                            <label>First Name</label>
                            <input 
                                type="text" 
                                name="first_name" 
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                name="last_name" 
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <select name="country" value={formData.country} onChange={handleChange}>
                                <option value="">Select country</option>
                                <option value="India">India</option>
                                <option value="UK">United Kingdom</option>
                                <option value="UAE">UAE</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mobile Number</label>
                        <div className="locked-input">
                            <input 
                                type="text" 
                                value={user?.phone || ''}
                                disabled
                            />
                            <Lock size={16} className="lock-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Exam</label>
                        <select name="exam_batch" value={formData.exam_batch} onChange={handleChange}>
                            <option value="">Select batch</option>
                            <option value="Exam 1">Exam 1</option>
                            <option value="Exam 2">Exam 2</option>
                            <option value="Exam 3">Exam 3</option>
                        </select>
                    </div>

                    <div className="profile-actions">
                        <button type="button" className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
