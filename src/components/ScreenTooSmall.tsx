import { useTranslation } from 'react-i18next'

export function ScreenTooSmall() {
  const { t } = useTranslation()

  return (
    <main className="flex h-full items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <h1 className="mb-2 text-lg font-medium">{t('screenTooSmall.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('screenTooSmall.description')}</p>
      </div>
    </main>
  )
}
