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
      // Fetch all skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
      
      if (skillsError) {
        console.error('Skills fetch error:', skillsError)
      }
      
      console.log('Skills data from DB:', skillsData)
      
      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
      
      if (categoriesError) {
        console.error('Categories fetch error:', categoriesError)
      }
      
      console.log('Categories data from DB:', categoriesData)
      
      // Group skills by category
      const skillsByCategory = {}
      skillsData?.forEach(skill => {
        const categoryName = skill.category
        if (!skillsByCategory[categoryName]) {
          skillsByCategory[categoryName] = []
        }
        skillsByCategory[categoryName].push(skill)
      })
      
      console.log('Skills by category:', skillsByCategory)
      
      // Build categories with their skills
      const categoriesWithSkills = categoriesData?.map(cat => ({
        ...cat,
        skills: skillsByCategory[cat.name] || []
      })) || []
      
      console.log('Final categories with skills:', categoriesWithSkills)
      
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
      alert('Error saving interests: ' + error.message)
    } else {
      alert('Interests saved successfully!')
      window.location.href = '/dashboard'
    }
    setSaving(false)
  }

  const skipInterests = async () => {
  // Save an empty array when skipping
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase
    .from('profiles')
    .update({ skills_wanted: [] })
    .eq('id', user.id)
  
  if (onComplete) onComplete()
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
          <p>Please check your database connection.</p>
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
                    <span>{skill.icon || '📚'}</span> {skill.name}
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