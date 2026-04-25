import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [skills, setSkills] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    fetchUsers()
    fetchSkills()
    fetchExchanges()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  const fetchSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('*')
    if (data) setSkills(data)
  }

  const fetchExchanges = async () => {
    const { data } = await supabase
      .from('exchanges')
      .select('*, requester_id(username), provider_id(username)')
    if (data) setExchanges(data)
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Delete this user?')) {
      await supabase.from('profiles').delete().eq('id', userId)
      fetchUsers()
    }
  }

  const deleteSkill = async (skillId) => {
    if (window.confirm('Delete this skill?')) {
      await supabase.from('skills').delete().eq('id', skillId)
      fetchSkills()
    }
  }

  const makeAdmin = async (userId) => {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId)
    fetchUsers()
  }

   const handleLogout = async () => {
     await supabase.auth.signOut()
     window.location.href = '/'
   }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.backBtn}>
          Logout
        </button>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeTab : styles.tab}>
          Users ({users.length})
        </button>
        <button onClick={() => setActiveTab('skills')} style={activeTab === 'skills' ? styles.activeTab : styles.tab}>
          Skills ({skills.length})
        </button>
        <button onClick={() => setActiveTab('exchanges')} style={activeTab === 'exchanges' ? styles.activeTab : styles.tab}>
          Exchanges ({exchanges.length})
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'users' && (
          <table style={styles.table}>
            <thead>
              <tr><th>Username</th><th>Email</th><th>Role</th><th>Exchanges</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.role || 'client'}</td>
                  <td>{user.total_exchanges}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <button onClick={() => makeAdmin(user.id)} style={styles.adminBtn}>Make Admin</button>
                    )}
                    <button onClick={() => deleteUser(user.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'skills' && (
          <table style={styles.table}>
            <thead><tr><th>Skill</th><th>Category</th><th>Icon</th><th>Actions</th></tr></thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.category}</td>
                  <td>{skill.icon}</td>
                  <td>
                    <button onClick={() => deleteSkill(skill.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'exchanges' && (
          <table style={styles.table}>
            <thead><tr><th>Requester</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {exchanges.map(exchange => (
                <tr key={exchange.id}>
                  <td>{exchange.requester_id?.username || '-'}</td>
                  <td>{exchange.provider_id?.username || '-'}</td>
                  <td>{exchange.status}</td>
                  <td>{new Date(exchange.scheduled_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#1a1a2e', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '10px', padding: '20px', background: 'white', borderBottom: '1px solid #ddd' },
  tab: { padding: '10px 20px', background: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  activeTab: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  content: { padding: '20px' },
  table: { width: '100%', background: 'white', borderRadius: '10px', borderCollapse: 'collapse' },
  adminBtn: { padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }
}

export default AdminDashboard