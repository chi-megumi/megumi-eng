/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router'
import MainLayout from '~/components/layouts/MainLayout'
import { lazy, Suspense } from 'react'

const FlashcardsPage = lazy(() => import('~/modules/public/flashcards/FlashcardsPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <MainLayout />
      </Suspense>
    ),
    children: [{ index: true, element: <FlashcardsPage /> }],
  },
])

export default router
