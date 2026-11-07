import { Notice } from '@src/layout/Notice.tsx'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'

function describe(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return String(error)
}

export function RouteError() {
  const { t } = useTranslation()
  const error = useRouteError()

  return (
    <Notice title={t('routeError.title')} description={t('routeError.description')}>
      <p className="bg-muted text-muted-foreground w-full overflow-x-auto rounded-md border p-3 text-left font-mono text-xs">
        {describe(error)}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="hover:bg-accent rounded-md border px-4 py-2 text-sm"
      >
        {t('routeError.reload')}
      </button>
    </Notice>
  )
}
