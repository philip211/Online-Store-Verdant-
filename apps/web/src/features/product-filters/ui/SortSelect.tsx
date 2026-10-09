import { ArrowUpDown } from 'lucide-react'
import { SORT_LABELS, type SortOption } from '@/entities/product'
import { useT } from '@/shared/i18n'
import { Select } from '@/shared/ui'

export function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const { t } = useT()
  const options = (Object.keys(SORT_LABELS) as SortOption[]).map((k) => ({ value: k, label: t(SORT_LABELS[k]) }))
  return (
    <Select
      value={value}
      options={options}
      onChange={onChange}
      ariaLabel={t('Sort by')}
      align="end"
      icon={<ArrowUpDown className="size-4 text-forest-400" />}
    />
  )
}
