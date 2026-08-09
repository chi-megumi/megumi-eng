import { useFlashcardStore } from '../stores/useFlashcardStore';
import { vocabData } from '../data/vocabData';

export function ProgressBar() {
  const masteredSet = useFlashcardStore((s) => s.masteredSet);
  const total = vocabData.length;
  const mastered = masteredSet.length;
  const percent = Math.round((mastered / total) * 100);

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span>Tiến độ học tập</span>
        <span id="progress-text" style={{ color: 'var(--primary)' }}>
          {mastered} / {total} Đã thuộc ({percent}%)
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          id="progress-fill"
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
