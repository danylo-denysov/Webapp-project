import { useSortable } from '@dnd-kit/sortable';

interface GroupPlaceholderProps {
  groupId: string;
}

export default function GroupPlaceholder({ groupId }: GroupPlaceholderProps) {
  const {
    setNodeRef,
    over,
    active,
  } = useSortable({
    id: `placeholder-${groupId}`,
    data: {
      type: 'group-placeholder',
      groupId: groupId,
    },
  });

  const isOverCurrent = over?.id === `placeholder-${groupId}`;
  const activeData = active?.data.current;
  const isGroupBeingDragged = activeData?.type === 'group';
  const showPlaceholder = isOverCurrent && isGroupBeingDragged;

  return (
    <div
      ref={setNodeRef}
      style={{
        width: showPlaceholder ? 'var(--group-width)' : 0,
        minWidth: showPlaceholder ? 'var(--group-width)' : 0,
        transition: 'width 0.2s ease, min-width 0.2s ease',
        marginRight: showPlaceholder ? '2rem' : 0,
        flex: showPlaceholder ? '0 0 var(--group-width)' : '0 0 0',
      }}
    >
      {showPlaceholder && (
        <div style={{
          width: 'var(--group-width)',
          height: '100%',
          minHeight: '300px',
          borderRadius: '8px',
          backgroundColor: 'rgba(90, 200, 250, 0.15)',
          border: '2px dashed rgba(90, 200, 250, 0.4)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}
