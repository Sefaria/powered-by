import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { BrowsePage } from '../features/browse/BrowsePage'
import { NotFound } from './NotFound'

// Lazy so recharts stays out of the main bundle.
const ChartsPage = lazy(() =>
  import('../features/charts/ChartsPage').then((m) => ({ default: m.ChartsPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BrowsePage />} />
      <Route
        path="/charts"
        element={
          <Suspense fallback={null}>
            <ChartsPage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
