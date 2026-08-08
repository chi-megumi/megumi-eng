import { useFlashcardStore } from '../stores/useFlashcardStore'
import { vocabData } from '../data/vocabData'
import { useConfetti } from '../hooks/useConfetti'
import { playSound } from '../utils/sound'

export function FlashcardControls() {
  const currentIndex = useFlashcardStore((s) => s.currentIndex)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const toggleMastered = useFlashcardStore((s) => s.toggleMastered)
  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const getFilteredIndices = useFlashcardStore((s) => s.getFilteredIndices)
  const { fireMasteredConfetti } = useConfetti()

  const filtered = getFilteredIndices()
  const currentFiltered = filtered.indexOf(currentIndex)
  const isMastered = masteredSet.includes(currentIndex)
  const total = vocabData.length

  const handleToggleMastered = () => {
    if (!isMastered) {
      playSound('correct')
      fireMasteredConfetti()
    } else {
      playSound('incorrect')
    }
    toggleMastered()
  }

  return (
    <>
      <div className="bottom-controls">
        <button
          className="nav-btn"
          id="prev-btn"
          onClick={prevCard}
          disabled={currentFiltered <= 0}
        >
          <span>⬅️</span> Trước
        </button>

        <button className="nav-btn flip-btn-main" onClick={flipCard}>
          <span>🔄</span> Lật Thẻ (Space)
        </button>

        <button
          className={`master-toggle-btn ${isMastered ? 'mastered' : ''}`}
          id="master-btn"
          onClick={handleToggleMastered}
        >
          <span>{isMastered ? '↩️' : '✅'}</span>
          <span>{isMastered ? 'Bỏ đánh dấu' : 'Đánh dấu đã thuộc'}</span>
        </button>

        <button
          className="nav-btn"
          id="next-btn"
          onClick={nextCard}
          disabled={currentFiltered >= filtered.length - 1}
        >
          Tiếp <span>➡️</span>
        </button>
      </div>

      <div className="card-counter">
        {currentFiltered + 1} / {filtered.length}{' '}
        <span style={{ color: '#94a3b8' }}>(Tổng bộ: {total})</span>
      </div>

      <div className="keyboard-hint">
        <span>⌨️ Phím tắt:</span>
        <span>
          <kbd className="kbd">Space</kbd> Lật thẻ
        </span>
        <span>
          <kbd className="kbd">←</kbd> <kbd className="kbd">→</kbd> Chuyển thẻ
        </span>
        <span>
          <kbd className="kbd">S</kbd> Phát âm
        </span>
        <span>
          <kbd className="kbd">M</kbd> Đã thuộc
        </span>
      </div>
    </>
  )
}
