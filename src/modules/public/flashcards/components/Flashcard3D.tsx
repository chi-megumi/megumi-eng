import { useFlashcardStore } from '../stores/useFlashcardStore'
import { useFilteredIndices } from '../stores/useFlashcardStore'
import { vocabData, categoryBadgeLabels } from '../data/vocabData'
import { useSpeech } from '../hooks/useSpeech'

export function Flashcard3D() {
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const currentIndex = useFlashcardStore((s) => s.currentIndex)
  const isFlipped = useFlashcardStore((s) => s.isFlipped)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const starredSet = useFlashcardStore((s) => s.starredSet)
  const toggleStar = useFlashcardStore((s) => s.toggleStar)
  // Subscribe to filtered result with shallow equality — no tearing, no infinite loop
  const filtered = useFilteredIndices()

  const { speak, isSpeaking } = useSpeech()

  const isEmpty = filtered.length === 0

  const safeIndex = currentIndex ?? 0
  const item = isEmpty ? null : vocabData[safeIndex]
  const isStarred = !isEmpty && starredSet.includes(safeIndex)

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item) speak(item.word)
  }

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item) speak(item.example)
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStar()
  }

  // Highlight the word in the example sentence
  const renderExample = () => {
    if (!item) return null
    const idx = item.example.toLowerCase().indexOf(item.word.toLowerCase())
    if (idx === -1) {
      return <span>{item.example}</span>
    }
    const before = item.example.slice(0, idx)
    const match = item.example.slice(idx, idx + item.word.length)
    const after = item.example.slice(idx + item.word.length)
    return (
      <>
        {before}
        <span className="example-highlight">{match}</span>
        {after}
      </>
    )
  }

  // Empty state: no cards match the current filter
  if (isEmpty) {
    return (
      <div className="flashcard-wrapper">
        <div className="flashcard" id="main-card">
          <div className="card-face card-front">
            <div className="card-top"></div>
            <div className="card-center">
              <div className="card-emoji-illustration">📭</div>
              <div className="card-word">
                {activeFilter === 'starred'
                  ? 'Không có từ nào được lưu'
                  : activeFilter === 'memorize'
                    ? 'Bạn chưa thuộc từ nào'
                    : 'Không tìm thấy từ nào'}
              </div>
            </div>
            <div className="card-bottom-hint">
              <span>
                {activeFilter === 'starred'
                  ? '💡 Nhấn ⭐ trên thẻ từ vựng để lưu vào danh sách yêu thích'
                  : activeFilter === 'memorize'
                    ? '🤦‍♀️ Hãy chăm chỉ học thêm'
                    : 'Không có từ nào phù hợp'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="flashcard-wrapper" onClick={flipCard}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} id="main-card">
        {/* FRONT FACE */}
        <div className="card-face card-front">
          <div className="card-top">
            <span className="card-cat-badge">{categoryBadgeLabels[item.cat]}</span>
            <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
              <button
                className={`icon-btn ${isSpeaking ? 'speaking' : ''}`}
                title="Phát âm chuẩn (Phím S)"
                onClick={handleSpeak}
              >
                🔊
              </button>
              <button
                className={`icon-btn ${isStarred ? 'starred' : ''}`}
                title="Đánh dấu yêu thích"
                onClick={handleStarClick}
              >
                ⭐
              </button>
            </div>
          </div>

          <div className="card-center">
            <div className="card-emoji-illustration">{item.emoji}</div>
            <div className="card-word">{item.word}</div>
            <div className="card-ipa-group">
              <span className="card-ipa">{item.ipa}</span>
              <span className="card-pos-badge">{item.pos}</span>
            </div>
          </div>

          <div className="card-bottom-hint">
            <span>
              👆 Nhấn vào thẻ hoặc phím <kbd className="kbd">Space</kbd> để lật xem giải thích
            </span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <div className="card-top">
            <span
              className="card-cat-badge"
              style={{
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
              }}
            >
              ✨ Nghĩa &amp; Giải Thích Chi Tiết
            </span>
            <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
              <button
                className="icon-btn"
                title="Phát âm cả câu ví dụ"
                onClick={handleSpeakExample}
              >
                📢
              </button>
            </div>
          </div>

          <div className="card-center">
            <div className="meaning-vi">{item.vi}</div>
            <div className="collocation-tip">{item.tip}</div>

            <div className="example-box">
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Ví dụ thực tế:
              </div>
              <div className="example-en">{renderExample()}</div>
              <div className="example-vi">{item.exampleVi}</div>
            </div>
          </div>

          <div className="card-bottom-hint">
            <span>
              🔄 Nhấn vào thẻ hoặc phím <kbd className="kbd">Space</kbd> để lật lại
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
