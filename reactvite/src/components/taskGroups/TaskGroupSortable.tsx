import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskGroup, { TaskGroupProps } from './TaskGroup'
import { BoardUserRole } from '../../types/boardUser'

export interface TaskGroupSortableProps extends TaskGroupProps {
  userRole: string | null;
  openTaskId?: string | null;
  onTaskModalClose?: () => void;
}

export default function TaskGroupSortable(props: TaskGroupSortableProps) {
  const canDrag = props.userRole === BoardUserRole.OWNER || props.userRole === BoardUserRole.EDITOR;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: props.group.id,
      data: {
        type: 'group',
        groupId: props.group.id,
      },
      disabled: !canDrag,
    })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    // Add margin to extend the droppable area
    marginLeft: '-1rem',
    marginRight: '-1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    cursor: canDrag ? 'grab' : 'default',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(canDrag ? listeners : {})}>
      <TaskGroup {...props} />
    </div>
  )
}
