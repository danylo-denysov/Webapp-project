import { useSortable } from '@dnd-kit/sortable';

export default function TaskGroupEndZone({ groupId }: { groupId: string }) {
  const {
    setNodeRef,
    over,
    active,
  } = useSortable({
    id: `end-zone-${groupId}`,
    data: {
      type: 'end-zone',
      groupId: groupId,
    },
  });

  const isOverCurrent = over?.id === `end-zone-${groupId}`;
  const activeData = active?.data.current;
  const isTaskBeingDragged = activeData?.type === 'task';
  const draggedTaskHeight = activeData?.cardHeight || 80;
  const showPlaceholder = isOverCurrent && isTaskBeingDragged;

  return (
    <div ref={setNodeRef} style={{ minHeight: '30px', marginTop: showPlaceholder ? 0 : '-30px' }}>
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
    </div>
  );
}
