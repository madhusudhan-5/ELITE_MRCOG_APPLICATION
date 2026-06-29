import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, 
    BookOpen, 
    BookMarked,
    DollarSign,
    CreditCard,
    ChevronLeft,
    ChevronDown,
    Power,
    Menu,
    X,
    PlayCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
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
        if (pathnames.length === 0) return 'Admin Home';
        
        return (
            <div className="breadcrumbs">
                <ChevronLeft size={18} className="breadcrumb-back" onClick={() => navigate(-1)} />
                <span className="breadcrumb-path">
                    Admin &gt; {pathnames.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ')}
                </span>
            </div>
        );
    };

    return (
        <div className="admin-layout">
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-brand">
                    <img src="/logo.svg" alt="Elite MRCOG Logo" />
                    <h2>ADMIN PORTAL</h2>
                    <button className="admin-mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="admin-sidebar-nav">
                    <NavLink to="/admin" end className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <Home size={20} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/courses" className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <BookOpen size={20} /> Manage Courses
                    </NavLink>
                    <NavLink to="/admin/reading-library" className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <BookMarked size={20} /> Reading Library
                    </NavLink>
                    <NavLink to="/admin/video-library" className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <PlayCircle size={20} /> Video Library
                    </NavLink>
                    <NavLink to="/admin/subscriptions" className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <CreditCard size={20} /> Subscriptions
                    </NavLink>
                    <NavLink to="/admin/payments" className={({isActive}) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
                        <DollarSign size={20} /> Manage Payments
                    </NavLink>
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-nav-divider"></div>
                    <button onClick={handleLogout} className="admin-nav-item logout-btn">
                        <Power size={20} /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-breadcrumbs">
                        <button className="admin-mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {generateBreadcrumbs()}
                    </div>
                    <div className="admin-header-actions">
                        <div className="admin-profile-dropdown-container">
                            <button 
                                className="admin-profile-btn" 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <img 
                                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'Admin')} 
                                    alt="Profile" 
                                    className="admin-profile-avatar"
                                />
                                <span className="admin-profile-name">{user?.first_name || 'Admin'}</span>
                                <ChevronDown size={16} />
                            </button>

                            {isProfileOpen && (
                                <div className="admin-profile-dropdown">
                                    <button onClick={handleLogout} className="logout-text">
                                        <Power size={16} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="admin-content-area">
                    <div className="admin-white-box">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
