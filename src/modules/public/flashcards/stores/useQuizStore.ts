import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { vocabData } from '../data/vocabData'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type QuizMode = 'scored' | 'endless'

export interface QuizOption {
  text: string
  index: number
}

/** Per-question answer record stored in history */
export interface QuizAnswerRecord {
  wordIndex: number // which vocab item was asked
  correct: boolean // did the user answer correctly?
  selectedWordIndex: number // which vocab item the user chose
}

export interface QuizHistoryEntry {
  id: string
  date: string // ISO string
  durationMs: number
  score: number // 0–100
  correct: number
  total: number
  mode: QuizMode
  answers: QuizAnswerRecord[]
}

interface QuizState {
  // Mode
  quizMode: QuizMode

  // Current question
  currentWordIndex: number
  options: QuizOption[]
  answered: boolean
  selectedOptionIndex: number | null
  correctOptionIndex: number

  // Scored mode
  sessionQueue: number[] // remaining word indices for this round
  sessionTotal: number
  sessionCorrect: number
  sessionStartMs: number
  sessionDone: boolean
  sessionAnswers: QuizAnswerRecord[] // accumulates during session

  // Endless mode anti-repeat
  recentIndices: number[]
  recentDistractorIndices: number[] // last N distractor words, for anti-repeat

  // Streak (both modes)
  streak: number

  // History
  history: QuizHistoryEntry[]

