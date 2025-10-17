import './TaskCard.css';
import cross from '../../assets/close.svg';

export default function TaskCard({
  task, onDelete, canEdit,
}: {
  task: { id:string; title:string; description:string };
  onDelete: (id:string)=>void;
  canEdit: boolean;
}) {
  return (
    <div className="task-card">
      <div className="task-title">{task.title}</div>
      <div className="task-desc">{task.description}</div>
      {canEdit && (
        <button className="task-delete" onClick={()=>onDelete(task.id)}>
          <img src={cross} alt="delete"/>
        </button>
      )}
    </div>
  );
}
