import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/adminDashboard'
import Interests from './components/Interests'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [needsInterests, setNeedsInterests] = useState(false)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        checkUserStatus(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        checkUserStatus(session.user.id)
      } else {
        setUserRole(null)
        setNeedsInterests(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserStatus = async (userId) => {
    try {
      // Get user role and interests
      const { data } = await supabase
        .from('profiles')
        .select('role, skills_wanted')
        .eq('id', userId)
        .single()
      
      const role = data?.role || 'client'
      setUserRole(role)
      
      // Check if needs to select interests (not admin and no skills_wanted)
      const hasInterests = data?.skills_wanted && data.skills_wanted.length > 0
      setNeedsInterests(role !== 'admin' && !hasInterests)
      
    } catch (error) {
      console.error('Error checking user:', error)
      setUserRole('client')
      setNeedsInterests(true)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Reset all states
    setSession(null)
    setUserRole(null)
    setNeedsInterests(false)
  }

  const handleInterestsComplete = () => {
    setNeedsInterests(false)
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  // Not logged in - show login page
  if (!session) {
    return <Login />
  }

  // Logged in but needs to select interests


  // Logged in and is admin
  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  // Logged in and regular user
  return <Dashboard onLogout={handleLogout} />
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
  },
}

export default App