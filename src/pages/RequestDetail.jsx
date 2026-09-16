import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Paperclip, MessageSquare, Undo2, GitBranch } from 'lucide-react';
import { useAppDispatch, useAppState, useCurrentUser } from '../context/AppContext';
import { getMissingDocs, getStageById, getNextStage, roleCanActOnStage, stageRoleNames, getOrderedStages } from '../utils/workflow';
import Stepper from '../components/Stepper';
import { RiskPill, StatusPill } from '../components/Pills';
import Select from '../components/Select';
import SendBackModal from '../components/SendBackModal';
import DevPackageCard from '../components/DevPackageCard';
import { DOC_TYPES } from '../data/seed';

export default function RequestDetail() {
  const { id } = useParams();
  const { requests, stages, roles } = useAppState();
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();

  const request = requests.find((r) => r.id === id);

  const [comment, setComment] = useState('');
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [targetVersion, setTargetVersion] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [docName, setDocName] = useState('');
  const [threadComment, setThreadComment] = useState('');
  const [error, setError] = useState('');

  if (!request) {
    return (
      <main className="container">
        <div className="empty-state">Request not found. <Link to="/">Back to dashboard</Link></div>
      </main>
    );
  }

  const currentStage = getStageById(stages, request.currentStageId);
  const nextStage = getNextStage(stages, request.currentStageId);
  const isCompleted = request.overallStatus === 'Completed';
  const canAct = roleCanActOnStage(currentStage, currentUser.roleId);
  const missingDocs = isCompleted ? [] : getMissingDocs(nextStage, request);
  const sendBackOptions = (currentStage?.sendBackTargets || []).map((sid) => getStageById(stages, sid)).filter(Boolean);

  // Development package is editable only while the request sits on the Development
  // stage. Once it has moved on (or completed), the attached package is locked read-only.
  const orderedStages = getOrderedStages(stages);
  const devStageIndex = orderedStages.findIndex((s) => s.id === 'stg-development');
  const currentStageIndex = orderedStages.findIndex((s) => s.id === currentStage?.id);
  const reachedDevelopment = devStageIndex !== -1 && (currentStage?.id === 'stg-development' || (currentStageIndex > devStageIndex) || isCompleted);
  const devPackageLocked = devStageIndex !== -1 && currentStage?.id !== 'stg-development';

  // Keep the "Document Type" picker defaulted to whatever is still missing for the
  // next stage, so attaching a file without touching the dropdown can't silently
  // get tagged as a type you already have (e.g. always "BRD").
  useEffect(() => {
    if (missingDocs.length > 0) setDocType(missingDocs[0]);
  }, [request?.id, missingDocs.join(',')]);

  const handleApprove = () => {
    setError('');
    if (!comment.trim()) return setError('A comment is mandatory to move this request forward.');
    if (!canAct) return setError(`Only ${stageRoleNames(currentStage, roles).join(' / ')} can approve this stage.`);
    if (missingDocs.length > 0) return setError(`Cannot move to "${nextStage.name}" — missing required document(s): ${missingDocs.join(', ')}.`);

    dispatch({
      type: 'TRANSITION',
      requestId: request.id,
      direction: 'forward',
      toStageId: nextStage ? nextStage.id : null,
      actor: currentUser.name,
      role: currentUser.roleId,
      comment,
      targetVersion,
    });
    setComment('');
  };

  const handleSendBack = (targetStageId, sendBackComment) => {
    dispatch({
      type: 'TRANSITION',
      requestId: request.id,
      direction: 'backward',
      toStageId: targetStageId,
      actor: currentUser.name,
      role: currentUser.roleId,
      comment: sendBackComment,
    });
  };

  const handleAddDoc = () => {
    if (!docName.trim()) return;
    dispatch({ type: 'ADD_DOCUMENT', requestId: request.id, docType, name: docName, uploadedBy: currentUser.name });
    setDocName('');
  };

  const handleAddThreadComment = () => {
    if (!threadComment.trim()) return;
    dispatch({ type: 'ADD_COMMENT', requestId: request.id, stageId: request.currentStageId, author: currentUser.name, text: threadComment });
    setThreadComment('');
  };

  const feed = [
    ...request.transitions.map((t) => ({ ...t, kind: 'transition' })),
    ...request.comments.map((c) => ({ ...c, kind: 'comment' })),
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <main className="container">
      <div style={{ marginBottom: 18 }}>
        <Link to="/" style={{ color: 'var(--gray-500)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft className="directional-icon" size={14} /> Back to dashboard</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="req-id">{request.id}</div>
          <h1>{request.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <RiskPill risk={request.riskClassification} />
          <StatusPill status={request.overallStatus} />
        </div>
      </div>
      <p className="subtitle">{request.description}</p>

      {request.linkedBacklogItems?.length > 0 && (
        <div className="req-backlog-chips">
          <GitBranch size={13} />
          {request.linkedBacklogItems.map((item) => (
            <span key={item} className="tag" style={{ cursor: 'default' }}>{item}</span>
          ))}
        </div>
      )}

      <div className="section card">
        <h2>Pipeline Progress</h2>
        <Stepper stages={stages} currentStageId={request.currentStageId} isCompleted={isCompleted} />
      </div>

      <div className="two-col">
        <div>
          {!isCompleted && (
            <div className="section card">
              <h2>Take Action — Current Stage: {currentStage?.name}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: -8, marginBottom: 16 }}>
                Approver role required: <b style={{ color: 'var(--gray-900)' }}>{stageRoleNames(currentStage, roles).join(', ')}</b>
                {!canAct && <span style={{ color: 'var(--red-600)' }}> — you're signed in as {currentUser.name}, so actions below are disabled.</span>}
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              {nextStage && missingDocs.length > 0 && (
                <div className="alert alert-info">
                  Moving to <b>{nextStage.name}</b> requires: {nextStage.requiredDocsToEnter.map((d) => (
                    <span key={d} className={`pill ${request.documents.some((doc) => doc.type === d) ? 'pill-ok' : 'pill-req'}`} style={{ marginLeft: 6 }}>{d}</span>
                  ))}
                </div>
              )}

              {!nextStage && (
                <div className="form-row">
                  <label>Target Version / Build (optional)</label>
                  <input value={targetVersion} onChange={(e) => setTargetVersion(e.target.value)} placeholder="e.g. v2.4.0" />
                </div>
              )}

              <div className="form-row">
                <label>Comment (mandatory to approve)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Why are you approving this?" disabled={!canAct} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleApprove} disabled={!canAct}>
                  {nextStage ? `Approve → Move to ${nextStage.name}` : 'Approve & Complete'}
                </button>

                {sendBackOptions.length > 0 && (
                  <button className="btn btn-danger" onClick={() => setSendBackOpen(true)} disabled={!canAct} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Undo2 size={15} /> Send Back...</button>
                )}
              </div>
            </div>
          )}

          <SendBackModal
            open={sendBackOpen}
            onOpenChange={setSendBackOpen}
            options={sendBackOptions}
            onConfirm={handleSendBack}
          />

          {reachedDevelopment && (
            <DevPackageCard request={request} currentUser={currentUser} locked={devPackageLocked} />
          )}

          <div className="section card">
            <h2>Documents</h2>
            {!isCompleted && nextStage && missingDocs.length > 0 && (
              <div className="alert alert-info">
                Still needed to move to <b>{nextStage.name}</b>: {missingDocs.map((d) => (
                  <span key={d} className="pill pill-req" style={{ marginLeft: 6 }}>{d}</span>
                ))} — attach each as its own document with the matching type below.
              </div>
            )}
            {request.documents.length === 0 ? (
              <p style={{ color: 'var(--gray-500)' }}>No documents attached yet.</p>
            ) : (
              <ul className="doc-list">
                {request.documents.map((d) => (
                  <li key={d.id}>
                    <div>
                      <div className="doc-name" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Paperclip size={14} /> {d.name} <span className="pill pill-stage" style={{ marginLeft: 6 }}>{d.type}</span></div>
                      <div className="doc-meta">Uploaded by {d.uploadedBy} · {new Date(d.uploadedAt).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!isCompleted && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-row" style={{ marginBottom: 0, minWidth: 200 }}>
                  <label>Document Type</label>
                  <Select value={docType} onValueChange={setDocType} options={DOC_TYPES.map((t) => ({ value: t, label: t }))} />
                </div>
                <div className="form-row" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                  <label>File Name (simulated)</label>
                  <input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. SecurityScan_Report.pdf" />
                </div>
                <button className="btn btn-outline" onClick={handleAddDoc} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Paperclip size={14} /> Attach</button>
              </div>
            )}
          </div>

          <div className="section card">
            <h2>Discussion</h2>
            {!isCompleted && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input value={threadComment} onChange={(e) => setThreadComment(e.target.value)} placeholder="Add a comment (doesn't move the stage)" style={{ flex: 1, background: '#fff', color: 'var(--gray-900)', border: '1px solid var(--gray-300)', borderRadius: 8, padding: '9px 12px' }} />
                <button className="btn btn-outline" onClick={handleAddThreadComment}>Post</button>
              </div>
            )}
            {request.comments.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No discussion comments yet.</p>}
            {request.comments.map((c) => (
              <div key={c.id} style={{ marginBottom: 10, fontSize: '0.85rem' }}>
                <b>{c.author}</b> <span style={{ color: 'var(--gray-500)' }}>· {new Date(c.timestamp).toLocaleString()}</span>
                <div style={{ color: 'var(--gray-700)' }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Audit Trail</h2>
          <ul className="timeline">
            {feed.map((item) => (
              <li key={item.id}>
                {item.kind === 'transition' ? (
                  <>
                    <div className="t-head">
                      <span className="t-action">{item.action}</span>
                      {item.toStage && <span className="pill pill-stage">{getStageById(stages, item.toStage)?.name}</span>}
                    </div>
                    <div className="t-meta">{item.actor} ({roles.find((r) => r.id === item.role)?.name || item.role}) · {new Date(item.timestamp).toLocaleString()}</div>
                    <div className="t-comment">"{item.comment}"</div>
                  </>
                ) : (
                  <>
                    <div className="t-head"><span className="t-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageSquare size={13} /> Comment</span></div>
                    <div className="t-meta">{item.author} · {new Date(item.timestamp).toLocaleString()}</div>
                    <div className="t-comment">"{item.text}"</div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
