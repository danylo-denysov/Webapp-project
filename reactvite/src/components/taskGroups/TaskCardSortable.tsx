import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import type { Task } from '../../types/task';
import { BoardUserRole } from '../../types/boardUser';

export default function TaskCardSortable({
  task,
  onDelete,
  canEdit,
  groupId,
  onClick,
  userRole,
}: {
  task: Task;
  onDelete: (id: string) => void;
  canEdit: boolean;
  groupId: string;
  onClick?: () => void;
  userRole: string | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);
  const canDrag = userRole === BoardUserRole.OWNER || userRole === BoardUserRole.EDITOR;

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    over,
    active,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      taskId: task.id,
      groupId: groupId,
      cardHeight: cardHeight,
    },
    disabled: !canDrag,
  });

  const itemsCount = task.taskLists?.reduce((sum, list) => sum + list.items.length, 0) || 0;
  const commentsCount = task.comments?.length || 0;

  useEffect(() => {
    if (cardRef.current) {
      requestAnimationFrame(() => {
        if (cardRef.current) {
          setCardHeight(cardRef.current.offsetHeight);
        }
      });
    }
  }, [task.title, itemsCount, commentsCount]);

  const isOverCurrent = over?.id === task.id;
  const activeData = active?.data.current;
  const isTaskBeingDragged = activeData?.type === 'task';
  const draggedTaskHeight = activeData?.cardHeight || 80;
  const showPlaceholder = isOverCurrent && isTaskBeingDragged && active?.id !== task.id && !isDragging;

  const style: React.CSSProperties = {
    transform: 'none',
    transition: 'none',
    width: '100%',
    position: 'relative',
    maxHeight: isDragging ? 0 : undefined,
    overflow: isDragging ? 'hidden' : 'visible',
    marginTop: isDragging ? '-0.5rem' : undefined,
    cursor: canDrag ? 'grab' : 'default',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(canDrag ? listeners : {})}>
      {showPlaceholder && (
        <div style={{
          height: `${draggedTaskHeight}px`,
          borderRadius: '6px',
          backgroundColor: 'rgba(90, 200, 250, 0.15)',
          border: '2px dashed rgba(90, 200, 250, 0.4)',
          pointerEvents: 'none',
          marginBottom: '0.5rem',
        }} />
      )}
      <div ref={cardRef} style={{
        visibility: isDragging ? 'hidden' : 'visible',
      }}>
        <TaskCard task={task} onDelete={onDelete} canEdit={canEdit} onClick={onClick} />
      </div>
    </div>
  );
}
