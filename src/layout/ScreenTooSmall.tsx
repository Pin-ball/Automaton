import { Notice } from '@src/layout/Notice.tsx'
import { useTranslation } from 'react-i18next'

export function ScreenTooSmall() {
  const { t } = useTranslation()
  return <Notice title={t('screenTooSmall.title')} description={t('screenTooSmall.description')} />
}
