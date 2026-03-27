import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BarChart2, Users, Truck, Settings } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Overview'   },
  { to: '/driver',        icon: Truck,            label: 'Driver App' },
  { to: '/hub',           icon: Map,              label: 'Hub App'    },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-navy-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-navy-900 font-black text-base shadow-glow-teal">
            N
          </div>
          <div>
            <p className="font-black text-white text-base leading-none">NearDrop</p>
            <p className="text-xs text-teal-400/80 mt-0.5">Operator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs text-white/25 font-semibold uppercase tracking-widest px-2 mb-3">Interfaces</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center text-xs font-bold text-navy-900">
            OP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">Operator</p>
            <p className="text-xs text-white/30 truncate">admin@neardrop.in</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
