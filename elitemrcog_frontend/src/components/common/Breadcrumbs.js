import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="page-breadcrumbs" aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const IconComponent = item.icon;

                return (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="breadcrumb-separator">›</span>}
                        {isLast || !item.path ? (
                            <span className="breadcrumb-current">
                                {IconComponent && <IconComponent size={14} className="breadcrumb-icon" />}
                                <span>{item.label}</span>
                            </span>
                        ) : (
                            <Link to={item.path} className="breadcrumb-link">
                                {IconComponent && <IconComponent size={14} className="breadcrumb-icon" />}
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
