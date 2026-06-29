import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, 
    Users, 
    Settings,
    ChevronLeft,
    ChevronDown,
    Power,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const generateBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        if (pathnames.length === 0) return 'Super Admin Home';
        
        return (
            <div className="breadcrumbs">
                <ChevronLeft size={18} className="breadcrumb-back" onClick={() => navigate(-1)} />
                <span className="breadcrumb-path">
                    Super Admin &gt; {pathnames.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ')}
                </span>
            </div>
        );
    };

    return (
        <div className="superadmin-layout">
            {isSidebarOpen && (
                <div className="superadmin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside className={`superadmin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="superadmin-sidebar-brand">
                    <img src="/logo.svg" alt="Elite MRCOG Logo" />
                    <h2>SUPER ADMIN</h2>
                    <button className="superadmin-mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="superadmin-sidebar-nav">
                    <NavLink to="/superadmin" end className={({isActive}) => isActive ? 'superadmin-nav-item active' : 'superadmin-nav-item'}>
                        <Home size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/superadmin/users" className={({isActive}) => isActive ? 'superadmin-nav-item active' : 'superadmin-nav-item'}>
                        <Users size={20} /> Manage Users
                    </NavLink>
                    <NavLink to="/superadmin/settings" className={({isActive}) => isActive ? 'superadmin-nav-item active' : 'superadmin-nav-item'}>
                        <Settings size={20} /> System Settings
                    </NavLink>
                </nav>

                <div className="superadmin-sidebar-bottom">
                    <div className="superadmin-nav-divider"></div>
                    <button onClick={handleLogout} className="superadmin-nav-item logout-btn">
                        <Power size={20} /> Logout
                    </button>
                </div>
            </aside>

            <main className="superadmin-main">
                <header className="superadmin-header">
                    <div className="superadmin-header-breadcrumbs">
                        <button className="superadmin-mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {generateBreadcrumbs()}
                    </div>
                    <div className="superadmin-header-actions">
                        <div className="superadmin-profile-dropdown-container">
                            <button 
                                className="superadmin-profile-btn" 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <img 
                                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'SuperAdmin')} 
                                    alt="Profile" 
                                    className="superadmin-profile-avatar"
                                />
                                <span className="superadmin-profile-name">{user?.first_name || 'Super Admin'}</span>
                                <ChevronDown size={16} />
                            </button>

                            {isProfileOpen && (
                                <div className="superadmin-profile-dropdown">
                                    <button onClick={handleLogout} className="logout-text">
                                        <Power size={16} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="superadmin-content-area">
                    <div className="superadmin-white-box">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
