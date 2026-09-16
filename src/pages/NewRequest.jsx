import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Paperclip, Send, Info, GitBranch, Link2, ListChecks } from 'lucide-react';
import { useAppDispatch, useAppState, useCurrentUser } from '../context/AppContext';
import { useLocale } from '../context/LocaleContext';
import { getOrderedStages, stageRoleNames } from '../utils/workflow';
import { BACKLOG_ITEMS } from '../data/seed';
import MultiSelect from '../components/MultiSelect';

export default function NewRequest() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { stages, roles } = useAppState();
  const { t } = useLocale();
  const [form, setForm] = useState({
    title: '',
    description: '',
    brdName: '',
  });
  const [error, setError] = useState('');

  // Simulated DevOps backlog integration — look and feel only.
  const [backlogConnected, setBacklogConnected] = useState(false);
  const [backlogConnecting, setBacklogConnecting] = useState(false);
  const [backlogItemIds, setBacklogItemIds] = useState([]);

  const connectBacklog = () => {
    setBacklogConnecting(true);
    setTimeout(() => {
      setBacklogConnecting(false);
      setBacklogConnected(true);
    }, 700);
  };

  const orderedStages = getOrderedStages(stages);
  const firstStage = orderedStages[0];

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Please give this request a clear title.');
    const linkedBacklogItems = BACKLOG_ITEMS.filter((b) => backlogItemIds.includes(b.id)).map((b) => `${b.id} — ${b.title}`);
    dispatch({ type: 'CREATE_REQUEST', ...form, requesterId: currentUser.id, linkedBacklogItems });
    navigate('/');
  };

  return (
    <main className="container">
      <div style={{ marginBottom: 18 }}>
        <Link to="/" style={{ color: 'var(--gray-500)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft className="directional-icon" size={14} /> {t('backToDashboard')}</Link>
      </div>

      <h1>{t('newFeatureRequest')}</h1>
      <p className="subtitle">{t('requestIntro', { stage: firstStage ? firstStage.name : 'المرحلة الأولى' })}</p>

      <div className="nr-layout">
        <form className="card nr-form" onSubmit={submit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="nr-section-title"><FileText size={15} /> {t('basicInformation')}</div>
          <div className="form-row">
            <label>{t('title')}</label>
            <input value={form.title} onChange={update('title')} placeholder="e.g. Add SMS notifications for grievance updates" required />
          </div>
          <div className="form-row">
            <label>{t('description')}</label>
            <textarea value={form.description} onChange={update('description')} placeholder="Short description of the feature/change" />
          </div>
          <div className="form-row">
            <label>{t('requester')}</label>
            <input value={currentUser?.name || ''} disabled />
          </div>

          <div className="nr-divider" />

          <div className="nr-section-title"><GitBranch size={15} /> {t('linkedBacklog')}</div>
          {!backlogConnected ? (
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>{t('backlogHelp')}</label>
              <button type="button" className="btn btn-outline" onClick={connectBacklog} disabled={backlogConnecting} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Link2 size={14} /> {backlogConnecting ? t('connectingBacklog') : t('connectBacklog')}
              </button>
            </div>
          ) : (
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ListChecks size={14} /> Backlog Features</label>
              <MultiSelect
                value={backlogItemIds}
                onChange={setBacklogItemIds}
                placeholder="Choose one or more backlog features..."
                options={BACKLOG_ITEMS.map((b) => ({ value: b.id, label: `${b.id} — ${b.title}`, sublabel: `${b.epic} · ${b.type}` }))}
              />
            </div>
          )}

          <div className="nr-divider" />

          <div className="nr-section-title"><Paperclip size={15} /> {t('supportingDocument')}</div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>BRD Document (file name, simulated upload)</label>
            <input value={form.brdName} onChange={update('brdName')} placeholder="e.g. BRD_SMS_Notifications_v1.pdf" />
          </div>

          <div className="nr-actions">
            <Link to="/" className="btn btn-outline">{t('cancel')}</Link>
            <button className="btn btn-primary" type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Send size={15} /> {t('submitRequest')}</button>
          </div>
        </form>

        <aside className="nr-side">
          <div className="card nr-side-card">
            <div className="nr-side-title">{t('whatHappensNext')}</div>
            <ul className="nr-timeline-preview">
              {orderedStages.slice(0, 5).map((s, idx) => (
                <li key={s.id} className={idx === 0 ? 'nr-tp-first' : ''}>
                  <span className="nr-tp-dot">{idx + 1}</span>
                  <div>
                    <div className="nr-tp-name">{s.name}</div>
                    <div className="nr-tp-role">{stageRoleNames(s, roles).join(', ') || 'No approver set'}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card nr-side-card">
            <div className="nr-side-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Info size={14} /> {t('goodToKnow')}</div>
            <p className="nr-hint">A comment is required at every approval step. The Development team will set the risk classification once the request reaches Development, and moving into some stages (e.g. Cyber Security, CAB) requires specific documents such as a CR or Test Report.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
