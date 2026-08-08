import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { vocabData, type Category } from '../data/vocabData'
import { playSound } from '../utils/sound'

export type FilterType = Category | 'all' | 'starred' | 'memorize'
export type AppMode = 'flashcard' | 'quiz' | 'grid'

interface FlashcardState {
  currentIndex: number
  isFlipped: boolean
  masteredSet: number[]
  starredSet: number[]
  activeFilter: FilterType
  searchQuery: string
  activeMode: AppMode

  // Derived
  getFilteredIndices: () => number[]
  getAllIndices: () => number[]

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

      getFilteredIndices: () => {
        const { activeFilter, searchQuery, starredSet, masteredSet } = get()
        let indices = vocabData.map((_, i) => i)

        // Filter by category
        if (activeFilter === 'starred') {
          indices = indices.filter((i) => starredSet.includes(i))
        } else if (activeFilter === 'memorize') {
          indices = indices.filter((i) => masteredSet.includes(i))
        } else if (activeFilter !== 'all') {
          indices = indices.filter((i) => vocabData[i].cat === activeFilter)
        }

        // Filter by search
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
      },

      getAllIndices: () => {
        return vocabData.map((_, i) => i)
      },

      flipCard: () => {
        playSound('flip')
        set((s) => ({ isFlipped: !s.isFlipped }))
      },

      nextCard: () => {
        const filtered = get().getFilteredIndices()
        if (filtered.length === 0) return
        const currentFiltered = filtered.indexOf(get().currentIndex)
        const nextFiltered =
          currentFiltered === -1 || currentFiltered >= filtered.length - 1 ? 0 : currentFiltered + 1
        set({ currentIndex: filtered[nextFiltered], isFlipped: false })
      },

      prevCard: () => {
        const filtered = get().getFilteredIndices()
        if (filtered.length === 0) return
        const currentFiltered = filtered.indexOf(get().currentIndex)
        const prevFiltered = currentFiltered <= 0 ? filtered.length - 1 : currentFiltered - 1
        set({ currentIndex: filtered[prevFiltered], isFlipped: false })
      },

      toggleMastered: () => {
        const { currentIndex, activeFilter, masteredSet, searchQuery } = get()
        const isRemoving = masteredSet.includes(currentIndex)
        const newMasteredSet = isRemoving
          ? masteredSet.filter((i) => i !== currentIndex)
          : [...masteredSet, currentIndex]

        // When removing from the 'memorize' filtered view, navigate to next valid card
        if (isRemoving && activeFilter === 'memorize') {
          // Compute new filtered list (with item removed)
          let remaining = newMasteredSet.slice()
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            remaining = remaining.filter((i) => {
              const item = vocabData[i]
              return (
                item.word.toLowerCase().includes(q) ||
                item.vi.toLowerCase().includes(q) ||
                item.example.toLowerCase().includes(q)
              )
            })
          }
          const pos = remaining.indexOf(currentIndex)
          // Pick next, or previous, or -1 if empty
          const nextIndex =
            remaining.length === 0 ? -1 : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
          set({ masteredSet: newMasteredSet, currentIndex: nextIndex, isFlipped: false })
        } else {
          set({ masteredSet: newMasteredSet })
        }
      },

      toggleStar: () => {
        const { currentIndex, activeFilter, starredSet, searchQuery } = get()
        const isRemoving = starredSet.includes(currentIndex)
        const newStarredSet = isRemoving
          ? starredSet.filter((i) => i !== currentIndex)
          : [...starredSet, currentIndex]

        // When removing from the 'starred' filtered view, navigate to next valid card
        if (isRemoving && activeFilter === 'starred') {
          // Compute new filtered list (with item removed)
          let remaining = newStarredSet.slice()
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            remaining = remaining.filter((i) => {
              const item = vocabData[i]
              return (
                item.word.toLowerCase().includes(q) ||
                item.vi.toLowerCase().includes(q) ||
                item.example.toLowerCase().includes(q)
              )
            })
          }
          const pos = remaining.indexOf(currentIndex)
          // Pick next, or previous, or -1 if empty
          const nextIndex =
            remaining.length === 0 ? -1 : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
          set({ starredSet: newStarredSet, currentIndex: nextIndex, isFlipped: false })
        } else {
          set({ starredSet: newStarredSet })
        }
      },

      setFilter: (filter) => {
        const { searchQuery, starredSet, masteredSet } = get()
        // Compute filtered indices with the NEW filter
        let indices = vocabData.map((_, i) => i)
        if (filter === 'starred') {
          indices = indices.filter((i) => starredSet.includes(i))
        } else if (filter === 'memorize') {
          indices = indices.filter((i) => masteredSet.includes(i))
        } else if (filter !== 'all') {
          indices = indices.filter((i) => vocabData[i].cat === filter)
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
        set({ activeFilter: filter, currentIndex: indices[0] ?? 0, isFlipped: false })
      },

      setSearch: (query) => {
        const { activeFilter, starredSet, masteredSet } = get()
        let indices = vocabData.map((_, i) => i)

        // Mirror the same filter logic as getFilteredIndices
        if (activeFilter === 'starred') {
          indices = indices.filter((i) => starredSet.includes(i))
        } else if (activeFilter === 'memorize') {
          indices = indices.filter((i) => masteredSet.includes(i))
        } else if (activeFilter !== 'all') {
          indices = indices.filter((i) => vocabData[i].cat === activeFilter)
        }

        if (query.trim()) {
          const q = query.toLowerCase().trim()
          indices = indices.filter((i) => {
            const item = vocabData[i]
            return (
              item.word.toLowerCase().includes(q) ||
              item.vi.toLowerCase().includes(q) ||
              item.example.toLowerCase().includes(q)
            )
          })
        }

        // Always jump to first card of the resulting filtered set
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
