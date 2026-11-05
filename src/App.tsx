import { ScreenTooSmall } from '@src/components/ScreenTooSmall.tsx'
import { useMediaQuery } from '@src/hooks/useMediaQuery.ts'
import { useTranslation } from 'react-i18next'

const MIN_WIDTH = 1024
const MIN_HEIGHT = 780

export function App() {
  const { t } = useTranslation()
  const isTooSmall = useMediaQuery(
    `(max-width: ${MIN_WIDTH - 1}px), (max-height: ${MIN_HEIGHT - 1}px)`,
  )

  if (isTooSmall) return <ScreenTooSmall />

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-2 text-lg font-medium">{t('app.title')}</h1>
      <p className="text-muted-foreground text-sm">{t('app.status')}</p>
    </main>
  )
}
