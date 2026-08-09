import { Modal } from '~/components/modal/Modal'
import { vocabData } from '~/modules/public/flashcards/data/vocabData'
import type { QuizHistoryEntry } from '~/modules/public/flashcards/stores/useQuizStore'
import { formatDate, formatDuration, scoreColor } from '~/modules/public/flashcards/utils/score'

interface HistoryDetailModalProps {
  entry: QuizHistoryEntry | null
  onClose: () => void
}

function HistoryDetailModal({ entry, onClose }: HistoryDetailModalProps) {
  const correctAnswers = entry?.answers.filter((a) => a.correct) ?? []
  const wrongAnswers = entry?.answers.filter((a) => !a.correct) ?? []

  // Score badge shown in the modal header right side
  const headerExtra = entry ? (
    <div
      style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: '1.8rem',
        fontWeight: 700,
        color: scoreColor(entry.score),
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: 2,
      }}
    >
      {entry.score}
      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>/10</span>
    </div>
  ) : null

  // Sub-title shown as part of the header title slot
  const title = entry ? (
    <div>
      <div>📋 Chi tiết kết quả</div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
        {formatDate(entry.date)} · ⏱ {formatDuration(entry.durationMs)}
      </div>
    </div>
  ) : null

  return (
    <Modal open={!!entry} onClose={onClose} title={title} headerExtra={headerExtra} size="lg">
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
        <div
          className="quiz-modal-section"
          style={{ marginTop: correctAnswers.length > 0 ? 20 : 0 }}
        >
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
    </Modal>
  )
}

export default HistoryDetailModal
