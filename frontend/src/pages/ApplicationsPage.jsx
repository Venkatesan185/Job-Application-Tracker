import { useEffect, useState } from 'react'
import api from '../api/axiosInstance'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import AIAssistant from '../components/AIAssistant'

const STATUSES = ['Applied','Shortlisted','Interview Scheduled','Offer Received','Rejected']
const EMPTY = { company_name:'', role:'', job_link:'', location:'', applied_date: new Date().toISOString().split('T')[0], status:'Applied', notes:'', interview_date:'', followup_date:'' }

export default function ApplicationsPage() {
  const [apps, setApps]         = useState([])
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

const load = () => {
    const params = {}
    if (filter) params.status = filter
    if (search) params.search = search
    api.get('/applications', { params })
      .then(r => setApps(Array.isArray(r.data) ? r.data : []))
      .catch(e => { console.error('Load error:', e); setApps([]) })
  }

  useEffect(() => { load() }, [filter, search])

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUserInfo(session?.user ?? null)
      } catch (error) {
        console.error('Session load error:', error)
      }
    }
    loadSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserInfo(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([,v]) => v !== ''))
      console.log('📝 Saving application:', payload)
      if (editing) {
        console.log('🔄 Updating ID:', editing)
        await api.put(`/applications/${editing}`, payload)
        console.log('✓ Update successful')
      } else {
        console.log('➕ Creating new application')
        await api.post('/applications', payload)
        console.log('✓ Create successful')
      }
      alert(`✓ Application ${editing ? 'updated' : 'saved'} successfully!`)
      setShowForm(false); setEditing(null); setForm(EMPTY); load()
    } catch (error) {
      console.error('❌ Save failed:', error)
      const msg = error.response?.data?.detail || error.message || error.code || 'Unknown error'
      const url = api.defaults.baseURL + (editing ? '/applications/' + editing : '/applications')
      alert(`Failed to save: ${msg}\n\nURL: ${url}\n\nCheck console (F12) for details.`)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this application?')) return
    await api.delete(`/applications/${id}`)
    load()
  }

  const edit = async (a) => {
    const id = a.id ?? a._id
    console.log('✏️ Edit requested for application:', a)
    if (!id) {
      console.error('Edit failed: missing application id', a)
      alert('Unable to edit this application because its ID is missing. Please refresh the page and try again.')
      return
    }

    try {
      const response = await api.get(`/applications/${id}`)
      const appData = response.data
      setForm({
        ...appData,
        applied_date: appData.applied_date?.split('T')[0] || '',
        interview_date: appData.interview_date?.split('T')[0] || '',
        followup_date: appData.followup_date?.split('T')[0] || ''
      })
      setEditing(id)
      setShowForm(true)
    } catch (error) {
      console.error('Edit load failed:', error)
      alert('Unable to load application details for editing. Please try again.')
    }
  }

  const statusColors = { 'Applied':'#3b82f6','Shortlisted':'#f59e0b','Interview Scheduled':'#8b5cf6','Offer Received':'#10b981','Rejected':'#ef4444' }
  const inp = { padding:'0.75rem 1rem', borderRadius:12, border:'1px solid #d1d5db', fontSize:14, width:'100%', boxSizing:'border-box', background:'#ffffff' }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-heading">
          <h1>Applications</h1>
          {userInfo ? (
            <p className="page-subtitle page-subtitle-signedin">
              Signed in as <strong>{userInfo.email}</strong>
              <span className="page-subtitle-meta">User ID: <span className="mono-text">{userInfo.id}</span></span>
            </p>
          ) : (
            <p className="page-subtitle page-subtitle-warning">Not signed in — please login again.</p>
          )}
        </div>
        <div className="page-actions">
          <button onClick={() => navigate('/')} className="btn-back">← Dashboard</button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY) }} className="btn-primary">+ Add Application</button>
        </div>
      </div>

      <div className="filter-row">
        <input placeholder="Search company, role or location" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, maxWidth: '420px' }} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, maxWidth: '240px' }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="app-form-card form-animate">
          <div className="form-heading">
            <h3>{editing ? 'Edit' : 'Add'} Application</h3>
            <p>Keep application details up to date and track interviews, follow-ups, and status changes.</p>
          </div>
          <form onSubmit={submit}>
            <div className="app-form-grid">
              {[['company_name','Company Name'],['role','Role'],['job_link','Job Link'],['location','Location'],['applied_date','Applied Date'],['interview_date','Interview Date'],['followup_date','Follow-up Date']].map(([k,l]) => (
                <div className="app-field" key={k}>
                  <label>{l}</label>
                  <input type={k.includes('date') ? 'date' : 'text'} value={form[k] || ''} onChange={e => setForm({...form,[k]:e.target.value})} style={{ ...inp }} required={k==='company_name'||k==='role'} />
                </div>
              ))}
              <div className="app-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form,status:e.target.value})} style={{ ...inp }}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="app-field app-field-full">
              <label>Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm({...form,notes:e.target.value})} rows={4} style={{ ...inp, minHeight: 120, resize:'vertical' }} />
            </div>
            <div className="page-actions" style={{ justifyContent:'flex-start', marginTop:'1rem' }}>
              <button type="submit" className="btn-primary">Save Application</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="app-list">
        {apps.length === 0 ? (
          <div className="empty-card">No applications yet. Add your first one to get started.</div>
        ) : apps.map(a => (
          <div key={a.id} className="app-card lift-on-hover">
            <div className="app-card-content">
              <div className="app-card-title">
                <strong>{a.company_name}</strong>
                <span>{a.role}</span>
              </div>
              <div className="app-card-meta">
                {a.location && <span>📍 {a.location}</span>}
                <span>Applied: {a.applied_date || 'N/A'}</span>
                {a.interview_date && <span>Interview: {a.interview_date}</span>}
                {a.followup_date && <span>Follow-up: {a.followup_date}</span>}
              </div>
            </div>
            <div className="app-card-side">
              <div className="app-chip" style={{ background: statusColors[a.status]+'22', color: statusColors[a.status] }}>{a.status}</div>
              <div className="app-card-actions">
                <button onClick={() => edit(a)} className="btn-edit">Edit</button>
                <button onClick={() => del(a.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIAssistant apps={apps} />
    </div>
  )
}
