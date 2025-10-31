import { useSortable } from '@dnd-kit/sortable';

export default function ListEndZone() {
  const {
    setNodeRef,
  } = useSortable({
    id: 'list-end-zone',
    data: {
      type: 'list-end-zone',
    },
  });

  return (
    <div ref={setNodeRef} style={{ minHeight: '20px', marginTop: '-20px' }} />
  );
}
