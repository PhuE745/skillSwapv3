import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      // Sign Up with username
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // After signup, update the profile with the username
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: username })
          .eq('id', data.user.id)
        
        if (profileError) {
          console.error('Error updating username:', profileError)
        }
        
        // Automatically log in after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (loginError) {
          setError(loginError.message)
        } else {
          window.location.href = '/dashboard'
        }
      }
    } else {
      // Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/dashboard'
      }
    }
    setLoading(false)
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setUsername('')
    setEmail('')
    setPassword('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🔄</span>
          <h1 style={styles.title}>SkillSwap PH</h1>
        </div>
        <p style={styles.subtitle}>Exchange skills, not money</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Username (how others will see you)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          
          {error && <p style={styles.error}>{error}</p>}
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>
        
        <p style={styles.switchText}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={switchMode}
            style={styles.switchButton}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    margin: 0,
    fontSize: '28px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  button: {
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: '14px',
    background: '#fee2e2',
    padding: '10px',
    borderRadius: '8px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    marginLeft: '10px',
    fontWeight: '600',
  },
}

export default Login