import { useCallback } from 'react'
import { safe_fetch } from '../../utils/api'

export function useReorderTaskGroups(boardId?: string, onDone?: () => void) {
  return useCallback(async (ids: string[]) => {
    if (!boardId) return
    const res = await safe_fetch(`/api/boards/${boardId}/task-groups/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) throw new Error('Failed to save order')
    onDone?.()
  }, [boardId, onDone])
}
