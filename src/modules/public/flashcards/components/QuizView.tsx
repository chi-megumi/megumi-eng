import { useEffect, useState } from 'react'
import { useQuizStore } from '../stores/useQuizStore'
import { vocabData } from '../data/vocabData'
import { useConfetti } from '../hooks/useConfetti'
import { useSpeech } from '../hooks/useSpeech'
import { playSound } from '../utils/sound'
import type { QuizHistoryEntry } from '../stores/useQuizStore'

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m === 0) return `${sec}s`
  return `${m}m ${sec}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function scoreColor(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#f59e0b'
  return '#ef4444'
}

// ─────────────────────────────────────────────────────
// History Detail Modal
// ─────────────────────────────────────────────────────

function HistoryDetailModal({
  entry,
  onClose,
}: {
  entry: QuizHistoryEntry
  onClose: () => void
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
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
              {entry.score}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
            </div>
            <button className="quiz-modal-close" onClick={onClose}>✕</button>
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

// ─────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────

function ModeSelector() {
  const quizMode = useQuizStore((s) => s.quizMode)
  const setMode = useQuizStore((s) => s.setMode)
  const startSession = useQuizStore((s) => s.startSession)

  const select = (mode: typeof quizMode) => {
    setMode(mode)
    startSession()
  }

  return (
    <div className="quiz-mode-tabs">
      <button
        className={`quiz-mode-tab ${quizMode === 'scored' ? 'active' : ''}`}
        onClick={() => select('scored')}
      >
        🏆 Có tính điểm
      </button>
      <button
        className={`quiz-mode-tab ${quizMode === 'endless' ? 'active' : ''}`}
        onClick={() => select('endless')}
      >
        ♾️ Vô tận
      </button>
    </div>
  )
}

function HistoryPanel({
  onOpen,
}: {
  onOpen: (entry: QuizHistoryEntry) => void
}) {
  const history = useQuizStore((s) => s.history)
  const clearHistory = useQuizStore((s) => s.clearHistory)

  if (history.length === 0) return null

  return (
    <div className="quiz-history">
      <div className="quiz-history-header">
        <span>📜 Lịch sử ({history.length})</span>
        <button className="quiz-history-clear" onClick={clearHistory}>
          Xóa hết
        </button>
      </div>
      <div className="quiz-history-grid">
        {history.map((entry) => (
          <button
            key={entry.id}
            className="quiz-history-card"
            onClick={() => onOpen(entry)}
            title="Xem chi tiết"
          >
            <div
              className="quiz-history-score"
              style={{ color: scoreColor(entry.score) }}
            >
              {entry.score}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>/100</span>
            </div>
            <div className="quiz-history-meta">
              <span>✅ {entry.correct}/{entry.total}</span>
              <span>⏱ {formatDuration(entry.durationMs)}</span>
            </div>
            <div className="quiz-history-date">{formatDate(entry.date)}</div>
            <div className="quiz-history-view-hint">Xem chi tiết →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ScoredSummary() {
  const sessionCorrect = useQuizStore((s) => s.sessionCorrect)
  const sessionTotal = useQuizStore((s) => s.sessionTotal)
  const startSession = useQuizStore((s) => s.startSession)
  const history = useQuizStore((s) => s.history)
  const { fireConfetti } = useConfetti()

  const latest = history[0]
  const score = latest?.score ?? Math.round((sessionCorrect / sessionTotal) * 100)

  useEffect(() => {
    if (score >= 80) fireConfetti()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="quiz-summary">
      <div className="quiz-summary-emoji">
        {score >= 90 ? '🎉' : score >= 70 ? '👍' : '📚'}
      </div>
      <div className="quiz-summary-score" style={{ color: scoreColor(score) }}>
        {score}
        <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/100</span>
      </div>
      <div className="quiz-summary-detail">
        {sessionCorrect} / {sessionTotal} câu đúng
        {latest && (
          <span style={{ color: '#94a3b8', marginLeft: 8 }}>
            · {formatDuration(latest.durationMs)}
          </span>
        )}
      </div>
      <div className="quiz-summary-msg">
        {score >= 90
          ? 'Xuất sắc! Bạn nhớ gần hết rồi 🔥'
          : score >= 70
            ? 'Khá tốt! Luyện thêm một chút nữa nhé 💪'
            : 'Cố lên! Ôn lại và thử lại nào 📖'}
      </div>
      <button className="nav-btn flip-btn-main" onClick={() => startSession()}>
        🔄 Chơi lại
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────

export function QuizView() {
  const quizMode = useQuizStore((s) => s.quizMode)
  const currentWordIndex = useQuizStore((s) => s.currentWordIndex)
  const options = useQuizStore((s) => s.options)
  const answered = useQuizStore((s) => s.answered)
  const selectedOptionIndex = useQuizStore((s) => s.selectedOptionIndex)
  const correctOptionIndex = useQuizStore((s) => s.correctOptionIndex)
  const sessionQueue = useQuizStore((s) => s.sessionQueue)
  const sessionTotal = useQuizStore((s) => s.sessionTotal)
  const sessionCorrect = useQuizStore((s) => s.sessionCorrect)
  const sessionDone = useQuizStore((s) => s.sessionDone)
  const streak = useQuizStore((s) => s.streak)
  const startSession = useQuizStore((s) => s.startSession)
  const submitAnswer = useQuizStore((s) => s.submitAnswer)
  const nextQuestion = useQuizStore((s) => s.nextQuestion)

  const { fireConfetti } = useConfetti()
  const { speak, isSpeaking } = useSpeech()

  const [modalEntry, setModalEntry] = useState<QuizHistoryEntry | null>(null)

  const currentWord = vocabData[currentWordIndex]

  useEffect(() => {
    startSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentWord) speak(currentWord.word)
  }

  const handleOptionClick = (idx: number) => {
    if (answered) return
    const isCorrect = submitAnswer(idx)
    if (isCorrect) {
      fireConfetti()
      playSound('correct')
    } else {
      playSound('incorrect')
    }
  }

  const getOptionClass = (idx: number) => {
    if (!answered) return ''
    if (idx === correctOptionIndex) return 'correct'
    if (idx === selectedOptionIndex && idx !== correctOptionIndex) return 'wrong'
    return ''
  }

  const progressPct =
    quizMode === 'scored' && sessionTotal > 0
      ? Math.round(((sessionTotal - sessionQueue.length) / sessionTotal) * 100)
      : 0

  if (!currentWord && !sessionDone) return null

  return (
    <>
      {/* History detail modal */}
      {modalEntry && (
        <HistoryDetailModal entry={modalEntry} onClose={() => setModalEntry(null)} />
      )}

      <div className="quiz-view">
        {/* Header */}
        <div className="quiz-header">
          <ModeSelector />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {quizMode === 'endless' && (
              <div style={{ fontWeight: 700, color: '#f59e0b' }}>🔥 {streak}</div>
            )}
            {quizMode === 'scored' && (
              <div style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.9rem' }}>
                ✅ {sessionCorrect}/{sessionTotal - sessionQueue.length}
              </div>
            )}
            <button
              className={`icon-btn ${isSpeaking ? 'speaking' : ''}`}
              title="Phát âm"
              onClick={handleSpeak}
              disabled={sessionDone}
            >
              🔊
            </button>
            <button className="icon-btn" onClick={() => startSession()} title="Chơi lại">
              🔄
            </button>
          </div>
        </div>

        {/* Scored progress bar */}
        {quizMode === 'scored' && !sessionDone && (
          <div className="quiz-progress-row">
            <div className="quiz-progress-bar-bg">
              <div className="quiz-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="quiz-progress-label">
              {sessionTotal - sessionQueue.length}/{sessionTotal}
            </span>
          </div>
        )}

        {/* Session done → summary */}
        {sessionDone ? (
          <ScoredSummary />
        ) : (
          <>
            <div className="quiz-question-box">
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>
                {quizMode === 'scored'
                  ? `Câu ${sessionTotal - sessionQueue.length} / ${sessionTotal} — Từ vựng này có nghĩa là gì?`
                  : 'Từ vựng này có nghĩa là gì?'}
              </div>
              <div className="quiz-word-prompt">{currentWord?.word}</div>
              <div className="quiz-ipa-prompt">{currentWord?.ipa}</div>
            </div>

            <div className="quiz-options-grid">
              {options.map((option, idx) => (
                <button
                  key={`${option.index}-${idx}`}
                  className={`quiz-option-btn ${getOptionClass(idx)}`}
                  onClick={() => handleOptionClick(idx)}
                  disabled={answered}
                >
                  <span style={{ fontWeight: 700, color: '#94a3b8' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option.text}
                </button>
              ))}
            </div>

            {answered && (
              <button
                className="nav-btn flip-btn-main"
                onClick={nextQuestion}
                style={{ margin: '0 auto' }}
              >
                {quizMode === 'scored' && sessionQueue.length === 0
                  ? 'Xem kết quả 🏆'
                  : 'Câu tiếp theo ➡️'}
              </button>
            )}
          </>
        )}

        {/* History panel (scored only) */}
        {quizMode === 'scored' && (
          <HistoryPanel onOpen={(entry) => setModalEntry(entry)} />
        )}
      </div>
    </>
  )
}
