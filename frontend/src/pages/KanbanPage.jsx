import { useEffect, useState } from 'react'
import api from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant'
import './KanbanPage.css'


const STATUSES = ['Applied','Shortlisted','Interview Scheduled','Offer Received','Rejected']
const COLORS   = { 'Applied':'#3b82f6','Shortlisted':'#f59e0b','Interview Scheduled':'#8b5cf6','Offer Received':'#10b981','Rejected':'#ef4444' }

export default function KanbanPage() {
  const [apps, setApps] = useState([])
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { 
    api.get('/applications/').then(r => {
      console.log('Apps loaded:', r.data)
      setApps(r.data || [])
      setLoading(false)
    }).catch(e => {
      console.error('Failed to load apps:', e)
      setError(e.response?.data?.detail || e.message)
      setLoading(false)
    }) 
  }, [])

  const moveStatus = async (id, newStatus) => {
    await api.put(`/applications/${id}`, { status: newStatus })
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  if (loading) return <div className="page-shell"><div className="empty-message"><h2>Loading Kanban...</h2></div></div>
  if (error) return (
    <div className="page-shell">
      <div className="error-card">
        <h1>Error loading Kanban</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-heading">
          <div className="kanban-heading">
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <span className="kanban-heading__title">Kanban Board</span>
              <span className="kanban-heading__badge">{apps.length} applications</span>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button onClick={() => navigate('/')} className="btn-back">← Dashboard</button>
        </div>
      </div>

      <div className="kanban-board">
        {STATUSES.map(status => {
          const col = apps.filter(a => a.status === status)
          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <span>{status}</span>
                <span className="kanban-count">{col.length}</span>
              </div>
              {col.map(a => (
                <div key={a.id} className="kanban-card lift-on-hover">
                  <div className="kanban-card-heading">
                    <p className="kanban-card-company">{a.company_name}</p>
                    <p className="kanban-card-role">{a.role}</p>
                  </div>
                  <select value={a.status} onChange={e => moveStatus(a.id, e.target.value)} className="kanban-select">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              ))}
              {col.length === 0 && <p className="kanban-empty">Empty</p>}
            </div>
          )   
        })}
      </div>
      <AIAssistant apps={apps} />
    </div>
  )
}
