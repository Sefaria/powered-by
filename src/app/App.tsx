import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'

// A data router, which <ScrollRestoration> needs.
const router = createBrowserRouter(routes)

export function App() {
  return <RouterProvider router={router} />
}
