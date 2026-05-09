import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'
import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'
import DashboardPage   from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import KanbanPage      from './pages/KanbanPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
          <Route path="/kanban" element={<PrivateRoute><KanbanPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