  // Actions
  setMode: (mode: QuizMode) => void
  startSession: (wordPool?: number[]) => void
  submitAnswer: (optionIdx: number) => boolean
  nextQuestion: () => void
  clearHistory: () => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Pick a distractor using weighted random — words that appeared recently
 * as distractors have exponentially lower probability.
 */
function pickWeightedDistractor(
  source: number[],
  exclude: Set<number>,
  recentDistractors: number[],
): number | null {
  const candidates = source.filter((i) => !exclude.has(i))
  if (candidates.length === 0) return null
  const DECAY = 0.12
  const weights = candidates.map((idx) => {
    const pos = recentDistractors.lastIndexOf(idx)
    if (pos === -1) return 1
    const age = recentDistractors.length - pos
    return Math.pow(DECAY, 1 / age)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

function buildOptions(
  wordIndex: number,
  pool: number[],
  recentDistractors: number[] = [],
): {
  options: QuizOption[]
  correctOptionIndex: number
  usedDistractors: number[] // indices of distractors chosen (for tracking)
} {
  const correctWord = vocabData[wordIndex]
  const source = pool.length >= 4 ? pool : vocabData.map((_, i) => i)
  const exclude = new Set<number>([wordIndex])
  const usedDistractors: number[] = []

  // Pick 3 distractors with anti-repeat weighting
  while (usedDistractors.length < 3) {
    const d = pickWeightedDistractor(source, exclude, [...recentDistractors, ...usedDistractors])
    if (d === null) break // source exhausted
    exclude.add(d)
    usedDistractors.push(d)
  }

  const options: QuizOption[] = [
    { text: correctWord.vi, index: wordIndex },
    ...usedDistractors.map((i) => ({ text: vocabData[i].vi, index: i })),
  ]
  shuffle(options)
  return {
    options,
    correctOptionIndex: options.findIndex((o) => o.index === wordIndex),
    usedDistractors,
  }
}

function pickWeightedRandom(pool: number[], recentIndices: number[]): number {
  if (pool.length === 1) return pool[0]
  const DECAY = 0.15
  const weights = pool.map((idx) => {
    const pos = recentIndices.lastIndexOf(idx)
    if (pos === -1) return 1
    const age = recentIndices.length - pos
    return Math.pow(DECAY, 1 / age)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

const RECENT_WINDOW = 8
const defaultPool = () => vocabData.map((_, i) => i)

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizMode: 'scored',

      currentWordIndex: 0,
      options: [],
      answered: false,
      selectedOptionIndex: null,
      correctOptionIndex: 0,

      sessionQueue: [],
      sessionTotal: 0,
      sessionCorrect: 0,
      sessionStartMs: 0,
      sessionDone: false,
      sessionAnswers: [],

      recentIndices: [],
      recentDistractorIndices: [],
      streak: 0,
      history: [],

      setMode: (mode) => set({ quizMode: mode }),

      startSession: (wordPool) => {
        const pool = wordPool && wordPool.length > 0 ? wordPool : defaultPool()
        const { quizMode } = get()

        if (quizMode === 'scored') {
          const queue = shuffle(pool.slice())
          const firstIdx = queue.pop()!
          const { options, correctOptionIndex, usedDistractors } = buildOptions(firstIdx, pool, [])
          set({
            sessionQueue: queue,
            sessionTotal: pool.length,
            sessionCorrect: 0,
            sessionStartMs: Date.now(),
            sessionDone: false,
            sessionAnswers: [],
            currentWordIndex: firstIdx,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            streak: 0,
            recentDistractorIndices: usedDistractors,
          })
        } else {
          const firstIdx = pickWeightedRandom(pool, [])
          const { options, correctOptionIndex, usedDistractors } = buildOptions(firstIdx, pool, [])
          set({
            currentWordIndex: firstIdx,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentIndices: [firstIdx],
            recentDistractorIndices: usedDistractors,
            streak: 0,
            sessionDone: false,
            sessionTotal: pool.length,
            sessionCorrect: 0,
            sessionStartMs: Date.now(),
            sessionQueue: [],
            sessionAnswers: [],
          })
        }
      },

      submitAnswer: (optionIdx) => {
        const state = get()
        if (state.answered) return false

        const isCorrect = optionIdx === state.correctOptionIndex
        const newCorrect = state.sessionCorrect + (isCorrect ? 1 : 0)
        const newStreak = isCorrect ? state.streak + 1 : 0

        // Record this answer
        const selectedWordIndex = state.options[optionIdx]?.index ?? -1
        const answerRecord: QuizAnswerRecord = {
          wordIndex: state.currentWordIndex,
          correct: isCorrect,
          selectedWordIndex,
        }
        const newAnswers = [...state.sessionAnswers, answerRecord]

        const scoredDone = state.quizMode === 'scored' && state.sessionQueue.length === 0

        if (scoredDone) {
          const durationMs = Date.now() - state.sessionStartMs
          const score = Math.round((newCorrect / state.sessionTotal) * 10)
          const entry: QuizHistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: new Date().toISOString(),
            durationMs,
            score,
            correct: newCorrect,
            total: state.sessionTotal,
            mode: 'scored',
            answers: newAnswers,
          }
          set({
            answered: true,
            selectedOptionIndex: optionIdx,
            sessionCorrect: newCorrect,
            sessionAnswers: newAnswers,
            streak: newStreak,
            sessionDone: true,
            history: [entry, ...state.history].slice(0, 50),
          })
        } else {
          set({
            answered: true,
            selectedOptionIndex: optionIdx,
            sessionCorrect: newCorrect,
            sessionAnswers: newAnswers,
            streak: newStreak,
          })
        }

        return isCorrect
      },

      nextQuestion: () => {
        const state = get()
        const pool = defaultPool()
        const recentDist = state.recentDistractorIndices
        const DIST_WINDOW = 12 // remember last 12 distractor words

        if (state.quizMode === 'scored') {
          if (state.sessionQueue.length === 0) return
          const queue = [...state.sessionQueue]
          const nextIdx = queue.pop()!
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            nextIdx,
            pool,
            recentDist,
          )
          set({
            sessionQueue: queue,
            currentWordIndex: nextIdx,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentDistractorIndices: [...recentDist, ...usedDistractors].slice(-DIST_WINDOW),
          })
        } else {
          const recent = state.recentIndices
          const nextIdx = pickWeightedRandom(pool, recent)
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            nextIdx,
            pool,
            recentDist,
          )
          const newRecent = [...recent, nextIdx].slice(-RECENT_WINDOW)
          set({
            currentWordIndex: nextIdx,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentIndices: newRecent,
            recentDistractorIndices: [...recentDist, ...usedDistractors].slice(-DIST_WINDOW),
          })
        }
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'quiz-storage',
      partialize: (s) => ({ history: s.history }),
    },
  ),
)
