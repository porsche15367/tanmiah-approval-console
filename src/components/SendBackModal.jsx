import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Undo2, X } from 'lucide-react';
import Select from './Select';
import { useLocale } from '../context/LocaleContext';

/**
 * Popup used to send a request back to an earlier stage. Requires both a
 * target stage and a mandatory comment before it can be confirmed.
 */
export default function SendBackModal({ open, onOpenChange, options, onConfirm }) {
  const { t } = useLocale();
  const [target, setTarget] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setTarget('');
    setComment('');
    setError('');
  };

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const confirm = () => {
    if (!target) return setError('Choose which stage to send this request back to.');
    if (!comment.trim()) return setError('A comment is mandatory when sending a request back.');
    onConfirm(target, comment);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rx-overlay" />
        <Dialog.Content className="rx-modal">
          <Dialog.Title className="rx-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Undo2 size={18} /> Send Request Back</Dialog.Title>
          <Dialog.Description className="rx-modal-desc">
            {t('sendBackDescription')}
          </Dialog.Description>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <label>{t('sendBackTo')}</label>
            <Select value={target} onValueChange={setTarget} options={options.map((s) => ({ value: s.id, label: s.name }))} placeholder={t('chooseStage')} />
          </div>

          <div className="form-row">
            <label>{t('mandatoryComment')}</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Why is this being sent back?" autoFocus />
          </div>

          <div className="rx-modal-actions">
            <Dialog.Close asChild>
              <button className="btn btn-outline">{t('cancel')}</button>
            </Dialog.Close>
            <button className="btn btn-danger" onClick={confirm}>{t('sendBack')}</button>
          </div>

          <Dialog.Close asChild>
            <button className="rx-modal-close" aria-label="Close"><X size={16} /></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
