import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await signup(email, password)
    if (error) { setError(error.message); return }
    navigate('/login')
  }

  return (
    <div className="auth-layout">
      <div className="auth-form-panel">
        <div className="auth-brand">
          <div className="brand-mark">■</div>
          <div>
            <p className="brand-name">TheCubeFactory</p>
          </div>
        </div>

        <div className="auth-header">
          <h1>Create your account</h1>
          <p>Sign up and start tracking your applications instantly.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

          <label className="auth-label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
            required
          />

          <label className="auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Create a strong password"
            required
          />

          <button type="submit" className="btn-primary auth-submit">Sign up</button>
        </form>

        <p className="auth-footer">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="auth-aside">
        <div className="aside-content">
          <div className="aside-hero">
            <div className="hero-screen">
              <div className="hero-figure">
                <div className="figure-head"></div>
                <div className="figure-body"></div>
                <div className="figure-arm"></div>
              </div>
            </div>
          </div>
          <div className="aside-labels">
            <span className="aside-chip">Easy onboarding</span>
            <span className="aside-chip">Trusted security</span>
            <span className="aside-chip">Instant access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
