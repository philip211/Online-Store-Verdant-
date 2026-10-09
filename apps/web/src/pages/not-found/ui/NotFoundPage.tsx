import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { Button, HempLeaf } from '@/shared/ui'

export function NotFoundPage() {
  const { t } = useT()
  return (
    <div className="container-x flex flex-col items-center py-32 text-center">
      <HempLeaf className="size-20 text-forest-300" />
      <p className="eyebrow mt-6">{t('Error 404')}</p>
      <h1 className="mt-3 text-5xl font-semibold text-forest-50">{t('Page not found')}</h1>
      <p className="mt-3 max-w-sm text-forest-300">{t('Looks like this leaf blew away. Back to the shop?')}</p>
      <Link to={ROUTES.catalog} className="mt-8">
        <Button size="lg">
          <ArrowLeft className="size-4" /> {t('Browse the shop')}
        </Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
