import { useEffect } from 'react'
import { vocabData } from '~/modules/public/flashcards/data/vocabData'
import type { QuizHistoryEntry } from '~/modules/public/flashcards/stores/useQuizStore'
import { formatDate, formatDuration } from '~/modules/public/flashcards/utils/score'
import { scoreColor } from '~/modules/public/flashcards/utils/score'

function HistoryDetailModal({ entry, onClose }: { entry: QuizHistoryEntry; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const correctAnswers = entry.answers.filter((a) => a.correct)
  const wrongAnswers = entry.answers.filter((a) => !a.correct)

  return (
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quiz-modal-header">
          <div>
            <div className="quiz-modal-title">📋 Chi tiết kết quả</div>
            <div className="quiz-modal-meta">
              {formatDate(entry.date)} · ⏱ {formatDuration(entry.durationMs)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="quiz-modal-score" style={{ color: scoreColor(entry.score) }}>
              {entry.score}
              <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
            </div>
            <button className="quiz-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="quiz-modal-body">
          {/* Correct section */}
          {correctAnswers.length > 0 && (
            <div className="quiz-modal-section">
              <div className="quiz-modal-section-title quiz-modal-section-correct">
                ✅ Đúng — {correctAnswers.length} câu
              </div>
              <div className="quiz-modal-grid">
                {correctAnswers.map((a, i) => {
                  const word = vocabData[a.wordIndex]
                  return (
                    <div key={i} className="quiz-modal-card quiz-modal-card--correct">
                      <div className="quiz-modal-card-emoji">{word.emoji}</div>
                      <div className="quiz-modal-card-word">{word.word}</div>
                      <div className="quiz-modal-card-ipa">{word.ipa}</div>
                      <div className="quiz-modal-card-vi">{word.vi}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Wrong section */}
          {wrongAnswers.length > 0 && (
            <div className="quiz-modal-section">
              <div className="quiz-modal-section-title quiz-modal-section-wrong">
                ❌ Sai — {wrongAnswers.length} câu
              </div>
              <div className="quiz-modal-grid">
                {wrongAnswers.map((a, i) => {
                  const word = vocabData[a.wordIndex]
                  const chosen = vocabData[a.selectedWordIndex]
                  return (
                    <div key={i} className="quiz-modal-card quiz-modal-card--wrong">
                      <div className="quiz-modal-card-emoji">{word.emoji}</div>
                      <div className="quiz-modal-card-word">{word.word}</div>
                      <div className="quiz-modal-card-ipa">{word.ipa}</div>
                      <div className="quiz-modal-card-vi">{word.vi}</div>
                      {chosen && (
                        <div className="quiz-modal-card-chosen">
                          Bạn chọn: <em>{chosen.vi}</em>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryDetailModal
