import { useQuizStore } from '~/modules/public/flashcards/stores/useQuizStore'

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

export default ModeSelector
