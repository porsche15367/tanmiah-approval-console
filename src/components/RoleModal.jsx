import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Users, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

export default function RoleModal({ open, onOpenChange, onSave }) {
  const [name, setName] = useState('');
  const { t } = useLocale();

  const save = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rx-overlay" />
        <Dialog.Content className="rx-modal">
          <Dialog.Title className="rx-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> {t('addNewRole')}</Dialog.Title>
          <Dialog.Description className="rx-modal-desc">Create a new team/role that can then be assigned as an approver on any stage.</Dialog.Description>

          <div className="form-row">
            <label>{t('roleName')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Privacy Officer" autoFocus />
          </div>

          <div className="rx-modal-actions">
            <Dialog.Close asChild><button className="btn btn-outline">{t('cancel')}</button></Dialog.Close>
            <button className="btn btn-primary" onClick={save}>{t('addRole')}</button>
          </div>

          <Dialog.Close asChild>
            <button className="rx-modal-close" aria-label="Close"><X size={16} /></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
