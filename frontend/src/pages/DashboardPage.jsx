import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant'

const COLORS = ['#eab308', '#22c55e', '#6366f1', '#14b8a6', '#f97316']
const STATUS_COLORS = {
  Applied: '#facc15',
  Shortlisted: '#22c55e',
  'Interview Scheduled': '#6366f1',
  'Offer Received': '#14b8a6',
  Rejected: '#f97316',
}

const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'Job applications' },
  { label: 'Archive' },
  { label: 'Documents' },
  { label: 'Tasks' },
  { label: 'AI tools' },
]

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [apps, setApps] = useState([])
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/analytics/summary')
      .then(r => setSummary(r.data || null))
      .catch(e => { console.error('Summary error:', e); setSummary(null) })
    api.get('/applications')
      .then(r => setApps(Array.isArray(r.data) ? r.data : []))
      .catch(e => { console.error('Apps error:', e); setApps([]) })
  }, [])

  const statusSummary = Object.entries(summary?.by_status || {}).map(([name, value]) => ({ name, value }))

  const weeklyData = apps.reduce((acc, a) => {
    const week = new Date(a.applied_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const existing = acc.find(x => x.week === week)
    if (existing) existing.count++
    else acc.push({ week, count: 1 })
    return acc
  }, []).slice(-8)

  const averageDays = apps.length
    ? Math.round(apps.reduce((sum, a) => sum + Math.max(1, Math.round((Date.now() - new Date(a.applied_date).getTime()) / 86400000)), 0) / apps.length)
    : 0

  const latestApps = apps.slice(0, 6)

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 120 120" aria-hidden="true" role="img">
              <defs>
                <linearGradient id="logo-hand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#111827" />
                  <stop offset="100%" stopColor="#323232" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#d1d5db" strokeWidth="4" />
              <path d="M38 55c0-10 6-20 14-24 6-3 12-1 17 3 2 1 4 4 3 6l-1 3a3 3 0 0 1-4 2c-3-1-7-1-10 1s-6 5-6 9v12c0 7 5 12 11 12s11-5 11-12V51c0-2 1-4 3-5 4-2 9-1 11 4 1 3 0 5-2 8l-9 17c-3 6-9 10-16 10-11 0-19-8-19-19v-6Z" fill="url(#logo-hand-gradient)" />
              <path d="M66 66c0 4-1 6-4 6s-4-2-4-6v-20c0-4 1-6 4-6s4 2 4 6v20Z" fill="#10b981" />
            </svg>
          </div>
          <div className="brand-info">
            <strong className="brand-title">Job Trackings</strong>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.label}
              className={item.label === activeNav ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => {
                setActiveNav(item.label)
                if (item.label === 'AI tools') {
                  setAssistantOpen(true)
                } else {
                  setAssistantOpen(false)
                }
                if (item.label === 'Job applications') {
                  navigate('/applications')
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => navigate('/')}>&larr; Back</button>
          <button className="sidebar-link danger" onClick={logout}>Signout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-top">
          <div className="dashboard-heading">
            <p className="dashboard-section-label">DASHBOARD</p>
            <h1>Overview</h1>
          </div>
          <div className="top-actions">
            <button className="btn-secondary" onClick={() => navigate('/applications')}>Applications</button>
            <button className="btn-secondary" onClick={() => navigate('/kanban')}>Kanban</button>
          </div>
        </header>

        <section className="card-row">
          <article className="status-card">
            <div className="status-card-header">
              <span>Current status</span>
              <strong>{summary?.total ?? 0}</strong>
            </div>
            <div className="status-chart">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusSummary} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4}>
                    {statusSummary.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="status-detail">Applications per status</div>
          </article>

          <article className="status-card">
            <div className="status-card-header">
              <span>Tasks</span>
              <strong>{summary?.by_status?.['Interview Scheduled'] ?? 0}</strong>
            </div>
            <div className="status-chart small">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={[{ name: 'Scheduled', value: summary?.by_status?.['Interview Scheduled'] ?? 0 }, { name: 'Remaining', value: Math.max(0, (summary?.total ?? 0) - (summary?.by_status?.['Interview Scheduled'] ?? 0)) }]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={64} paddingAngle={4}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="status-detail">Latest monitoring tasks status</div>
          </article>

          <article className="status-card">
            <div className="status-card-header">
              <span>Response time</span>
              <strong>{averageDays} days</strong>
            </div>
            <div className="status-chart small">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={[{ name: 'Average', value: Math.max(1, Math.min(averageDays, 12)) }, { name: 'Rest', value: 12 - Math.max(1, Math.min(averageDays, 12)) }]} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4}>
                    <Cell fill="#38bdf8" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="status-detail">Average days since application</div>
          </article>
        </section>

        <section className="dashboard-table-card">
          <header className="table-card-header">
            <div>
              <h2>Latest updates</h2>
              <p>Track recent application progress and stage updates.</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/applications')}>View all</button>
          </header>

          <div className="table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job title</th>
                  <th>Organisation</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latestApps.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-row">No applications available</td>
                  </tr>
                ) : latestApps.map((app) => (
                  <tr key={app.id}>
                    <td>{app.role || 'Unknown position'}</td>
                    <td>{app.company_name || 'Unknown'}</td>
                    <td><span className={`table-tag ${app.status?.toLowerCase().replace(/\s+/g, '-')}`}>{app.status}</span></td>
                    <td>{app.applied_date ? new Date(app.applied_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <AIAssistant apps={apps} initialOpen={assistantOpen} />
    </div>
  )
}
