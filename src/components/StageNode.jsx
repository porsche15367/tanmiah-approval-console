import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

/** Custom React Flow node representing one pipeline stage. Click opens the edit modal. */
export default function StageNode({ data }) {
  const { stage, roleNames } = data;

  return (
    <div className="flow-node">
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <div className="flow-node-head">
        <span className="flow-node-name">{stage.name}</span>
        <span className="flow-node-sla">{stage.slaHours}h</span>
      </div>
      <div className="flow-node-roles">
        {roleNames.length > 0 ? (
          roleNames.map((r) => <span key={r} className="flow-role-chip">{r}</span>)
        ) : (
          <span className="flow-role-chip empty">No approver set</span>
        )}
      </div>
      {stage.requiredDocsToEnter.length > 0 && (
        <div className="flow-node-docs" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FileText size={12} /> requires {stage.requiredDocsToEnter.join(', ')}</div>
      )}
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}
