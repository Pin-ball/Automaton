import { PATHS } from '@src/app/paths.ts'
import { Home } from '@src/features/home/Home.tsx'
import { NotFound } from '@src/layout/NotFound.tsx'
import { RouteError } from '@src/layout/RouteError.tsx'
import { Shell } from '@src/layout/Shell.tsx'
import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    element: <Shell />,
    errorElement: <RouteError />,
    children: [
      { path: PATHS.home, element: <Home /> },
      {
        path: PATHS.dev,
        lazy: async () => {
          const { DevPreview } = await import('@src/dev/DevPreview.tsx')
          return { Component: DevPreview }
        },
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
