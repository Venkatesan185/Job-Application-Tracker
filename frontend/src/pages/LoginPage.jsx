import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await login(email, password)
    if (error) { setError(error.message); return }
    navigate('/')
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
          <h1>Welcome back</h1>
          <p>Please enter your details</p>
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
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Enter your password"
            required
          />

          <div className="auth-meta-row">
            <label className="auth-checkbox-row">
              <input type="checkbox" />
              <span>Remember for 30 days</span>
            </label>
            <a href="#" className="auth-link">Forgot password</a>
          </div>

          <button type="submit" className="btn-primary auth-submit">Sign in</button>

          <button type="button" className="btn-secondary auth-google" onClick={() => null}>
            <span className="google-mark">G</span>
            Sign in with Google
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
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
            <span className="aside-chip">24/7 support</span>
            <span className="aside-chip">Fast response</span>
            <span className="aside-chip">Secure access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
