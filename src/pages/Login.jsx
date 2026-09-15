import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppState, useCurrentUser } from '../context/AppContext';

export default function Login() {
  const { users, roles } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const from = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) return <Navigate to="/" replace />;

  const roleName = (roleId) => roles.find((r) => r.id === roleId)?.name || roleId;

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return setError('No account found with that email. Try one of the demo accounts below.');
    if (!password.trim()) return setError('Please enter a password (any value works in this demo).');
    dispatch({ type: 'LOGIN', userId: user.id });
    navigate(from, { replace: true });
  };

  const quickLogin = (userId) => {
    dispatch({ type: 'LOGIN', userId });
    navigate(from, { replace: true });
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">T</span>
          <h1>Tanmiah Approval Console</h1>
          <p>Sign in to manage feature approvals & releases</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@tanmiah.org" required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Sign In</button>
        </form>

        <div className="demo-accounts">
          <p>Quick demo login</p>
          <div className="demo-account-list">
            {users.map((u) => (
              <button key={u.id} className="demo-account-btn" onClick={() => quickLogin(u.id)}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{u.initials}</div>
                <div>
                  <div className="dname">{u.name}</div>
                  <div className="drole">{roleName(u.roleId)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
