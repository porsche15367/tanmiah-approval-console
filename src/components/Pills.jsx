export function RiskPill({ risk }) {
  const cls = `pill pill-risk-${(risk || 'low').toLowerCase()}`;
  return <span className={cls}>{risk === 'Unclassified' ? 'Unclassified' : `${risk} Risk`}</span>;
}

export function StatusPill({ status }) {
  let cls = 'pill pill-status-progress';
  if (status === 'Completed') cls = 'pill pill-status-completed';
  else if (status && status.includes('Sent Back')) cls = 'pill pill-status-sentback';
  return <span className={cls}>{status}</span>;
}

export function StagePill({ name }) {
  return <span className="pill pill-stage">{name}</span>;
}
