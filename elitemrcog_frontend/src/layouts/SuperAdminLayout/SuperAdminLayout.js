import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    Home, 
    Users, 
    Settings,
    ChevronDown,
    Power,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminLayout.css';
import logo from '../../assets/images/logo.jpeg';

const SuperAdminLayout = () => {
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

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleProfileOutsideClick);
            document.addEventListener('touchstart', handleProfileOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleProfileOutsideClick);
            document.removeEventListener('touchstart', handleProfileOutsideClick);
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
            document.addEventListener('mousedown', handleSidebarOutsideClick);
            document.addEventListener('touchstart', handleSidebarOutsideClick);
        }
        return () => {
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
        <div className="superadmin-layout">
            {isSidebarOpen && (
                <div className="superadmin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside ref={sidebarRef} className={`superadmin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="superadmin-sidebar-brand">
                    <img src={logo} alt="Elite MRCOG Logo" />
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
                        <button ref={mobileMenuBtnRef} className="superadmin-mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="superadmin-header-actions">
                        <div ref={profileDropdownRef} className="superadmin-profile-dropdown-container">
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
