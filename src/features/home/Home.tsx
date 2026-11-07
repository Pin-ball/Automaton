import { Notice } from '@src/layout/Notice.tsx'
import { useTranslation } from 'react-i18next'

export function Home() {
  const { t } = useTranslation()
  return <Notice title={t('app.title')} description={t('app.status')} />
}
