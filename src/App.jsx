import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import AdminConfig from './pages/AdminConfig';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProjectTimelinePage from './pages/ProjectTimelinePage';
import RequireAuth from './components/RequireAuth';
import { useLocale } from './context/LocaleContext';

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { dir, locale } = useLocale();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Header />
        <Routes>
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/new" element={<RequireAuth><NewRequest /></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><ProjectTimelinePage /></RequireAuth>} />
          <Route path="/projects/:projectId" element={<RequireAuth><ProjectTimelinePage /></RequireAuth>} />
          <Route path="/request/:id" element={<RequireAuth><RequestDetail /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth requireRoleId="role-admin"><AdminConfig /></RequireAuth>} />
        </Routes>
      </div>
    </div>
  );
}
