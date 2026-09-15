import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Generic confirmation popup used for destructive actions (delete stage,
 * delete role, etc.) so we avoid native window.confirm dialogs.
 */
export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Delete', onConfirm, blocked = false, blockedTitle, blockedDescription }) {
  const confirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rx-overlay" />
        <Dialog.Content className="rx-modal rx-modal-sm">
          <Dialog.Title className="rx-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red-600)' }}>
            <AlertTriangle size={18} /> {blocked ? (blockedTitle || 'Cannot delete') : title}
          </Dialog.Title>
          {(blocked ? blockedDescription : description) && (
            <Dialog.Description className="rx-modal-desc">{blocked ? blockedDescription : description}</Dialog.Description>
          )}

          <div className="rx-modal-actions">
            <Dialog.Close asChild>
              <button className="btn btn-outline">{blocked ? 'Close' : 'Cancel'}</button>
            </Dialog.Close>
            {!blocked && <button className="btn btn-danger" onClick={confirm}>{confirmLabel}</button>}
          </div>

          <Dialog.Close asChild>
            <button className="rx-modal-close" aria-label="Close"><X size={16} /></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
