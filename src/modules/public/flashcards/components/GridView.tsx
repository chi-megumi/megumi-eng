import { useFlashcardStore } from '../stores/useFlashcardStore'
import { vocabData } from '../data/vocabData'

export function GridView() {
  const getAllIndices = useFlashcardStore((s) => s.getAllIndices)
  const filtered = getAllIndices()

  return (
    <div className="grid-view">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          className="nav-btn"
          onClick={() => window.print()}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          🖨️ In ra giấy làm thẻ thật (PDF)
        </button>
      </div>
      <div className="grid-cards" id="grid-container">
        {filtered.map((i) => {
          const item = vocabData[i]
          return (
            <div className="mini-card" key={i}>
              <div className="mini-card-top">
                <div className="mini-card-word">
                  <span> {item.emoji}</span>
                  <span> {item.word}</span>
                </div>
                <span className="card-pos-badge">{item.pos}</span>
              </div>
              <div className="mini-card-ipa">{item.ipa}</div>
              <div className="mini-card-vi">{item.vi}</div>
              <div className="mini-card-ex">"{item.example}"</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
