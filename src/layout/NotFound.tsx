import { PATHS } from '@src/app/paths.ts'
import { Notice } from '@src/layout/Notice.tsx'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <Notice title={t('notFound.title')} description={t('notFound.description')}>
      <Link to={PATHS.home} className="hover:bg-accent rounded-md border px-4 py-2 text-sm">
        {t('notFound.home')}
      </Link>
    </Notice>
  )
}
