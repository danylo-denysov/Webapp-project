import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { TaskListItem } from '../../types/task';
import closeIcon from '../../assets/close.svg';

interface ListItemSortableProps {
  item: TaskListItem;
  listId: string;
  onToggle: (itemId: string, completed: boolean) => void;
  onDelete: (itemId: string) => void;
  closeEditingStates: () => void;
}

export default function ListItemSortable({
  item,
  listId,
  onToggle,
  onDelete,
  closeEditingStates,
}: ListItemSortableProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [itemHeight, setItemHeight] = useState<number>(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    over,
    active,
  } = useSortable({
    id: item.id,
    data: {
      type: 'list-item',
      itemId: item.id,
      listId: listId,
      itemHeight: itemHeight,
    },
  });

  // Measure item height
  useEffect(() => {
    if (itemRef.current) {
      setItemHeight(itemRef.current.offsetHeight);
    }
  }, [item.content]);

  // Check if another item is being dragged over this one
  const isOverCurrent = over?.id === item.id;
  const activeData = active?.data.current;
  const isItemBeingDragged = activeData?.type === 'list-item';
  const draggedItemHeight = activeData?.itemHeight || 40;

  // Show placeholder when an item is being dragged over this one
  const showPlaceholder = isOverCurrent && isItemBeingDragged && active?.id !== item.id && !isDragging;

  const style: React.CSSProperties = {
    // Disable transform completely - we'll use custom placeholder instead
    transform: 'none',
    transition: 'none',
    width: '100%',
    position: 'relative',
    maxHeight: isDragging ? 0 : undefined,
    overflow: isDragging ? 'hidden' : 'visible',
    marginTop: isDragging ? '-8px' : undefined, // Compensate for parent's gap (8px)
    outline: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {showPlaceholder && (
        <div style={{
          height: `${draggedItemHeight}px`,
          borderRadius: '4px',
          backgroundColor: 'rgba(90, 200, 250, 0.15)',
          border: '2px dashed rgba(90, 200, 250, 0.4)',
          pointerEvents: 'none',
          marginBottom: '0.5rem',
        }} />
      )}
      <div
        ref={itemRef}
        className="task-detail-modal__list-item"
        style={{
          visibility: isDragging ? 'hidden' : 'visible',
        }}
      >
        <label
          className="task-detail-modal__checkbox-container"
          onClick={closeEditingStates}
        >
          <input
            type="checkbox"
            checked={item.completed}
            onChange={(e) => onToggle(item.id, e.target.checked)}
          />
          <span className="task-detail-modal__checkbox-custom"></span>
        </label>
        <span className={`task-detail-modal__item-content ${item.completed ? 'task-detail-modal__item-content--completed' : ''}`}>
          {item.content}
        </span>
        <button
          className="task-detail-modal__item-delete"
          onClick={() => {
            closeEditingStates();
            onDelete(item.id);
          }}
        >
          <img src={closeIcon} alt="Delete" />
        </button>
      </div>
    </div>
  );
}
