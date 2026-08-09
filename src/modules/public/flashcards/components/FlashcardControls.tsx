import { useFlashcardStore, useFilteredIndices } from '../stores/useFlashcardStore'
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
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const starredSet = useFlashcardStore((s) => s.starredSet)
  // Subscribe to filtered result with shallow equality — no tearing, no infinite loop
  const filtered = useFilteredIndices()

  const { fireMasteredConfetti } = useConfetti()

  const currentFiltered = filtered.indexOf(currentIndex ?? -1)
  const isMastered = masteredSet.includes(currentIndex ?? -1)
  const total = vocabData.length

  const isEmptyCards =
    (activeFilter === 'all' && filtered.length <= 0) ||
    (activeFilter === 'memorize' && masteredSet.length <= 0) ||
    (activeFilter === 'starred' && starredSet.length <= 0)

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

        {/* <Button variant="primary" size="md" onClick={flipCard} disabled={isEmptyCards}>
          <span>🔄</span> Lật Thẻ (Space)
        </Button>

        <Button
          className={`master-toggle-btn ${isMastered ? 'mastered' : ''}`}
          id="master-btn"
          onClick={handleToggleMastered}
          disabled={isEmptyCards}
        >
          <span>{isMastered ? '↩️' : '✅'}</span>
          <span>{isMastered ? 'Bỏ đánh dấu' : 'Đánh dấu đã thuộc'}</span>
        </Button> */}

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
        {filtered.length === 0 ? '0 ' : `${currentFiltered + 1} / ${filtered.length}`}
        <span style={{ color: '#94a3b8' }}> (Tổng bộ: {total})</span>
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
