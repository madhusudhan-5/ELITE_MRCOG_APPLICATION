import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Lock, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ContentCard.css';

const ContentCard = ({ material, type = 'module', basePath = '/dashboard/modules' }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const title = material.title;
    const isFree = material.is_free !== undefined ? material.is_free : true;
    const isLocked = !isFree;

    // Determine category label
    const categoryLabel = (material.category === 'course_material' || material.article_type === 'course_material')
        ? 'Course Material'
        : null;

    const handleCardClick = () => {
        navigate(`${basePath}/${material.id}`);
    };

    return (
        <div className={`content-card ${type === 'home' ? 'home-card' : ''} ${isLocked ? 'locked' : ''}`} onClick={handleCardClick}>
            <div className={`cc-thumbnail-wrapper ${type === 'home' ? 'home-thumb' : ''}`}>
                {material.thumbnail ? (
                    <img src={material.thumbnail} alt={title} className="cc-thumbnail" />
                ) : (
                    <div className="cc-placeholder-thumb">
                        {type === 'video' ? <PlayCircle size={48} /> : <BookOpen size={48} />}
                    </div>
                )}

                {/* Lock Badge in Top Right */}
                {isLocked && (
                    <div className="cc-lock-badge" title="Subscribe to unlock">
                        <Lock size={14} />
                    </div>
                )}

                {/* Badges */}
                <div className="cc-badges">
                    {categoryLabel && (
                        <span className={`cc-badge type ${material.category || material.article_type}`}>
                            {categoryLabel}
                        </span>
                    )}
                    {isFree && (
                        <span className="cc-badge free">Free</span>
                    )}
                </div>
            </div>

            <div className="cc-content">
                {material.module_title && (
                    <span className="cc-subtitle">{material.module_title}</span>
                )}
                <h3 className="cc-title" title={title}>{title}</h3>
                {isLocked && (
                    <span className="cc-subscribe-prompt">
                        <Lock size={12} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }} />
                        Subscribe to unlock
                    </span>
                )}
                {type !== 'home' && (
                    <p className="cc-desc">{material.short_text || material.short_description || 'Explore this course module in detail.'}</p>
                )}

                {/* Tags */}
                {type !== 'home' && material.tags_list && material.tags_list.length > 0 && (
                    <div className="cc-tags">
                        {material.tags_list.slice(0, 3).map(tag => (
                            <span key={tag} className="cc-tag">{tag}</span>
                        ))}
                    </div>
                )}

                {type !== 'home' && (
                    <div className="cc-footer">
                        {type === 'module' && (
                            <>
                                <div className="cc-stat">
                                    <BookOpen size={14} /> {material.article_count || 0} articles
                                </div>
                                <div className="cc-stat">
                                    <Video size={14} /> {material.video_count || 0} videos
                                </div>
                            </>
                        )}
                        {material.duration_display && (
                            <div className="cc-stat primary">{material.duration_display}</div>
                        )}

                        <button
                            className="cc-view-more"
                            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                        >
                            View More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentCard;
