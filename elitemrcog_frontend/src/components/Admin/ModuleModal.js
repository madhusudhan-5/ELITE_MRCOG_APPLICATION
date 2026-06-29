import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Link as LinkIcon, Info } from 'lucide-react';
import api from '../../services/api';
import './ModuleModal.css';

const ModuleModal = ({ isOpen, onClose, onSave, moduleData, parts = [], defaultPart }) => {
    const getDefaultPartId = () => {
        if (parts.length === 0) return '';
        const part = parts.find(p => p.name === defaultPart);
        return part ? part.id : parts[0].id;
    };

    const defaultState = {
        part: '',
        title: '',
        short_text: '',
        long_text: '',
        tags: '',
        is_active: true,
        thumbnail: null
    };

    const [formData, setFormData] = useState(defaultState);
    const [previewThumb, setPreviewThumb] = useState(null);

    useEffect(() => {
        if (moduleData) {
            setFormData(moduleData);
            setPreviewThumb(moduleData.thumbnail || null); // DB thumbnail path
        } else {
            setFormData({ ...defaultState, part: getDefaultPartId() });
            setPreviewThumb(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleData, isOpen, defaultPart, parts]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreviewThumb(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('part', formData.part);
            formDataToSubmit.append('title', formData.title);
            formDataToSubmit.append('short_text', formData.short_text);
            formDataToSubmit.append('long_text', formData.long_text);
            formDataToSubmit.append('tags', formData.tags);
            formDataToSubmit.append('is_active', formData.is_active);
            
            if (formData.thumbnail instanceof File) {
                formDataToSubmit.append('thumbnail', formData.thumbnail);
            }

            let response;
            if (moduleData && moduleData.id) {
                response = await api.put(`/api/content/manage/modules/${moduleData.id}/`, formDataToSubmit, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSave(response.data, true);
            } else {
                response = await api.post(`/api/content/manage/modules/`, formDataToSubmit, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                onSave(response.data, false);
            }
        } catch (err) {
            console.error("Failed to save module", err);
            alert("Error saving module check fields and permissions.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container module-modal" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h2>{moduleData ? 'Edit Module' : 'Create New Module'}</h2>
                    <button className="modal-close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-scroll-area">
                        
                        {/* Row 1 */}
                        <div className="form-row-admin">
                            <div className="form-group-admin">
                                <label>Target Part <span className="required">*</span></label>
                                <select name="part" value={formData.part} onChange={handleChange} required>
                                    <option value="" disabled>Select a Part</option>
                                    {parts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group-admin flex-2">
                                <label>Module Title <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Communication Skills" 
                                    required
                                />
                            </div>
                        </div>

                        {/* Thumbnail Upload */}
                        <div className="form-group-admin">
                            <label>Thumbnail Image</label>
                            <div className="upload-area">
                                {previewThumb ? (
                                    <div className="preview-container">
                                        <img src={previewThumb} alt="Preview" className="thumb-preview" />
                                        <button type="button" className="remove-thumb-btn" onClick={() => { setFormData({...formData, thumbnail: null}); setPreviewThumb(null); }}>
                                            <X size={16} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-label">
                                        <UploadCloud size={32} className="upload-icon" />
                                        <span>Click to browse</span>
                                        <span className="upload-hint">1280x720px Recommended (JPG/PNG)</span>
                                        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="form-group-admin">
                            <label>Short Description (Preview Text) <span className="required">*</span></label>
                            <textarea 
                                name="short_text" 
                                value={formData.short_text} 
                                onChange={handleChange}
                                placeholder="A brief 1-2 sentence description shown on the module cards..."
                                rows={2}
                                maxLength={250}
                                required
                            />
                            <div className="char-count">{formData.short_text?.length || 0}/250</div>
                        </div>

                        {/* Long Description (Textarea fallback for now) */}
                        <div className="form-group-admin">
                            <label>Long Description (Detailed Overview)</label>
                            <div className="admin-hint">
                                <Info size={14} /> Plain text for now. Rich Text Editor can be added here later.
                            </div>
                            <textarea 
                                name="long_text" 
                                value={formData.long_text} 
                                onChange={handleChange}
                                placeholder="Enter full syllabus or module introduction here..."
                                rows={6}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="form-row-admin">
                            <div className="form-group-admin flex-2">
                                <label>Tags (Comma separated)</label>
                                <div className="input-with-icon">
                                    <LinkIcon size={16} className="input-icon" />
                                    <input 
                                        type="text" 
                                        name="tags" 
                                        value={formData.tags} 
                                        onChange={handleChange} 
                                        placeholder="Maternal, Diabetes, High Yield" 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group-admin toggle-group">
                                <label>Publish Status</label>
                                <label className="switch-wrapper">
                                    <input 
                                        type="checkbox" 
                                        name="is_active" 
                                        checked={formData.is_active} 
                                        onChange={handleChange} 
                                    />
                                    <span className="switch-slider"></span>
                                    <span className="switch-label">{formData.is_active ? 'Active' : 'Draft'}</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-save-btn">
                            {moduleData ? 'Save Changes' : 'Create Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModuleModal;
