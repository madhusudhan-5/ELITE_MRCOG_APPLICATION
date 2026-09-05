import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    Home, 
    BookOpen, 
    BookMarked,
    DollarSign,
    CreditCard,
    ChevronDown,
    Power,
    Menu,
    X,
    PlayCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';
import logo from '../../assets/images/logo.jpeg';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const profileDropdownRef = React.useRef(null);
    const sidebarRef = React.useRef(null);
    const mobileMenuBtnRef = React.useRef(null);

    // Close profile dropdown on outside click / tap
    React.useEffect(() => {
        const handleProfileOutsideClick = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        const handleWindowBlur = () => {
            setIsProfileOpen(false);
        };

        if (isProfileOpen) {
            document.addEventListener('pointerdown', handleProfileOutsideClick);
            document.addEventListener('mousedown', handleProfileOutsideClick);
            document.addEventListener('touchstart', handleProfileOutsideClick);
            window.addEventListener('blur', handleWindowBlur);
        }
        return () => {
            document.removeEventListener('pointerdown', handleProfileOutsideClick);
            document.removeEventListener('mousedown', handleProfileOutsideClick);
            document.removeEventListener('touchstart', handleProfileOutsideClick);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [isProfileOpen]);

    // Close sidebar on outside click / tap
    React.useEffect(() => {
        const handleSidebarOutsideClick = (event) => {
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                (!mobileMenuBtnRef.current || !mobileMenuBtnRef.current.contains(event.target))
            ) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('pointerdown', handleSidebarOutsideClick);
            document.addEventListener('mousedown', handleSidebarOutsideClick);
            document.addEventListener('touchstart', handleSidebarOutsideClick);
        }
        return () => {
            document.removeEventListener('pointerdown', handleSidebarOutsideClick);
            document.removeEventListener('mousedown', handleSidebarOutsideClick);
            document.removeEventListener('touchstart', handleSidebarOutsideClick);
        };
    }, [isSidebarOpen]);

    const handleLogout = () => {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
        logout();
        navigate('/login');
    };



    return (
        <div className="admin-layout">
            {isSidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside ref={sidebarRef} className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-brand">
                    <img src={logo} alt="Elite MRCOG Logo" />
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
                        <button ref={mobileMenuBtnRef} className="admin-mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="admin-header-actions">
                        <div ref={profileDropdownRef} className="admin-profile-dropdown-container">
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
                    <footer className="admin-footer">
                        <p>© {new Date().getFullYear()} Elite MRCOG. All rights reserved.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
