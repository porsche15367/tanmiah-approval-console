import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DEPLOYMENT_PROJECTS } from '../data/seed';
import { useLocale } from '../context/LocaleContext';

const TIMELINE_START = new Date('2020-01-01T00:00:00Z');
const TIMELINE_END = new Date('2020-03-29T00:00:00Z');

function formatDateShort(dateLike, locale) {
  const date = new Date(dateLike);
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(date);
}

function formatRange(start, end, locale) {
  return `${formatDateShort(start, locale)} - ${formatDateShort(end, locale)}`;
}

function getPercent(dateString) {
  const date = new Date(dateString);
  const total = TIMELINE_END.getTime() - TIMELINE_START.getTime();
  const delta = date.getTime() - TIMELINE_START.getTime();
  return (delta / total) * 100;
}

export default function ProjectTimelinePage() {
  const { projectId } = useParams();
  const { t, locale, dir } = useLocale();

  const projects = DEPLOYMENT_PROJECTS;
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  const dateScale = useMemo(() => {
    const dates = [];
    const current = new Date(TIMELINE_START);
    while (current <= TIMELINE_END) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return dates;
  }, []);

  if (!selectedProject) return null;

  return (
    <main className="container timeline-page-shell">
      <div className="page-head timeline-page-head">
        <div>
          <h1>{t('projects')}</h1>
        </div>
      </div>

      <div className="project-list-panel">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className={`project-list-item ${selectedProject.id === project.id ? 'active' : ''}`}
          >
            <span>{project.name}</span>
          </Link>
        ))}
      </div>

      <div className="timeline-card-modern">
        <div className="timeline-header-modern">
          <div className="timeline-project-name">{selectedProject.name}</div>
        </div>

        <div className="timeline-board">
          <div className="timeline-rows">
            {selectedProject.deployments.map((deployment) => {
              const start = getPercent(deployment.start);
              const end = getPercent(deployment.end);
              const width = Math.max(8, end - start + 1.8);

              return (
                <div className="timeline-row-modern" key={deployment.id}>
                  <div className="timeline-row-label-modern">
                    <span>{deployment.name}</span>
                    <small>{formatRange(deployment.start, deployment.end, locale)}</small>
                  </div>
                  <div className="timeline-track-modern">
                    <div
                      className="timeline-bar-modern"
                      style={{
                        [dir === 'rtl' ? 'right' : 'left']: `${start}%`,
                        width: `${width}%`,
                        background: deployment.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="timeline-scale-modern" aria-label="Timeline scale">
            {dateScale.map((date) => (
              <span key={date.toISOString()}>{formatDateShort(date, locale)}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
