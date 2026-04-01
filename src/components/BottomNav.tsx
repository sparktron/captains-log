import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Ship, Users } from 'lucide-react'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log', icon: BookOpen, label: 'Log' },
  { to: '/boats', icon: Ship, label: 'Boats' },
  { to: '/crew', icon: Users, label: 'Crew' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center py-2 gap-0.5 min-h-[3.5rem] text-xs transition-colors ${
                isActive
                  ? 'text-sky-400'
                  : 'text-slate-400 active:text-slate-200'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
