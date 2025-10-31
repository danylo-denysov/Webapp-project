import { useSortable } from '@dnd-kit/sortable';

export default function ListItemEndZone({ listId }: { listId: string }) {
  const {
    setNodeRef,
    over,
    active,
  } = useSortable({
    id: `list-end-zone-${listId}`,
    data: {
      type: 'list-end-zone',
      listId: listId,
    },
  });

  const isOverCurrent = over?.id === `list-end-zone-${listId}`;
  const activeData = active?.data.current;
  const isItemBeingDragged = activeData?.type === 'list-item';
  const draggedItemHeight = activeData?.itemHeight || 40;
  const showPlaceholder = isOverCurrent && isItemBeingDragged;

  return (
    <div ref={setNodeRef} style={{ minHeight: '20px', marginTop: showPlaceholder ? 0 : '-20px' }}>
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
    </div>
  );
}
