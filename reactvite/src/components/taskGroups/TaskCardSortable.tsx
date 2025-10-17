import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { Task } from '../../types/task';

export default function TaskCardSortable({
  task,
  onDelete,
  canEdit,
  groupId,
}: {
  task: Task;
  onDelete: (id: string) => void;
  canEdit: boolean;
  groupId: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
  });

  // Measure card height
  useEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [task.title, task.description]);

  // Check if another task is being dragged over this one
  const isOverCurrent = over?.id === task.id;
  const activeData = active?.data.current;
  const isTaskBeingDragged = activeData?.type === 'task';
  const draggedTaskHeight = activeData?.cardHeight || 80;

  // Show placeholder when a task is being dragged over this one (but not the same task or when this is being dragged)
  const showPlaceholder = isOverCurrent && isTaskBeingDragged && active?.id !== task.id && !isDragging;

  const style: React.CSSProperties = {
    // Disable transform completely - we'll use custom placeholder instead
    transform: 'none',
    transition: 'none',
    width: '100%',
    position: 'relative',
    marginBottom: isDragging ? 0 : '0.5rem',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
        height: isDragging ? 0 : 'auto',
        overflow: isDragging ? 'hidden' : 'visible',
      }}>
        <TaskCard task={task} onDelete={onDelete} canEdit={canEdit} />
      </div>
    </div>
  );
}
