import clsx from 'clsx'

const STATUS_LABELS = {
  en_route:  'En Route',
  arrived:   'Arrived',
  delivered: 'Delivered',
  failed:    'Failed',
}

export function StatusBadge({ status, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        `status-${status}`,
        className,
      )}
    >
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'en_route'  && 'bg-amber-400',
        status === 'arrived'   && 'bg-blue-400',
        status === 'delivered' && 'bg-teal-400',
        status === 'failed'    && 'bg-red-400',
      )} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export function TrustBadge({ score, className }) {
  const color =
    score >= 90 ? 'text-teal-300 bg-teal-500/20 border-teal-500/30' :
    score >= 75 ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' :
                  'text-red-300 bg-red-500/20 border-red-500/30'

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold',
      color,
      className,
    )}>
      ⭐ {score}
    </span>
  )
}
