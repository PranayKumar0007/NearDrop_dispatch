import { MapPin, Package, User } from 'lucide-react'
import { StatusBadge } from '../../components/ui/Badge'
import { DeliveryMap } from '../../components/maps/LeafletMap'

// Hyderabad delivery coordinates
const DELIVERY_COORDS = { lat: 17.4239, lng: 78.4738 }

export default function DeliveryCard({ delivery, onStatusChange }) {
  if (!delivery) return null

  const statusOrder = ['en_route', 'arrived', 'delivered', 'failed']
  const currentIdx  = statusOrder.indexOf(delivery.status)
  const nextStatus  = statusOrder[currentIdx + 1]

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-card">
      {/* Map */}
      <DeliveryMap lat={DELIVERY_COORDS.lat} lng={DELIVERY_COORDS.lng} height="180px" />

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <p className="text-sm text-white/80 leading-snug">{delivery.address}</p>
          </div>
          <StatusBadge status={delivery.status} className="shrink-0" />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {delivery.recipient_name}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {delivery.package_size} · {delivery.weight_kg}kg
          </span>
          <span className="font-mono text-white/30">#{delivery.order_id}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          {delivery.status !== 'delivered' && delivery.status !== 'failed' && nextStatus && nextStatus !== 'failed' && (
            <button
              id={`btn-status-${nextStatus}`}
              onClick={() => onStatusChange(nextStatus)}
              className="btn-primary flex-1 text-sm"
            >
              Mark {nextStatus === 'arrived' ? 'Arrived' : 'Delivered'} ✓
            </button>
          )}
          {delivery.status !== 'delivered' && delivery.status !== 'failed' && (
            <button
              id="btn-fail-delivery"
              onClick={() => onStatusChange('failed')}
              className="btn-danger text-sm px-4"
            >
              Fail
            </button>
          )}
          {(delivery.status === 'delivered' || delivery.status === 'failed') && (
            <div className={`w-full text-center text-sm font-medium py-2 rounded-xl ${
              delivery.status === 'delivered'
                ? 'text-teal-400 bg-teal-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}>
              {delivery.status === 'delivered' ? '✓ Delivery Complete' : '✕ Delivery Failed'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
