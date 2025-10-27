import './TaskCard.css';
import cross from '../../assets/close.svg';

export default function TaskCard({
  task, onDelete, canEdit, onClick,
}: {
  task: { id:string; title:string; description:string };
  onDelete: (id:string)=>void;
  canEdit: boolean;
  onClick?: () => void;
}) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-title">{task.title}</div>
      {canEdit && (
        <button className="task-delete" onClick={handleDeleteClick}>
          <img src={cross} alt="delete"/>
        </button>
      )}
    </div>
  );
}
