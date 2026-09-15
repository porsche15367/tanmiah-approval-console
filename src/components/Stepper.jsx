import { Check } from 'lucide-react';
import { getOrderedStages } from '../utils/workflow';

/** Visual pipeline stepper showing all active stages and where a request currently sits. */
export default function Stepper({ stages, currentStageId, isCompleted }) {
  const ordered = getOrderedStages(stages);
  const currentIndex = ordered.findIndex((s) => s.id === currentStageId);

  return (
    <div className="stepper">
      {ordered.map((stage, idx) => {
        const isDone = isCompleted || idx < currentIndex;
        const isCurrent = !isCompleted && idx === currentIndex;
        return (
          <div key={stage.id} className={`step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="connector" />
            <div className="dot">{isDone ? <Check size={15} /> : idx + 1}</div>
            <div className="label">{stage.name}</div>
          </div>
        );
      })}
    </div>
  );
}
