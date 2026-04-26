import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Interests from './Interests'

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [showInterests, setShowInterests] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermSkill, setSearchTermSkill] = useState('')
  const [allSkills, setAllSkills] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchResultsSkill, setSearchResultsSkill] = useState([])
  const [showAddInterest, setShowAddInterest] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      loadProfile(data.user?.id)
    })
    fetchAllSkills()
    fetchAllCategories()
  }, [])

  const fetchAllSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
    if (data) {
      setAllSkills(data)
    }
  }

  const fetchAllCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
    if (data) {
      setAllCategories(data)
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
      if (data.role === 'admin') {
        window.location.href = '/admin'
        return
      }
      const needsInterests = data.skills_wanted === null || data.skills_wanted === undefined
      setShowInterests(needsInterests)
    }
  }

  // Search for Interests by CATEGORY
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([])
    } else {
      // First find categories that match the search term
      const matchingCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      // Then find skills from those categories
      const categoryNames = matchingCategories.map(cat => cat.name)
      const results = allSkills.filter(skill =>
        categoryNames.includes(skill.category)
      )
      setSearchResults(results)
    }
  }, [searchTerm, allSkills, allCategories])

  // Search for Skills Offered by CATEGORY
  useEffect(() => {
    if (searchTermSkill.trim() === '') {
      setSearchResultsSkill([])
    } else {
      // First find categories that match the search term
      const matchingCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTermSkill.toLowerCase())
      )
      
      // Then find skills from those categories
      const categoryNames = matchingCategories.map(cat => cat.name)
      const results = allSkills.filter(skill =>
        categoryNames.includes(skill.category)
      )
      setSearchResultsSkill(results)
    }
  }, [searchTermSkill, allSkills, allCategories])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = '/'
    }
  }

  const addInterest = async (skillName) => {
    const currentInterests = profile?.skills_wanted || []
    if (!currentInterests.includes(skillName)) {
      const newInterests = [...currentInterests, skillName]
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('profiles')
        .update({ skills_wanted: newInterests })
        .eq('id', user.id)
      
      setProfile({ ...profile, skills_wanted: newInterests })
      setShowAddInterest(false)
      setSearchTerm('')
    }
  }

  const addSkill = async (skillName) => {
    const currentSkills = profile?.skills_offered || []
    if (!currentSkills.includes(skillName)) {
      const newSkills = [...currentSkills, skillName]
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('profiles')
        .update({ skills_offered: newSkills })
        .eq('id', user.id)
      
      setProfile({ ...profile, skills_offered: newSkills })
      setShowAddSkill(false)
      setSearchTermSkill('')
    }
  }

  const removeInterest = async (skillName) => {
    const currentInterests = profile?.skills_wanted || []
    const newInterests = currentInterests.filter(s => s !== skillName)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('profiles')
      .update({ skills_wanted: newInterests })
      .eq('id', user.id)
    
    setProfile({ ...profile, skills_wanted: newInterests })
  }

  const removeSkill = async (skillName) => {
    const currentSkills = profile?.skills_offered || []
    const newSkills = currentSkills.filter(s => s !== skillName)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('profiles')
      .update({ skills_offered: newSkills })
      .eq('id', user.id)
    
    setProfile({ ...profile, skills_offered: newSkills })
  }

  if (showInterests) {
    return <Interests onComplete={() => setShowInterests(false)} />
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>SkillSwap PH</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
      
      <div style={styles.content}>
        <h2>Welcome, {profile?.username || user?.email}!</h2>

        {/* Skills You Offer Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>Skills You Offer</h3>
            <button 
              onClick={() => setShowAddSkill(!showAddSkill)} 
              style={styles.addButton}
            >
              + Add Skill
            </button>
          </div>
          <div style={styles.skillBox}>
            {profile?.skills_offered?.length > 0 ? (
              <div style={styles.skillsList}>
                {profile.skills_offered.map(skill => (
                  <span key={skill} style={styles.skillTag}>
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      style={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.noSkillsText}>No skills offered yet. Click "Add Skill" to list what you can teach.</p>
            )}
          </div>
        </div>

        {/* Add Skill Search - by Category */}
        {showAddSkill && (
          <div style={styles.addInterestSection}>
            <input
              type="text"
              placeholder="🔍 Search by category (e.g., Coding, Music, Fitness)..."
              value={searchTermSkill}
              onChange={(e) => setSearchTermSkill(e.target.value)}
              style={styles.searchInput}
            />
            {searchTermSkill && (
              <div style={styles.searchResultsCompact}>
                {searchResultsSkill.length === 0 ? (
                  <p style={styles.noResults}>No skills found in this category</p>
                ) : (
                  searchResultsSkill.map(skill => (
                    <div 
                      key={skill.id} 
                      style={styles.skillOption}
                      onClick={() => addSkill(skill.name)}
                    >
                      <span>{skill.icon || '📚'}</span>
                      <span style={styles.skillOptionName}>{skill.name}</span>
                      <span style={styles.skillOptionCategory}>{skill.category}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Skills You Want to Learn Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>Skills You Want to Learn</h3>
            <button 
              onClick={() => setShowAddInterest(!showAddInterest)} 
              style={styles.addButton}
            >
              + Add Interest
            </button>
          </div>
          <div style={styles.skillBox}>
            {profile?.skills_wanted?.length > 0 ? (
              <div style={styles.skillsList}>
                {profile.skills_wanted.map(skill => (
                  <span key={skill} style={styles.skillTag}>
                    {skill}
                    <button 
                      onClick={() => removeInterest(skill)}
                      style={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.noSkillsText}>No interests added yet. Click "Add Interest" to find skill partners.</p>
            )}
          </div>
        </div>

        {/* Add Interest Search - by Category */}
        {showAddInterest && (
          <div style={styles.addInterestSection}>
            <input
              type="text"
              placeholder="🔍 Search by category (e.g., Coding, Music, Fitness)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <div style={styles.searchResultsCompact}>
                {searchResults.length === 0 ? (
                  <p style={styles.noResults}>No skills found in this category</p>
                ) : (
                  searchResults.map(skill => (
                    <div 
                      key={skill.id} 
                      style={styles.skillOption}
                      onClick={() => addInterest(skill.name)}
                    >
                      <span>{skill.icon || '📚'}</span>
                      <span style={styles.skillOptionName}>{skill.name}</span>
                      <span style={styles.skillOptionCategory}>{skill.category}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Your Stats Section */}
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
  section: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  addButton: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  skillBox: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  skillTag: {
    background: '#667eea',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  removeTag: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 4px',
  },
  noSkillsText: {
    color: '#999',
    textAlign: 'center',
    padding: '10px',
  },
  addInterestSection: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    outline: 'none',
  },
  searchResultsCompact: {
    marginTop: '10px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  skillOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  skillOptionName: {
    fontWeight: 'bold',
    flex: 1,
  },
  skillOptionCategory: {
    fontSize: '12px',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
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