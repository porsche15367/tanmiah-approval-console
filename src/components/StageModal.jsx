import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Pencil, Plus, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

function ChipToggle({ options, valueKey, labelKey, selected, onToggle }) {
  return (
    <div className="tag-input">
      {options.map((opt) => {
        const key = opt[valueKey];
        const active = selected.includes(key);
        return (
          <button type="button" key={key} className={`chip-toggle ${active ? 'active' : ''}`} onClick={() => onToggle(key)}>
            {opt[labelKey]}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Modal used both to edit an existing stage node and to create a brand new one.
 * `stage` is null when creating; otherwise pre-fills the form for editing.
 */
export default function StageModal({ open, onOpenChange, stage, roles, docTypes, otherStages, onSave, onDisable }) {
  const isEdit = !!stage;
  const { t } = useLocale();
  const [form, setForm] = useState({ name: '', approverRoles: [], requiredDocsToEnter: [], sendBackTargets: [], slaHours: 24 });

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name,
        approverRoles: stage.approverRoles,
        requiredDocsToEnter: stage.requiredDocsToEnter,
        sendBackTargets: stage.sendBackTargets,
        slaHours: stage.slaHours,
      });
    } else {
      setForm({ name: '', approverRoles: [], requiredDocsToEnter: [], sendBackTargets: [], slaHours: 24 });
    }
  }, [stage, open]);

  const toggleIn = (field) => (value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  };

  const save = () => {
    if (!form.name.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rx-overlay" />
        <Dialog.Content className="rx-modal rx-modal-wide">
          <Dialog.Title className="rx-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isEdit ? <><Pencil size={17} /> {t('editStage', { stage: stage.name })}</> : <><Plus size={17} /> {t('addNewStage')}</>}
          </Dialog.Title>
          <Dialog.Description className="rx-modal-desc">
            {isEdit
              ? 'Update this stage\'s approvers, required documents, and SLA. Rewire its position by dragging connections on the diagram.'
              : 'This creates an unconnected node on the diagram. Drag a connection from/to it to wire it into the pipeline.'}
          </Dialog.Description>

          <div className="form-row">
            <label>{t('stageName')}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Privacy Review" autoFocus />
          </div>

          <div className="form-row">
            <label>{t('approverRoles')}</label>
            <ChipToggle options={roles} valueKey="id" labelKey="name" selected={form.approverRoles} onToggle={toggleIn('approverRoles')} />
          </div>

          <div className="form-row">
            <label>{t('requiredDocuments')}</label>
            <ChipToggle options={docTypes.map((d) => ({ id: d, name: d }))} valueKey="id" labelKey="name" selected={form.requiredDocsToEnter} onToggle={toggleIn('requiredDocsToEnter')} />
          </div>

          <div className="form-row">
            <label>{t('canSendBackTo')}</label>
            <ChipToggle options={otherStages} valueKey="id" labelKey="name" selected={form.sendBackTargets} onToggle={toggleIn('sendBackTargets')} />
          </div>

          <div className="form-row" style={{ maxWidth: 160 }}>
            <label>{t('slaHours')}</label>
            <input type="number" value={form.slaHours} onChange={(e) => setForm({ ...form, slaHours: Number(e.target.value) })} />
          </div>

          <div className="rx-modal-actions" style={{ justifyContent: isEdit ? 'space-between' : 'flex-end' }}>
            {isEdit && <button className="btn btn-danger" onClick={() => { onDisable(); onOpenChange(false); }}>{t('disableStage')}</button>}
            <div style={{ display: 'flex', gap: 10 }}>
              <Dialog.Close asChild>
                <button className="btn btn-outline">{t('cancel')}</button>
              </Dialog.Close>
              <button className="btn btn-primary" onClick={save}>{isEdit ? t('saveChanges') : t('addStage')}</button>
            </div>
          </div>

          <Dialog.Close asChild>
            <button className="rx-modal-close" aria-label="Close"><X size={16} /></button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
