import { useCallback } from 'react'

export function useReorderTaskGroups(boardId?: string, onDone?: () => void) {
  return useCallback(async (ids: string[]) => {
    if (!boardId) return
    const token = localStorage.getItem('token')
    await fetch(`/api/boards/${boardId}/task-groups/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    }).then(r => {
      if (!r.ok) throw new Error('Failed to save order')
    })
    onDone?.()
  }, [boardId, onDone])
}
