import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskGroup, { TaskGroupProps } from './TaskGroup'

export default function TaskGroupSortable(props: TaskGroupProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.group.id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    flex: '0 0 var(--group-width)',
    maxWidth: 'var(--group-width)', 
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskGroup {...props} />
    </div>
  )
}
