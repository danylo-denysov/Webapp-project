import { useState } from 'react';
import { toast } from 'react-toastify';
import { Task } from './useTaskGroups';

export function useTasks(groupId: string,
                         onAdded?: (t: Task)=>void,
                         onDeleted?: (id: string)=>void) {

  const createTask = async (title: string, description: string) => {
    if (!title.trim() || !description.trim())
      return toast.error('All fields required');

    const res = await fetch('/api/tasks', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, description, groupId }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message ?? 'Failed to create task');
    toast.success('Task added');
    onAdded?.(data);
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method : 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok)
      return toast.error('Failed to delete');
    toast.success('Deleted');
    onDeleted?.(id);
  };

  return { createTask, deleteTask };
}
