import clsx from 'clsx'

const STATUS_LABELS = {
  en_route:  'En Route',
  arrived:   'Arrived',
  delivered: 'Delivered',
  failed:    'Failed',
}

export function StatusBadge({ status, className }) {
  return (
    <span className={clsx(`status-${status}`, className)}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export function TrustBadge({ score, className }) {
  const style =
    score >= 90
      ? { bg: 'rgba(13,115,119,0.08)', border: 'rgba(13,115,119,0.2)', color: '#0d7377' }
      : score >= 75
      ? { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)', color: '#d97706' }
      : { bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.18)', color: '#dc2626' }

  return (
    <span
      className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold', className)}
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
    >
      ⭐ {score}
    </span>
  )
}
