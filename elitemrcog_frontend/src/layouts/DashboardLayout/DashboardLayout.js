import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, 
    BookOpen, 
    Video, 
    FileText, 
    ShoppingCart, 
    Settings,
    CalendarCheck, 
    HelpCircle,
    Bell,
    ChevronLeft,
    ChevronDown,
    CheckCircle,
    Power,
    Menu,
    X,
    Star,
    ShieldCheck,
    RefreshCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './DashboardLayout.css';
import logo from '../../assets/images/logo.svg';
import LegalModal from '../../components/Footer/LegalModal';
import { policies } from '../../constants/policies';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { count: cartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activePart, setActivePart] = useState('Part 3');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    // Auto-hide sidebar on module pages
    React.useEffect(() => {
        if (location.pathname.includes('/modules/') || location.pathname.includes('/video-modules/')) {
            setIsSidebarCollapsed(true);
        } else {
            setIsSidebarCollapsed(false);
        }
    }, [location.pathname]);

    const closeModal = () => setActiveModal(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Auto-generate breadcrumbs based on route
    const generateBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        if (pathnames.length === 0) return 'Home';
        
        if (location.pathname.includes('/modules/')) {
            return (
                <div className="breadcrumbs">
                    <ChevronLeft size={18} className="breadcrumb-back" onClick={() => navigate('/dashboard/reading')} />
                    <span className="breadcrumb-path">
                        Home &gt; Reading Library &gt; Module
                    </span>
                </div>
            );
        }
        
        if (location.pathname.includes('/video-modules/')) {
            return (
                <div className="breadcrumbs">
                    <ChevronLeft size={18} className="breadcrumb-back" onClick={() => navigate('/dashboard/video')} />
                    <span className="breadcrumb-path">
                        Home &gt; Video Library &gt; Module
                    </span>
                </div>
            );
        }
        
        return (
            <div className="breadcrumbs">
                <ChevronLeft size={18} className="breadcrumb-back" onClick={() => navigate(-1)} />
                <span className="breadcrumb-path">
                    Home &gt; {pathnames.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ')}
                </span>
            </div>
        );
    };

    return (
        <div className="dashboard-layout">
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <img src="/logo.svg" alt="Elite MRCOG Logo" />
                    <h2>ELITE MRCOG</h2>
                    <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="sidebar-parts-tabs">
                    {['Part 3', 'Part 2', 'Part 1'].map(part => (
                        <button 
                            key={part}
                            className={`part-tab ${activePart === part ? 'active' : ''}`}
                            onClick={() => setActivePart(part)}
                            disabled={part !== 'Part 3'}
                        >
                            {part}
                        </button>
                    ))}
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Home size={20} /> Home
                    </NavLink>
                    <NavLink to="/dashboard/reading" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <BookOpen size={20} /> Reading Library
                    </NavLink>
                    <NavLink to="/dashboard/video" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Video size={20} /> Video Library
                    </NavLink>
                    <NavLink to="/dashboard/mock-exam" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FileText size={20} /> Mock Exam
                    </NavLink>
                    
                    <div className="nav-divider"></div>
                    
                    <NavLink to="/dashboard/cart" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="nav-icon-wrap">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                        </span>
                        Cart
                    </NavLink>
                    <NavLink to="/dashboard/subscription" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <CalendarCheck size={20} /> Subscription
                    </NavLink>
                    <NavLink to="/dashboard/my-subscriptions" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Star size={20} /> My Subscriptions
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="nav-divider"></div>
                    <button className="nav-item" onClick={() => setActiveModal('terms')} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        <FileText size={20} /> Terms &amp; Conditions
                    </button>
                    <button className="nav-item" onClick={() => setActiveModal('privacy')} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        <ShieldCheck size={20} /> Privacy Policy
                    </button>
                    <button className="nav-item" onClick={() => setActiveModal('refund')} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        <RefreshCcw size={20} /> Refund Policy
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-breadcrumbs">
                        <button className="desktop-menu-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                            <Menu size={24} />
                        </button>
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {generateBreadcrumbs()}
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn cart-icon-btn" onClick={() => navigate('/dashboard/cart')}>
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
                        </button>
                        <button className="icon-btn">
                            <Bell size={20} />
                        </button>
                        
                        <div className="profile-dropdown-container">
                            <button 
                                className="profile-btn" 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <img 
                                    src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U')} 
                                    alt="Profile" 
                                    className="profile-avatar"
                                />
                                <span className="profile-name">{user?.first_name || 'User'}</span>
                                <ChevronDown size={16} />
                            </button>

                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <button onClick={() => { setIsProfileOpen(false); navigate('/dashboard/profile'); }}>
                                        <CheckCircle size={16} /> Edit Profile
                                    </button>
                                    <button onClick={handleLogout} className="logout-text">
                                        <Power size={16} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="dashboard-content-area">
                    {location.pathname === '/dashboard' || location.pathname === '/dashboard/' || location.pathname.includes('/modules/') ? (
                        <Outlet />
                    ) : (
                        <div className="dashboard-white-box">
                            <Outlet />
                        </div>
                    )}
                </div>
            </main>

            {/* Legal Modals */}
            <LegalModal
                isOpen={activeModal === 'privacy'}
                onClose={closeModal}
                title="Privacy Policy"
                content={policies.privacy}
            />
            <LegalModal
                isOpen={activeModal === 'terms'}
                onClose={closeModal}
                title="Terms &amp; Conditions"
                content={policies.terms}
            />
            <LegalModal
                isOpen={activeModal === 'refund'}
                onClose={closeModal}
                title="Refund Policy"
                content={policies.refund}
            />
        </div>
    );
};

export default DashboardLayout;
