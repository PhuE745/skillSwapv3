import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Interests from './Interests'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [showInterests, setShowInterests] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [allSkills, setAllSkills] = useState([])
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      loadProfile(data.user?.id)
    })
    fetchAllSkills()
  }, [])

  const fetchAllSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
    if (data) {
      setAllSkills(data)
    }
  }

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfile(data)
      // After loading profile, check if user is admin
      if (data.role === 'admin') {
        window.location.href = '/admin'
        return
      }
      // Check if user has interests selected
      if (!data.skills_wanted || data.skills_wanted.length === 0) {
        setShowInterests(true)
      }
    }
  }

  // Search skills when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([])
    } else {
      const results = allSkills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(results)
    }
  }, [searchTerm, allSkills])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Show Interests page if no interests selected
  if (showInterests) {
    return <Interests />
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>SkillSwap PH</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
      
      <div style={styles.content}>
        <h2>Welcome, {profile?.username || user?.email}!</h2>
        
        {/* Search Bar Section */}
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="🔍 Search for skills to learn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          
          {/* Search Results */}
          {searchTerm && (
            <div style={styles.searchResults}>
              <h3>Search Results for "{searchTerm}"</h3>
              {searchResults.length === 0 ? (
                <p style={styles.noResults}>No skills found</p>
              ) : (
                <div style={styles.resultsGrid}>
                  {searchResults.map(skill => (
                    <div key={skill.id} style={styles.resultCard}>
                      <span style={styles.resultIcon}>{skill.icon || '📚'}</span>
                      <div>
                        <div style={styles.resultName}>{skill.name}</div>
                        <div style={styles.resultCategory}>{skill.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3>Your Skills</h3>
          <div style={styles.skillBox}>
            <p>Offered: {profile?.skills_offered?.join(', ') || 'None yet'}</p>
            <p>Wanted: {profile?.skills_wanted?.join(', ') || 'None yet'}</p>
          </div>
        </div>

        <div style={styles.section}>
          <h3>Your Stats</h3>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNumber}>{profile?.total_exchanges || 0}</span>
              <span>Exchanges</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>{profile?.rating_avg || 0}</span>
              <span>Rating</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>{profile?.badges?.length || 0}</span>
              <span>Badges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  content: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  searchSection: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  searchResults: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  resultCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  resultIcon: {
    fontSize: '24px',
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  resultCategory: {
    fontSize: '12px',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
  section: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  skillBox: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-around',
  },
  stat: {
    textAlign: 'center',
  },
  statNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
  },
}

export default Dashboard