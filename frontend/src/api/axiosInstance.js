import axios from 'axios'
import { supabase } from '../supabaseClient'

const API_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
})

api.interceptors.request.use(async (config) => {
  console.log('Request:', config.method?.toUpperCase(), config.baseURL + config.url)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      console.log('✓ Auth token present:', session.access_token.substring(0, 20) + '...')
      config.headers.Authorization = `Bearer ${session.access_token}`
    } else {
      console.warn('⚠️ No Supabase session found - user may not be logged in')
    }
  } catch (e) {
    console.error('Session check error:', e.message)
  }
  return config
})

api.interceptors.response.use(
  response => {
    console.log('✓ Success:', response.status, response.data)
    return response
  },
  error => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export default api
