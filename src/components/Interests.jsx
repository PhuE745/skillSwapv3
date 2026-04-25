import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Interests() {
  const [categories, setCategories] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategoriesAndSkills()
    loadUserInterests()
  }, [])

  const fetchCategoriesAndSkills = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
      
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
      
      console.log('Skills data:', skillsData) // Debug: check if skills load
      
      const categoriesWithSkills = categoriesData?.map(cat => ({
        ...cat,
        skills: skillsData?.filter(skill => skill.category === cat.name) || []
      })) || []
      
      setCategories(categoriesWithSkills)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const loadUserInterests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills_wanted')
        .eq('id', user.id)
        .single()
      
      if (profile?.skills_wanted && profile.skills_wanted.length > 0) {
        setSelectedSkills(profile.skills_wanted)
        // If already has interests, redirect to dashboard
        window.location.href = '/dashboard'
      }
    }
  }

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev => 
      prev.includes(skillName)
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    )
  }

  const saveInterests = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('profiles')
      .update({ skills_wanted: selectedSkills })
      .eq('id', user.id)
    
    if (error) {
      console.error('Error saving:', error)
    } else {
      window.location.href = '/dashboard'
    }
    setSaving(false)
  }

  const skipInterests = () => {
    window.location.href = '/dashboard'
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>What skills do you want to learn?</h1>
        <p>Select your interests to get personalized matches</p>
      </div>

      {categories.length === 0 ? (
        <div style={styles.noData}>
          <p>No categories or skills found in database.</p>
          <p>Please run the SQL script to insert categories and skills.</p>
        </div>
      ) : (
        categories.map(category => (
          <div key={category.id} style={styles.category}>
            <h2 style={styles.categoryTitle}>
              <span style={styles.categoryIcon}>{category.icon}</span>
              {category.name}
            </h2>
            <div style={styles.skillsGrid}>
              {category.skills.length === 0 ? (
                <p style={styles.noSkills}>No skills in this category yet</p>
              ) : (
                category.skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.name)}
                    style={selectedSkills.includes(skill.name) ? styles.skillSelected : styles.skillButton}
                  >
                    <span>{skill.icon}</span> {skill.name}
                  </button>
                ))
              )}
            </div>
          </div>
        ))
      )}

      <div style={styles.footer}>
        <p style={styles.selectedCount}>Selected: {selectedSkills.length} skills</p>
        <div>
          <button onClick={skipInterests} style={styles.skipBtn}>
            Skip
          </button>
          <button onClick={saveInterests} style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Interests'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px',
    paddingBottom: '100px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  category: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
  },
  categoryTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  categoryIcon: {
    fontSize: '24px',
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  skillButton: {
    padding: '10px 18px',
    background: '#f0f0f0',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  skillSelected: {
    padding: '10px 18px',
    background: '#667eea',
    color: 'white',
    border: '2px solid #667eea',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  },
  selectedCount: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#667eea',
  },
  saveBtn: {
    padding: '12px 24px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  skipBtn: {
    padding: '12px 24px',
    background: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '10px',
  },
  noSkills: {
    color: '#999',
    fontSize: '14px',
    padding: '10px 0',
  }
}

export default Interests