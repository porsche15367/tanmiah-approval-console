import { useLocale } from '../context/LocaleContext';

export function RiskPill({ risk }) {
  const { t } = useLocale();
  const cls = `pill pill-risk-${(risk || 'low').toLowerCase()}`;
  const labels = { Low: 'منخفضة', Medium: 'متوسطة', High: 'مرتفعة', Critical: 'حرجة', Unclassified: 'غير مصنفة' };
  return <span className={cls}>{labels[risk] || risk} {risk === 'Unclassified' ? '' : t('risk')}</span>;
}

export function StatusPill({ status }) {
  const { t } = useLocale();
  let cls = 'pill pill-status-progress';
  if (status === 'Completed') cls = 'pill pill-status-completed';
  else if (status && status.includes('Sent Back')) cls = 'pill pill-status-sentback';
  const labels = { 'In Progress': t('inProgress'), Completed: t('completed'), 'Sent Back': 'معاد' };
  return <span className={cls}>{labels[status] || status}</span>;
}

export function StagePill({ name }) {
  return <span className="pill pill-stage">{name}</span>;
}
