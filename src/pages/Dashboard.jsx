import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, FolderOpen, Inbox, Layers, Clock, CheckCircle2, AlertTriangle, FileStack, ArrowRight } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { getStageById, getOrderedStages } from '../utils/workflow';
import { RiskPill, StatusPill } from '../components/Pills';

function timeSince(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Dashboard() {
  const { requests, stages } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';

  const orderedStages = getOrderedStages(stages);
  const currentRequests = requests.filter((r) => r.overallStatus !== 'Completed');
  const previousRequests = requests.filter((r) => r.overallStatus === 'Completed');
  const highRiskRequests = requests.filter((r) => r.riskClassification === 'High' || r.riskClassification === 'Critical');
  const visible = status === 'current' ? currentRequests : status === 'previous' ? previousRequests : requests;

  const setTab = (value) => setSearchParams(value === 'all' ? {} : { status: value });

  const tabLabel = status === 'current' ? 'current' : status === 'previous' ? 'previous' : 'any';

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Layers, tone: 'stat-neutral' },
    { label: 'In Progress', value: currentRequests.length, icon: Clock, tone: 'stat-amber' },
    { label: 'Completed', value: previousRequests.length, icon: CheckCircle2, tone: 'stat-green' },
    { label: 'High / Critical Risk', value: highRiskRequests.length, icon: AlertTriangle, tone: 'stat-red' },
  ];

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1>Requests Dashboard</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>All feature / change requests moving through the combined approval + release pipeline.</p>
        </div>
        {requests.length > 0 && (
          <Link to="/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><PlusCircle size={16} /> New Request</Link>
        )}
      </div>

      {requests.length > 0 && (
        <div className="stats-grid">
          {stats.map((s) => (
            <div className={`stat-card ${s.tone}`} key={s.label}>
              <div className="stat-icon"><s.icon size={19} /></div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-ring"><FolderOpen size={30} /></div>
          <h3>No requests yet</h3>
          <p>Kick off your first feature or change request to start the approval pipeline.</p>
          <Link to="/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><PlusCircle size={16} /> Create Your First Request</Link>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button className={`tab ${status === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
              All <span className="tab-count">{requests.length}</span>
            </button>
            <button className={`tab ${status === 'current' ? 'active' : ''}`} onClick={() => setTab('current')}>
              Current <span className="tab-count">{currentRequests.length}</span>
            </button>
            <button className={`tab ${status === 'previous' ? 'active' : ''}`} onClick={() => setTab('previous')}>
              Previous <span className="tab-count">{previousRequests.length}</span>
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon-ring"><Inbox size={28} /></div>
              <h3>No {tabLabel} requests</h3>
              <p>Nothing to show in this view right now.</p>
            </div>
          ) : (
            <div className="req-list">
              {visible.map((r) => {
                const stage = getStageById(stages, r.currentStageId);
                const stageIndex = orderedStages.findIndex((s) => s.id === r.currentStageId);
                const riskKey = (r.riskClassification || 'low').toLowerCase();
                return (
                  <Link to={`/request/${r.id}`} key={r.id} className={`req-row risk-accent-${riskKey}`}>
                    <div className="req-row-main">
                      <div className="req-row-head">
                        <span className="req-id">{r.id}</span>
                        <h3>{r.title}</h3>
                      </div>
                      <p className="desc">{r.description || 'No description provided.'}</p>
                    </div>

                    <div className="req-row-progress">
                      {r.overallStatus !== 'Completed' && orderedStages.length > 0 ? (
                        <>
                          <div className="req-progress-track">
                            <div
                              className="req-progress-fill"
                              style={{ width: `${stageIndex >= 0 ? ((stageIndex + 1) / orderedStages.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="req-progress-label">Step {stageIndex + 1} of {orderedStages.length}</span>
                        </>
                      ) : (
                        <span className="req-progress-label">Pipeline complete</span>
                      )}
                    </div>

                    <div className="req-row-tags">
                      <RiskPill risk={r.riskClassification} />
                      {r.overallStatus !== 'Completed' && stage && <span className="pill pill-stage">{stage.name}</span>}
                      <StatusPill status={r.overallStatus} />
                    </div>

                    <div className="req-row-meta">
                      <span className="req-footer-item"><FileStack size={13} /> {r.documents?.length || 0}</span>
                      <span className="req-footer-item">{r.requester || 'Unknown'}</span>
                      <span className="req-footer-item">{timeSince(r.createdAt)}</span>
                    </div>

                    <span className="req-row-arrow"><ArrowRight size={16} /></span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
