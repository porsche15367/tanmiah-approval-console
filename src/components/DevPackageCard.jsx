import { useState } from 'react';
import { GitPullRequest, GitBranch, UploadCloud, CheckCircle2, Link2, Package, FileCheck2, Lock, ShieldAlert } from 'lucide-react';
import { useAppDispatch } from '../context/AppContext';
import { DEVOPS_PRS } from '../data/seed';
import MultiSelect from './MultiSelect';
import Select from './Select';
import { RiskPill } from './Pills';

const RISK_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

/**
 * Development-stage-only card for attaching the build artifact that goes with a request —
 * either by "connecting" to a DevOps PR (simulated, no real integration) or by uploading a
 * deployment package file (simulated upload, same as other document attachments) — plus the
 * risk classification, which only the Development team sets (not the original requester).
 */
export default function DevPackageCard({ request, currentUser, locked = false }) {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('devops');

  // DevOps / PR tab state
  const [prIds, setPrIds] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Upload tab state
  const [pkgName, setPkgName] = useState('');

  const existingPackage = [...request.documents].reverse().find((d) => d.type === 'Dev Package');
  const selectedPrs = DEVOPS_PRS.filter((pr) => prIds.includes(pr.id));

  const handleConnect = () => {
    if (prIds.length === 0) return;
    setConnecting(true);
    // Simulated round-trip to "DevOps" — look and feel only, no real API call.
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 700);
  };

  const attachFromPr = () => {
    const label = selectedPrs.length === 1
      ? `PR #${selectedPrs[0].number} — ${selectedPrs[0].repo}/${selectedPrs[0].branch} → main`
      : `${selectedPrs.length} PRs: ${selectedPrs.map((pr) => `${pr.repo}#${pr.number}`).join(', ')}`;
    dispatch({ type: 'ADD_DOCUMENT', requestId: request.id, docType: 'Dev Package', name: label, uploadedBy: currentUser.name });
    setPrIds([]);
    setConnected(false);
  };

  const attachFromUpload = () => {
    if (!pkgName.trim()) return;
    dispatch({ type: 'ADD_DOCUMENT', requestId: request.id, docType: 'Dev Package', name: pkgName, uploadedBy: currentUser.name });
    setPkgName('');
  };

  const setRisk = (value) => {
    dispatch({ type: 'SET_RISK_CLASSIFICATION', requestId: request.id, riskClassification: value });
  };


  if (locked) {
    return (
      <div className="section card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={17} /> Development Package</h2>
        <div className="pkg-locked">
          <div className="pkg-locked-icon"><Lock size={16} /></div>
          <div>
            <div className="pkg-locked-title">
              {existingPackage ? <>Package locked — <b>{existingPackage.name}</b></> : 'No package was attached during Development'}
            </div>
            <p className="pkg-locked-text">
              The development package can only be attached or changed while the request is on the Development stage.
              It is now read-only.
            </p>
          </div>
        </div>
        <div className="pkg-locked" style={{ marginTop: 10 }}>
          <div className="pkg-locked-icon"><ShieldAlert size={16} /></div>
          <div>
            <div className="pkg-locked-title">Risk classification locked — <RiskPill risk={request.riskClassification} /></div>
            <p className="pkg-locked-text">Set by the Development team; it can no longer be changed after Development.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={17} /> Development Package</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: -8, marginBottom: 16 }}>
        Attach the build for this change — either link the DevOps pull request or upload the deployment package directly.
      </p>

      <div className="form-row" style={{ maxWidth: 280 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={14} /> Risk Classification</label>
        <Select value={request.riskClassification === 'Unclassified' ? undefined : request.riskClassification} onValueChange={setRisk} options={RISK_OPTIONS} placeholder="Set the risk level..." />
      </div>

      {existingPackage && (

        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCheck2 size={16} /> Current package: <b>{existingPackage.name}</b>
        </div>
      )}

      <div className="pkg-tabs">
        <button type="button" className={`pkg-tab ${tab === 'devops' ? 'active' : ''}`} onClick={() => setTab('devops')}>
          <GitPullRequest size={15} /> PR / DevOps Integration
        </button>
        <button type="button" className={`pkg-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
          <UploadCloud size={15} /> Upload Package
        </button>
      </div>

      {tab === 'devops' ? (
        <div className="pkg-panel">
          <div className="form-row" style={{ marginBottom: connected ? 16 : 0 }}>
            <label>Pull Requests (multiple repos & branches)</label>
            <MultiSelect
              value={prIds}
              onChange={(next) => { setPrIds(next); setConnected(false); }}
              placeholder="Select one or more open PRs..."
              options={DEVOPS_PRS.map((pr) => ({ value: pr.id, label: `${pr.repo} — PR #${pr.number}: ${pr.title}`, sublabel: `${pr.branch} → main` }))}
            />
          </div>

          {connected && (
            <div className="pkg-status">
              <div className="pkg-status-head">
                <Link2 size={14} /> Connected to DevOps
              </div>
              <div className="pkg-status-item"><CheckCircle2 size={14} /> Build pipeline passed</div>
              <div className="pkg-status-item"><CheckCircle2 size={14} /> Unit tests passed (98% coverage)</div>
              {selectedPrs.map((pr) => (
                <div className="pkg-status-item" key={pr.id}><GitBranch size={14} /> {pr.repo}: {pr.branch} → main (PR #{pr.number})</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {!connected ? (
              <button type="button" className="btn btn-outline" onClick={handleConnect} disabled={prIds.length === 0 || connecting} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Link2 size={14} /> {connecting ? 'Connecting...' : 'Connect to DevOps'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={attachFromPr} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Package size={14} /> Attach as Development Package
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="pkg-panel">
          <div className="pkg-dropzone">
            <UploadCloud size={22} />
            <div className="pkg-dropzone-text">Drag & drop the deployment package here, or type a file name below</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-row" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
              <label>Package File Name (simulated)</label>
              <input value={pkgName} onChange={(e) => setPkgName(e.target.value)} placeholder="e.g. release_v2.4.0_build482.zip" />
            </div>
            <button type="button" className="btn btn-primary" onClick={attachFromUpload} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <UploadCloud size={14} /> Upload Package
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
