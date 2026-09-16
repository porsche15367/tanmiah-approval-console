import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppState, useCurrentUser } from '../context/AppContext';
import { useLocale } from '../context/LocaleContext';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Header() {
  const { notifications } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { locale, setLocale, t } = useLocale();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!currentUser) return null;

  const myNotifs = notifications
    .filter((n) => n.targetRoleId === currentUser.roleId || n.targetUserId === currentUser.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const openNotification = (n) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId: n.id });
    setNotifOpen(false);
    navigate(`/request/${n.requestId}`);
  };

  const markAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', roleId: currentUser.roleId, userId: currentUser.id });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <header className="app-header">
      <button className="lang-toggle" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
        {locale === 'ar' ? t('english') : t('arabic')}
      </button>

      <div className="header-actions">
        <div className="dropdown-wrap" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((v) => !v)} title={t('notifications')}>
            <Bell size={17} />
            {unreadCount > 0 && <span className="dot-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="dropdown-panel">
              <div className="dropdown-header">
                <span>{t('notifications')}</span>
                {unreadCount > 0 && <button onClick={markAllRead}>{t('markAllRead')}</button>}
              </div>
              {myNotifs.length === 0 ? (
                <div className="notif-empty">You're all caught up.</div>
              ) : (
                myNotifs.slice(0, 20).map((n) => (
                  <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => openNotification(n)}>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="dropdown-wrap" ref={profileRef}>
          <div className="profile-trigger" onClick={() => setProfileOpen((v) => !v)}>
            <div className="avatar">{currentUser.initials}</div>
            <div className="who">
              <div className="pname">{currentUser.name}</div>
              <div className="prole">{currentUser.roleId.replace('role-', '').replace(/-/g, ' ')}</div>
            </div>
            <ChevronDown size={14} className="profile-chevron" />
          </div>
          {profileOpen && (
            <div className="dropdown-panel narrow">
              <div className="profile-menu-item" onClick={() => { setProfileOpen(false); navigate('/profile'); }}><User size={15} /> {t('myProfile')}</div>
              <div className="profile-menu-item danger" onClick={logout}><LogOut size={15} /> {t('logout')}</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
