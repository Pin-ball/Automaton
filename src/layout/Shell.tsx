import { useMediaQuery } from '@src/hooks/useMediaQuery.ts'
import { ScreenTooSmall } from '@src/layout/ScreenTooSmall.tsx'
import { Outlet } from 'react-router'

const MIN_WIDTH = 1024
const MIN_HEIGHT = 780

export function Shell() {
  const isTooSmall = useMediaQuery(
    `(max-width: ${MIN_WIDTH - 1}px), (max-height: ${MIN_HEIGHT - 1}px)`,
  )

  return isTooSmall ? <ScreenTooSmall /> : <Outlet />
}
