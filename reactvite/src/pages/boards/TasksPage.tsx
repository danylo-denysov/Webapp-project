import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import teamIcon from '../../assets/team.svg'
import listIcon from '../../assets/list.svg'
import './TasksPage.css'

export default function TasksPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const [boardName, setBoardName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    fetch(`/api/boards/${boardId}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login', { replace: true })
          throw new Error('Unauthorized')
        }
        if (!res.ok) throw new Error('Failed to load board')
        return res.json()
      })
      .then((b: { name: string }) => setBoardName(b.name))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [boardId, navigate])

  if (loading) return <div className="tasks-loading">Loading board…</div>

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title" data-text={boardName} >{boardName}</h1>

        <div className="tasks-header-actions">
          <button className="tasks-action-btn">
            <img src={teamIcon} alt="Team" /> Team
          </button>
          <Link to="/boards" className="tasks-action-btn tasks-boards-link">
            <img src={listIcon} alt="Boards" /> Boards
          </Link>
          <Avatar />
        </div>
      </div>

      <div className="tasks-divider" />

      {/* TODO: tasks rendering and management */}
    </div>
  )
}
