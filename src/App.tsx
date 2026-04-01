import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from '@/components/BottomNav'
import Dashboard from '@/pages/Dashboard'
import LogList from '@/pages/LogList'
import LogEntryPage from '@/pages/LogEntry'
import Boats from '@/pages/Boats'
import Crew from '@/pages/Crew'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh bg-slate-900 text-slate-100">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<LogList />} />
          <Route path="/log/new" element={<LogEntryPage />} />
          <Route path="/log/:id/edit" element={<LogEntryPage />} />
          <Route path="/boats" element={<Boats />} />
          <Route path="/crew" element={<Crew />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
