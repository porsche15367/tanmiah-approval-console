import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppState, useCurrentUser } from '../context/AppContext';

export default function Profile() {
  const { stages, roles, requests } = useAppState();
  const currentUser = useCurrentUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const roleName = roles.find((r) => r.id === currentUser.roleId)?.name || currentUser.roleId;
  const stagesForRole = stages.filter((s) => s.isActive && s.approverRoles.includes(currentUser.roleId));
  const myRequests = requests.filter((r) => r.requesterId === currentUser.id);

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <main className="container">
      <h1>My Profile</h1>
      <p className="subtitle">Your account details and where you show up in the approval pipeline.</p>

      <div className="two-col">
        <div>
          <div className="section card">
            <h2>Account</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.1rem' }}>{currentUser.initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{currentUser.name}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{currentUser.email}</div>
              </div>
            </div>
            <table className="matrix">
              <tbody>
                <tr><td><b>Role</b></td><td>{roleName}</td></tr>
                <tr><td><b>Requests Submitted</b></td><td>{myRequests.length}</td></tr>
              </tbody>
            </table>
            <button className="btn btn-danger" style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={logout}><LogOut size={15} /> Logout</button>
          </div>

          <div className="section card">
            <h2>Stages You Can Act On</h2>
            {stagesForRole.length === 0 ? (
              <p style={{ color: 'var(--gray-500)' }}>Your role isn't an approver on any active stage.</p>
            ) : (
              <ul style={{ paddingLeft: 20, color: 'var(--gray-700)' }}>
                {stagesForRole.map((s) => <li key={s.id} style={{ marginBottom: 6 }}>{s.name}</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h2>My Requests</h2>
          {myRequests.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>You haven't submitted any requests yet.</p>
          ) : (
            myRequests.map((r) => (
              <div key={r.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--gray-200)' }}>
                <a href={`/request/${r.id}`} onClick={(e) => { e.preventDefault(); navigate(`/request/${r.id}`); }} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.id} — {r.title}</a>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{r.overallStatus}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
