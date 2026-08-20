import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, 
    BookOpen, 
    Video, 
    FileText, 
    ShoppingCart, 
    CalendarCheck, 
    Bell,
    ChevronDown,
    CheckCircle,
    Power,
    Menu,
    X,
    Star,
    ShieldCheck,
    RefreshCcw,
    BookMarked,
    CreditCard,
    User,
    PlayCircle
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './DashboardLayout.css';
import logo from '../../assets/images/logo.jpeg';
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

    const profileDropdownRef = React.useRef(null);
    const sidebarRef = React.useRef(null);
    const mobileMenuBtnRef = React.useRef(null);

    // Auto-hide sidebar on module pages and close mobile menu on route change
    React.useEffect(() => {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
        if (location.pathname.includes('/modules/') || location.pathname.includes('/video-modules/')) {
            setIsSidebarCollapsed(true);
        } else {
            setIsSidebarCollapsed(false);
        }
    }, [location.pathname]);

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

    // Close mobile sidebar on outside click / tap
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

    const closeSidebarOnMobile = () => {
        setIsSidebarOpen(false);
    };

    const closeModal = () => setActiveModal(null);

    const handleLogout = () => {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
        logout();
        navigate('/login');
    };

    const getBreadcrumbItems = (pathname) => {
        const pathnames = pathname.split('/').filter(x => x);
        if (pathnames.length <= 1) return null;

        const items = [
            { label: 'Home', path: '/dashboard', icon: Home }
        ];

        if (pathname.includes('/modules/')) {
            items.push({ label: 'Reading Library', path: '/dashboard/reading', icon: BookOpen });
            items.push({ label: 'Reading Material', icon: BookMarked });
            return items;
        }

        if (pathname.includes('/video-modules/')) {
            items.push({ label: 'Video Library', path: '/dashboard/video', icon: PlayCircle });
            items.push({ label: 'Video Lecture', icon: Video });
            return items;
        }

        if (pathname.includes('/reading')) {
            items.push({ label: 'Reading Library', icon: BookOpen });
            return items;
        }

        if (pathname.includes('/video')) {
            items.push({ label: 'Video Library', icon: PlayCircle });
            return items;
        }

        if (pathname.includes('/cart')) {
            items.push({ label: 'Cart', icon: ShoppingCart });
            return items;
        }

        if (pathname.includes('/checkout')) {
            items.push({ label: 'Cart', path: '/dashboard/cart', icon: ShoppingCart });
            items.push({ label: 'Checkout', icon: CreditCard });
            return items;
        }

        if (pathname.includes('/my-subscriptions')) {
            items.push({ label: 'My Subscriptions', icon: Star });
            return items;
        }

        if (pathname.includes('/subscription')) {
            items.push({ label: 'Subscription', icon: CalendarCheck });
            return items;
        }

        if (pathname.includes('/profile')) {
            items.push({ label: 'Profile', icon: User });
            return items;
        }

        if (pathname.includes('/mock-exam')) {
            items.push({ label: 'Mock Exam', icon: FileText });
            return items;
        }

        pathnames.slice(1).forEach((name, idx) => {
            const path = '/dashboard/' + pathnames.slice(1, idx + 2).join('/');
            const isLast = idx === pathnames.length - 2;
            const formatted = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
            items.push({
                label: formatted,
                path: isLast ? null : path,
                icon: isLast ? FileText : BookOpen
            });
        });

        return items;
    };



    return (
        <div className="dashboard-layout">
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            
            <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <img src={logo} alt="Elite MRCOG Logo" />
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
                    <NavLink to="/dashboard" end onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Home size={20} /> Home
                    </NavLink>
                    <NavLink to="/dashboard/reading" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <BookOpen size={20} /> Reading Library
                    </NavLink>
                    <NavLink to="/dashboard/video" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Video size={20} /> Video Library
                    </NavLink>
                    <NavLink to="/dashboard/mock-exam" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FileText size={20} /> Mock Exam
                    </NavLink>
                    
                    <div className="nav-divider"></div>
                    
                    <NavLink to="/dashboard/cart" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <span className="nav-icon-wrap">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                        </span>
                        Cart
                    </NavLink>
                    <NavLink to="/dashboard/subscription" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <CalendarCheck size={20} /> Subscription
                    </NavLink>
                    <NavLink to="/dashboard/my-subscriptions" onClick={closeSidebarOnMobile} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Star size={20} /> My Subscriptions
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="nav-divider"></div>
                    <button className="nav-item" onClick={() => { closeSidebarOnMobile(); setActiveModal('terms'); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        <FileText size={20} /> Terms &amp; Conditions
                    </button>
                    <button className="nav-item" onClick={() => { closeSidebarOnMobile(); setActiveModal('privacy'); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                        <ShieldCheck size={20} /> Privacy Policy
                    </button>
                    <button className="nav-item" onClick={() => { closeSidebarOnMobile(); setActiveModal('refund'); }} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
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
                        <button ref={mobileMenuBtnRef} className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        {location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? (
                            <div className="header-welcome-greeting">
                                <span className="header-welcome-title">Welcome, {user?.first_name || user?.name || 'Student'}!</span>
                                <span className="header-welcome-subtitle">Let's start learning</span>
                            </div>
                        ) : (
                            <Breadcrumbs items={getBreadcrumbItems(location.pathname)} />
                        )}
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn cart-icon-btn" onClick={() => navigate('/dashboard/cart')}>
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
                        </button>
                        <button className="icon-btn">
                            <Bell size={20} />
                        </button>
                        
                        <div ref={profileDropdownRef} className="profile-dropdown-container">
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

                <div className={`dashboard-content-area ${location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'dashboard-home-content' : ''}`}>
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
