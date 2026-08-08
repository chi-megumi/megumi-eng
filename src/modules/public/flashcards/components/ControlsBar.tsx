import { useFlashcardStore, type FilterType } from '../stores/useFlashcardStore'
import { vocabData, categoryLabels, type Category } from '../data/vocabData'
import { useEffect, useRef } from 'react'

const filterKeys: (Category | 'all' | 'starred' | 'memorize')[] = [
  'all',
  'stress',
  'solution',
  'tech',
  'school',
  'starred',
  'memorize',
]

const DEBOUNCE_MS = 300

function getFilterCount(filter: FilterType, data: number[]): number {
  if (filter === 'all') return vocabData.length
  if (filter === 'starred' || filter === 'memorize') return data.length
  return vocabData.filter((item) => item.cat === filter).length
}

export function ControlsBar() {
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const setFilter = useFlashcardStore((s) => s.setFilter)
  const searchQuery = useFlashcardStore((s) => s.searchQuery)
  const setSearch = useFlashcardStore((s) => s.setSearch)
  const starredSet = useFlashcardStore((s) => s.starredSet)
  const masteredSet = useFlashcardStore((s) => s.masteredSet)

  // Local input ref for uncontrolled input
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync DOM input when the store resets searchQuery externally (e.g. filter change).
  // Updating the DOM node directly is the correct React pattern for effects —
  // no setState means no cascading render.
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== searchQuery) {
      inputRef.current.value = searchQuery
    }
  }, [searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSearch(e.target.value)
    }, DEBOUNCE_MS)
  }

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div className="controls-row">
      <div className="filter-group">
        {filterKeys.map((key) => (
          <button
            key={key}
            className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {categoryLabels[key]}
            {` (${getFilterCount(key, key === 'starred' ? starredSet : masteredSet)})`}
          </button>
        ))}
      </div>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          id="search-input"
          placeholder="Tìm từ, nghĩa..."
          defaultValue={searchQuery}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
