import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, RefreshCw, CheckCircle2, UserCircle2, Settings, ChevronsLeft, ChevronsRight, FolderKanban } from 'lucide-react';
import { useAppState, useCurrentUser } from '../context/AppContext';

export default function Sidebar() {
  const currentUser = useCurrentUser();
  const { requests } = useAppState();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('approval-poc-sidebar-collapsed') === '1');

  if (!currentUser) return null;

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('approval-poc-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  };

  const currentCount = requests.filter((r) => r.overallStatus !== 'Completed').length;
  const previousCount = requests.filter((r) => r.overallStatus === 'Completed').length;

  const params = new URLSearchParams(location.search);
  const activeStatus = location.pathname === '/' ? params.get('status') || 'all' : null;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <span className="brand-mark">T</span>
        {!collapsed && (
          <div>
            <div className="sb-title">Tanmiah</div>
            <div className="sb-sub">Approval Console</div>
          </div>
        )}
      </div>

      <nav className="side-nav">
        {!collapsed && <div className="side-section-label">Overview</div>}
        <Link to="/" className={`side-link ${activeStatus === 'all' ? 'active' : ''}`} title="Dashboard">
          <LayoutDashboard className="side-icon" size={16} /> {!collapsed && 'Dashboard'}
        </Link>
        <Link to="/new" className={`side-link ${location.pathname === '/new' ? 'active' : ''}`} title="New Request">
          <PlusCircle className="side-icon" size={16} /> {!collapsed && 'New Request'}
        </Link>
        <Link to="/projects" className={`side-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`} title="Projects Timeline">
          <FolderKanban className="side-icon" size={16} /> {!collapsed && 'Projects Timeline'}
        </Link>

        {!collapsed && <div className="side-section-label">Requests</div>}
        <Link to="/?status=current" className={`side-link ${activeStatus === 'current' ? 'active' : ''}`} title="Current Requests">
          <RefreshCw className="side-icon" size={16} />
          {!collapsed && <>Current Requests<span className="side-count">{currentCount}</span></>}
        </Link>
        <Link to="/?status=previous" className={`side-link ${activeStatus === 'previous' ? 'active' : ''}`} title="Previous Requests">
          <CheckCircle2 className="side-icon" size={16} />
          {!collapsed && <>Previous Requests<span className="side-count">{previousCount}</span></>}
        </Link>

        {!collapsed && <div className="side-section-label">Account</div>}
        <NavLink to="/profile" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} title="My Profile">
          <UserCircle2 className="side-icon" size={16} /> {!collapsed && 'My Profile'}
        </NavLink>
        {currentUser.roleId === 'role-admin' && (
          <NavLink to="/admin" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} title="Admin Config">
            <Settings className="side-icon" size={16} /> {!collapsed && 'Admin Config'}
          </NavLink>
        )}
      </nav>

      <button className="sidebar-toggle" onClick={toggle} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
        {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
      </button>

      <div className="sidebar-footer">
        <div className="avatar">{currentUser.initials}</div>
        {!collapsed && (
          <div className="who">
            <div className="pname">{currentUser.name}</div>
            <div className="prole">{currentUser.roleId.replace('role-', '').replace(/-/g, ' ')}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
