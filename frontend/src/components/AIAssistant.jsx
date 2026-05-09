import { useEffect, useState } from 'react'

const STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer Received', 'Rejected']

const formatApplicationDetail = (app) => {
  return `Company: ${app.company_name || 'Unknown'} | Role: ${app.role || 'Unknown'} | Status: ${app.status || 'Unknown'} | Applied: ${app.applied_date || 'N/A'}${app.location ? ` | Location: ${app.location}` : ''}${app.interview_date ? ` | Interview: ${app.interview_date}` : ''}${app.followup_date ? ` | Follow-up: ${app.followup_date}` : ''}${app.job_link ? ` | Link: ${app.job_link}` : ''}`
}

const searchAppsByKeywords = (apps, keywords) => {
  return apps.filter((app) => {
    const searchable = [app.company_name, app.role, app.location, app.status, app.notes, app.job_link]
      .filter(Boolean)
      .join(' | ')
      .toLowerCase()

    return keywords.every((keyword) => searchable.includes(keyword.toLowerCase()))
  })
}

const AIAssistant = ({ apps = [], initialOpen = false }) => {
  const [assistantOpen, setAssistantOpen] = useState(initialOpen)

  useEffect(() => {
    setAssistantOpen(initialOpen)
  }, [initialOpen])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Ask me about your applications using company names, roles, locations, statuses, or interview details.'
    }
  ])

  const summarizeApplications = () => {
    const total = apps.length
    const counts = apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
    return `You have ${total} applications: ${STATUSES.map((s) => `${counts[s] || 0} ${s.toLowerCase()}`).join(', ')}.`
  }

  const formatApplications = (list) => {
    if (!list.length) return 'No matching applications found.'
    return list.slice(0, 5).map(formatApplicationDetail).join('\n')
  }

  const processAssistantQuery = (query) => {
    const text = query.trim().toLowerCase()
    if (!text) return 'Please type a question about your applications.'
    if (!apps.length) return 'I need your application data to answer. Add your first job application and try again.'

    if (text.includes('how many') || text.includes('total') || (text.includes('applied') && text.includes('how many'))) {
      return summarizeApplications()
    }

    if ((text.includes('interview') && text.includes('date')) || text.includes('upcoming interview')) {
      const upcoming = apps.filter((a) => a.interview_date).sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date))
      return upcoming.length
        ? `Upcoming interviews:\n${upcoming.slice(0, 5).map(formatApplicationDetail).join('\n')}`
        : 'No interviews scheduled yet.'
    }

    if (text.includes('shortlisted')) {
      const shortlisted = apps.filter((a) => a.status === 'Shortlisted')
      return shortlisted.length
        ? `Shortlisted applications (${shortlisted.length}):\n${formatApplications(shortlisted)}`
        : 'You have no shortlisted applications yet.'
    }

    if (text.includes('offer') || text.includes('offer received')) {
      const offers = apps.filter((a) => a.status === 'Offer Received')
      return offers.length
        ? `Offers received (${offers.length}):\n${formatApplications(offers)}`
        : 'No offers received yet.'
    }

    if (text.includes('rejected')) {
      const rejected = apps.filter((a) => a.status === 'Rejected')
      return rejected.length
        ? `Rejected applications (${rejected.length}):\n${formatApplications(rejected)}`
        : 'No rejected applications yet.'
    }

    const searchTerms = text
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((word) => word.length > 2 && !['please', 'show', 'find', 'details', 'information', 'about', 'my', 'me', 'jobs', 'job', 'application', 'applications', 'related', 'for', 'of', 'on', 'in', 'the', 'and', 'or'].includes(word))

    if (searchTerms.length) {
      const matched = searchAppsByKeywords(apps, searchTerms)
      return matched.length
        ? `Related applications:\n${formatApplications(matched)}`
        : 'No applications matched your keywords. Try a different term like company name, role, status, or location.'
    }

    return 'I can help match applications by company, role, status, location, or any keyword in your notes. Try asking “Show applications for Google” or “Find shortlisted roles”.'
  }

  const sendAssistantQuery = (e) => {
    e.preventDefault()
    const question = assistantInput.trim()
    if (!question) return
    const answer = processAssistantQuery(question)
    setAssistantMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: answer }])
    setAssistantInput('')
  }

  return (
    <div className="ai-assistant-wrapper">
      {assistantOpen && (
        <div className="ai-assistant-panel">
          <div className="ai-assistant-header">
            <div className="assistant-logo">
              <svg viewBox="0 0 64 64" aria-hidden="true" role="img">
                <defs>
                  <linearGradient id="aiIconGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
                <rect x="10" y="10" width="44" height="44" rx="14" fill="url(#aiIconGrad)" />
                <circle cx="32" cy="28" r="10" fill="#ffffff" />
                <circle cx="26" cy="26" r="2.5" fill="#0f172a" />
                <circle cx="38" cy="26" r="2.5" fill="#0f172a" />
                <path d="M30 34l4 10 4-10" fill="#047857" />
                <path d="M28 38h8v2h-8z" fill="#065f46" />
              </svg>
            </div>
            <div>
              <div className="ai-assistant-title">AI Assistant</div>
              <div className="ai-assistant-subtitle">Ask about your applications</div>
            </div>
          </div>
          <div className="ai-assistant-messages">
            {assistantMessages.map((message, index) => (
              <div key={index} className={`assistant-message ${message.role}`}>
                <div>{message.text.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}</div>
              </div>
            ))}
          </div>
          <form className="ai-assistant-input-row" onSubmit={sendAssistantQuery}>
            <input
              className="ai-assistant-input"
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="Ask about your job applications..."
            />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        </div>
      )}
      <button className="ai-assistant-toggle" onClick={() => setAssistantOpen((prev) => !prev)}>
        {assistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
      </button>
    </div>
  )
}

export default AIAssistant
