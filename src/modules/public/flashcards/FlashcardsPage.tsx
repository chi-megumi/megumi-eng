import { useEffect } from 'react'
import { Header } from './components/Header'
import { ModeTabs } from './components/ModeTabs'
import { ProgressBar } from './components/ProgressBar'
import { ControlsBar } from './components/ControlsBar'
import { Flashcard3D } from './components/Flashcard3D'
import { FlashcardControls } from './components/FlashcardControls'
import { QuizView } from './components/QuizView'
import { GridView } from './components/GridView'
import { useFlashcardStore } from './stores/useFlashcardStore'
import { useSpeech } from './hooks/useSpeech'
import { vocabData } from './data/vocabData'
import './FlashcardsPage.scss'

export function FlashcardsPage() {
  const activeMode = useFlashcardStore((s) => s.activeMode)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const toggleMastered = useFlashcardStore((s) => s.toggleMastered)
  const currentIndex = useFlashcardStore((s) => s.currentIndex)
  const { speak } = useSpeech()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (activeMode !== 'flashcard') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextCard()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevCard()
          break
        case 'KeyS':
          e.preventDefault()
          speak(vocabData[currentIndex]?.word ?? '')
          break
        case 'KeyM':
          e.preventDefault()
          toggleMastered()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeMode, flipCard, nextCard, prevCard, toggleMastered, currentIndex, speak])

  return (
    <div className="fc-container">
      <Header />
      <ModeTabs />

      {activeMode === 'flashcard' && (
        <>
          <ProgressBar />
          <ControlsBar />
          <div id="flashcard-section">
            <Flashcard3D />
            <FlashcardControls />
          </div>
        </>
      )}

      {activeMode === 'quiz' && <QuizView />}

      {activeMode === 'grid' && <GridView />}
    </div>
  )
}
