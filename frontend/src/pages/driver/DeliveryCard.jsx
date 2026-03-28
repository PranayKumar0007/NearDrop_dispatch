import { MapPin, Package, User, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { DeliveryMap } from '../../components/maps/LeafletMap'

const DELIVERY_COORDS = { lat: 17.4435, lng: 78.3772 }

const STATUS_STRIPE = {
  en_route:  'linear-gradient(90deg, #d97706, #fbbf24)',
  arrived:   'linear-gradient(90deg, #2563eb, #60a5fa)',
  delivered: 'linear-gradient(90deg, #0d7377, #34d399)',
  failed:    'linear-gradient(90deg, #dc2626, #f87171)',
}

export default function DeliveryCard({ delivery, onStatusChange }) {
  if (!delivery) return null

  const isFailed = delivery.status === 'failed'
  const isDelivered = delivery.status === 'delivered'
  const isFinal = isFailed || isDelivered

  const statusOrder = ['en_route', 'arrived', 'delivered']
  const currentIdx = statusOrder.indexOf(delivery.status)
  const nextStatus = statusOrder[currentIdx + 1]

  return (
    <div className="delivery-card animate-fade-in">
      {/* Stripe */}
      <div style={{ height: 3, background: STATUS_STRIPE[delivery.status] ?? STATUS_STRIPE.en_route }} />

      {/* Map */}
      <div style={{ height: 420 }}>
        <DeliveryMap lat={DELIVERY_COORDS.lat} lng={DELIVERY_COORDS.lng} height="420px" />
      </div>



      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Address + status */}
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(37,99,235,0.08)' }}
          >
            <MapPin className="w-4 h-4" style={{ color: '#2563eb' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: '#111117' }}>{delivery.address}</p>
            <div className="mt-1.5">
              <StatusBadge status={delivery.status} />
            </div>
          </div>
        </div>

        {/* Meta pill row */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl flex-wrap"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6b6b7b' }}>
            <User className="w-3 h-3" />
            <span>{delivery.recipient_name}</span>
          </div>
          <div className="w-px h-3" style={{ background: 'rgba(0,0,0,0.1)' }} />
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6b6b7b' }}>
            <Package className="w-3 h-3" />
            <span className="capitalize">{delivery.package_size}</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span>{delivery.weight_kg}kg</span>
          </div>
          <p className="ml-auto font-mono text-[10px]" style={{ color: '#d1d5db' }}>
            #{delivery.order_id}
          </p>
        </div>

        {/* Actions */}
        {!isFinal ? (
          <div className="flex gap-2">
            {nextStatus && (
              <button
                id={`btn-status-${delivery.status}`}
                onClick={() => onStatusChange(nextStatus)}
                className="btn-primary flex-1 text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                {nextStatus === 'arrived' ? 'Mark Arrived' : 'Mark Delivered'}
              </button>
            )}
            <button
              id="btn-fail-delivery"
              onClick={() => onStatusChange('failed')}
              className="btn-danger text-sm px-4"
            >
              <AlertTriangle className="w-4 h-4" />
              Fail
            </button>
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: isDelivered ? 'rgba(5,150,105,0.07)' : 'rgba(220,38,38,0.07)',
              border: `1px solid ${isDelivered ? 'rgba(5,150,105,0.18)' : 'rgba(220,38,38,0.16)'}`,
              color: isDelivered ? '#059669' : '#dc2626',
            }}
          >
            {isDelivered
              ? <><CheckCircle className="w-4 h-4" /> Delivered Successfully</>
              : <><AlertTriangle className="w-4 h-4" /> Delivery Failed — Rerouting</>
            }
          </div>
        )}
      </div>
    </div>
  )
}
