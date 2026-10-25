import type { RouteObject } from 'react-router'
import { BrowsePage } from '../features/browse/BrowsePage'
import { NotFound } from './NotFound'
import { Root } from './Root'

/** Both are lazy so recharts and the project page stay out of the main bundle. */
export const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      { path: '/', element: <BrowsePage /> },
      {
        path: '/projects/:slug',
        lazy: async () => ({
          Component: (await import('../features/project-page/ProjectPage')).ProjectPage,
        }),
      },
      {
        path: '/charts',
        lazy: async () => ({
          Component: (await import('../features/charts/ChartsPage')).ChartsPage,
        }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
