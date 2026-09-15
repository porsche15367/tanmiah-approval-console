import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useCurrentUser } from '../context/AppContext';

/** Redirects to /login when no user is logged in. Optionally restricts by role. */
export default function RequireAuth({ children, requireRoleId }) {
  const currentUser = useCurrentUser();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (requireRoleId && currentUser.roleId !== requireRoleId) {
    return (
      <main className="container">
        <div className="access-denied">
          <div className="icon"><Lock size={28} /></div>
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--gray-500)' }}>This area is limited to the System Admin role. You're signed in as {currentUser.name}.</p>
        </div>
      </main>
    );
  }

  return children;
}
