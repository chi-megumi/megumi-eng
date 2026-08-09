import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { vocabData, type Category } from '../data/vocabData'
import { playSound } from '../utils/sound'

export type FilterType = Category | 'all' | 'starred' | 'memorize'
export type AppMode = 'flashcard' | 'quiz' | 'grid'

interface FlashcardState {
  currentIndex?: number
  isFlipped: boolean
  masteredSet: number[]
  starredSet: number[]
  activeFilter: FilterType
  searchQuery: string
  activeMode: AppMode

  // Actions
  flipCard: () => void
  nextCard: () => void
  prevCard: () => void
  toggleMastered: () => void
  toggleStar: () => void
  setFilter: (filter: FilterType) => void
  setSearch: (query: string) => void
  setMode: (mode: AppMode) => void
  setCurrentIndex: (index: number) => void
}

// ─────────────────────────────────────────────────────────────────
// Pure helper: compute filtered indices from a state snapshot.
// Used both as a Zustand selector (for components) and inside
// store actions (via get()). No `get()` calls — pure function.
// ─────────────────────────────────────────────────────────────────
export function computeFilteredIndices(
  activeFilter: FilterType,
  starredSet: number[],
  masteredSet: number[],
  searchQuery: string,
): number[] {
  let indices = vocabData.map((_, i) => i)

  if (activeFilter === 'starred') {
    indices = indices.filter((i) => starredSet.includes(i))
  } else if (activeFilter === 'memorize') {
    indices = indices.filter((i) => masteredSet.includes(i))
  } else if (activeFilter !== 'all') {
    indices = indices.filter((i) => vocabData[i].cat === activeFilter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim()
    indices = indices.filter((i) => {
      const item = vocabData[i]
      return (
        item.word.toLowerCase().includes(q) ||
        item.vi.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      )
    })
  }

  return indices
}

// ─────────────────────────────────────────────────────────────────
// Hook: use this in components instead of the old s.getFilteredIndices().
// Uses shallow equality to avoid infinite re-renders (the selector
// creates a new array every call — shallow compares elements).
//
// Usage: const filtered = useFilteredIndices()
// ─────────────────────────────────────────────────────────────────
export function useFilteredIndices(): number[] {
  return useFlashcardStore(
    useShallow((state) =>
      computeFilteredIndices(
        state.activeFilter,
        state.starredSet,
        state.masteredSet,
        state.searchQuery,
      ),
    ),
  )
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      isFlipped: false,
      masteredSet: [],
      starredSet: [],
      activeFilter: 'all',
      searchQuery: '',
      activeMode: 'flashcard',

      flipCard: () => {
        const { activeFilter, masteredSet, starredSet, searchQuery } = get()
        const filtered = computeFilteredIndices(activeFilter, starredSet, masteredSet, searchQuery)
        if (filtered.length === 0) return

        playSound('flip')
        set((s) => ({ isFlipped: !s.isFlipped }))
      },

      nextCard: () => {
        const { activeFilter, starredSet, masteredSet, searchQuery, currentIndex } = get()
        const filtered = computeFilteredIndices(activeFilter, starredSet, masteredSet, searchQuery)
        if (filtered.length === 0) return
        const currentFiltered = filtered.indexOf(currentIndex ?? -1)
        if (currentFiltered >= filtered.length - 1) return
        const nextFiltered = currentFiltered === -1 ? 0 : currentFiltered + 1
        set({ currentIndex: filtered[nextFiltered], isFlipped: false })
      },

      prevCard: () => {
        const { activeFilter, starredSet, masteredSet, searchQuery, currentIndex } = get()
        const filtered = computeFilteredIndices(activeFilter, starredSet, masteredSet, searchQuery)
        if (filtered.length === 0) return
        const currentFiltered = filtered.indexOf(currentIndex ?? -1)
        if (currentFiltered <= 0) return
        set({ currentIndex: filtered[currentFiltered - 1], isFlipped: false })
      },

      toggleMastered: () => {
        const { currentIndex, activeFilter, masteredSet, starredSet, searchQuery } = get()

        if (currentIndex === undefined || currentIndex < 0) return

        const isRemoving = masteredSet.includes(currentIndex)
        const newMasteredSet = isRemoving
          ? masteredSet.filter((i) => i !== currentIndex)
          : [...masteredSet, currentIndex]

        // When removing from the 'memorize' filtered view, navigate to next valid card
        if (isRemoving && activeFilter === 'memorize') {
          const remaining = computeFilteredIndices(
            'memorize',
            starredSet,
            newMasteredSet,
            searchQuery,
          )
          const pos = remaining.indexOf(currentIndex)
          const nextIndex =
            remaining.length === 0 ? undefined : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
          set({ masteredSet: newMasteredSet, currentIndex: nextIndex, isFlipped: false })
        } else {
          set({ masteredSet: newMasteredSet })
        }
      },

      toggleStar: () => {
        const { currentIndex, activeFilter, starredSet, masteredSet, searchQuery } = get()
        if (currentIndex === undefined) return

        const isRemoving = starredSet.includes(currentIndex)
        const newStarredSet = isRemoving
          ? starredSet.filter((i) => i !== currentIndex)
          : [...starredSet, currentIndex]

        // When removing from the 'starred' filtered view, navigate to next valid card
        if (isRemoving && activeFilter === 'starred') {
          const remaining = computeFilteredIndices(
            'starred',
            newStarredSet,
            masteredSet,
            searchQuery,
          )
          const pos = remaining.indexOf(currentIndex)
          const nextIndex =
            remaining.length === 0 ? undefined : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
          set({ starredSet: newStarredSet, currentIndex: nextIndex, isFlipped: false })
        } else {
          set({ starredSet: newStarredSet })
        }
      },

      setFilter: (filter) => {
        const { searchQuery, starredSet, masteredSet } = get()
        const indices = computeFilteredIndices(filter, starredSet, masteredSet, searchQuery)
        set({ activeFilter: filter, currentIndex: indices[0], isFlipped: false })
      },

      setSearch: (query) => {
        const { activeFilter, starredSet, masteredSet } = get()
        const indices = computeFilteredIndices(activeFilter, starredSet, masteredSet, query)
        set({ searchQuery: query, currentIndex: indices[0] ?? 0, isFlipped: false })
      },

      setMode: (mode) => set({ activeMode: mode, isFlipped: false }),

      setCurrentIndex: (index) => set({ currentIndex: index, isFlipped: false }),
    }),
    {
      name: 'flashcard-storage',
      partialize: (state) => ({
        masteredSet: state.masteredSet,
        starredSet: state.starredSet,
      }),
    },
  ),
)
