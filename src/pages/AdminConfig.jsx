import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppState } from '../context/AppContext';
import { DOC_TYPES } from '../data/seed';
import StageNode from '../components/StageNode';
import StageModal from '../components/StageModal';
import RoleModal from '../components/RoleModal';
import ConfirmDialog from '../components/ConfirmDialog';

const nodeTypes = { stageNode: StageNode };

export default function AdminConfig() {
  const { stages, roles } = useAppState();
  const dispatch = useAppDispatch();

  const activeStages = useMemo(() => stages.filter((s) => s.isActive), [stages]);
  const disabledStages = useMemo(() => stages.filter((s) => !s.isActive), [stages]);

  // Stages (active or disabled) that reference each role, keyed by role id — used to
  // block deletion of a role that's still assigned somewhere in the pipeline.
  const stagesUsingRole = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r.id] = stages.filter((s) => (s.approverRoles || []).includes(r.id));
    });
    return map;
  }, [stages, roles]);

  const [editingStageId, setEditingStageId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState(null);
  const [deleteRoleId, setDeleteRoleId] = useState(null);

  const roleName = (id) => roles.find((r) => r.id === id)?.name || id;

  const nodes = useMemo(
    () =>
      activeStages.map((stage) => ({
        id: stage.id,
        type: 'stageNode',
        position: { x: stage.posX ?? 40, y: stage.posY ?? 120 },
        data: { stage, roleNames: stage.approverRoles.map(roleName) },
      })),
    [activeStages, roles]
  );

  const edges = useMemo(
    () =>
      activeStages
        .filter((s) => s.nextId && activeStages.some((t) => t.id === s.nextId))
        .map((s) => ({
          id: `e-${s.id}-${s.nextId}`,
          source: s.id,
          target: s.nextId,
          type: 'smoothstep',
          animated: false,
          deletable: true,
          style: { stroke: 'var(--green-500)', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--green-500)' },
        })),
    [activeStages]
  );

  const [localNodes, setLocalNodes] = useState(nodes);
  useEffect(() => setLocalNodes(nodes), [nodes]);

  const onNodesChange = useCallback((changes) => setLocalNodes((nds) => applyNodeChanges(changes, nds)), []);

  const onNodeDragStop = useCallback(
    (_evt, node) => dispatch({ type: 'UPDATE_STAGE', stageId: node.id, patch: { posX: node.position.x, posY: node.position.y } }),
    [dispatch]
  );

  const onConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      dispatch({ type: 'CONNECT_STAGES', sourceId: connection.source, targetId: connection.target });
    },
    [dispatch]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      deleted.forEach((e) => dispatch({ type: 'DISCONNECT_STAGES', sourceId: e.source, targetId: e.target }));
    },
    [dispatch]
  );

  const onNodeClick = useCallback((_evt, node) => setEditingStageId(node.id), []);

  const editingStage = stages.find((s) => s.id === editingStageId) || null;

  const saveStage = (form) => {
    if (editingStage) {
      dispatch({ type: 'UPDATE_STAGE', stageId: editingStage.id, patch: form });
    }
  };

  const reEnable = (stageId) => {
    dispatch({ type: 'UPDATE_STAGE', stageId, patch: { isActive: true, previousId: null, nextId: null, posX: 60, posY: 460 } });
  };

  const deletingStage = stages.find((s) => s.id === deleteStageId) || null;
  const deletingRole = roles.find((r) => r.id === deleteRoleId) || null;
  const deletingRoleUsage = deleteRoleId ? (stagesUsingRole[deleteRoleId] || []) : [];
  const deletingRoleBlocked = deletingRoleUsage.length > 0;

  return (
    <main className="container admin-container">
      <div className="page-head">
        <div>
          <h1>Admin — Pipeline Diagram</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Drag a connection between two stages to reorder the pipeline. Click a stage to edit it. Drag nodes to rearrange the canvas.
          </p>
        </div>
      </div>

      <div className="admin-canvas-row">
        <div className="card flow-canvas-card">
          <div className="section-toolbar">
            <h2 style={{ margin: 0 }}>Pipeline Canvas</h2>
            <button className="btn btn-primary" onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={15} /> Add Stage</button>
          </div>
          <ReactFlow
            nodes={localNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} color="#d7e8de" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {disabledStages.length > 0 && (
          <div className="card disabled-stages-card">
            <h2>Disabled Stages</h2>
            <div className="tag-input tag-input-vertical">
              {disabledStages.map((s) => (
                <span key={s.id} className="tag" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', borderColor: 'var(--gray-300)' }}>
                  {s.name}
                  <span className="tag-actions">
                    <button onClick={() => reEnable(s.id)} title="Re-enable"><RotateCcw size={13} /></button>
                    <button onClick={() => setDeleteStageId(s.id)} title="Delete permanently" className="tag-action-danger"><Trash2 size={13} /></button>
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section card" style={{ marginTop: 24 }}>
        <div className="section-toolbar">
          <h2 style={{ margin: 0 }}>Roles</h2>
          <button className="btn btn-outline" onClick={() => setRoleModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={15} /> Add Role</button>
        </div>
        <div className="tag-input">
          {roles.map((r) => (
            <span key={r.id} className="tag">
              {r.name}
              <button onClick={() => setDeleteRoleId(r.id)} title="Delete role" className="tag-action-danger"><Trash2 size={13} /></button>
            </span>
          ))}
        </div>
      </div>

      <StageModal
        open={!!editingStageId}
        onOpenChange={(v) => !v && setEditingStageId(null)}
        stage={editingStage}
        roles={roles}
        docTypes={DOC_TYPES}
        otherStages={activeStages.filter((s) => s.id !== editingStageId)}
        onSave={saveStage}
        onDisable={() => editingStage && dispatch({ type: 'DELETE_STAGE', stageId: editingStage.id })}
      />

      <StageModal
        open={addOpen}
        onOpenChange={setAddOpen}
        stage={null}
        roles={roles}
        docTypes={DOC_TYPES}
        otherStages={activeStages}
        onSave={(form) => {
          const offset = (activeStages.length * 60) % 420;
          dispatch({
            type: 'ADD_STAGE_NODE',
            name: form.name,
            posX: 60 + offset,
            posY: 340,
            approverRoles: form.approverRoles,
            requiredDocsToEnter: form.requiredDocsToEnter,
            sendBackTargets: form.sendBackTargets,
            slaHours: form.slaHours,
          });
        }}
        onDisable={() => {}}
      />

      <RoleModal open={roleModalOpen} onOpenChange={setRoleModalOpen} onSave={(name) => dispatch({ type: 'ADD_ROLE', name })} />

      <ConfirmDialog
        open={!!deleteStageId}
        onOpenChange={(v) => !v && setDeleteStageId(null)}
        title="Delete stage permanently?"
        description={deletingStage ? `"${deletingStage.name}" will be removed for good. This cannot be undone.` : ''}
        confirmLabel="Delete Stage"
        onConfirm={() => deleteStageId && dispatch({ type: 'PURGE_STAGE', stageId: deleteStageId })}
      />

      <ConfirmDialog
        open={!!deleteRoleId}
        onOpenChange={(v) => !v && setDeleteRoleId(null)}
        title="Delete role?"
        description={deletingRole ? `"${deletingRole.name}" will be removed from all stages that use it as an approver.` : ''}
        confirmLabel="Delete Role"
        onConfirm={() => deleteRoleId && dispatch({ type: 'DELETE_ROLE', roleId: deleteRoleId })}
        blocked={deletingRoleBlocked}
        blockedTitle="Role is still in use"
        blockedDescription={
          deletingRole
            ? `"${deletingRole.name}" is assigned as an approver on: ${deletingRoleUsage.map((s) => s.name).join(', ')}. Remove it from ${deletingRoleUsage.length > 1 ? 'those stages' : 'that stage'} first.`
            : ''
        }
      />
    </main>
  );
}
