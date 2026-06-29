import React from 'react';
import './LegalModal.css';

const LegalModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="legal-modal-overlay" onClick={onClose}>
            <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="legal-modal-header">
                    <h2>{title}</h2>
                    <button className="legal-modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="legal-modal-body">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
