import './TaskCard.css';
import cross from '../../assets/close.svg';
import chat from '../../assets/chat.svg';
import type { Task } from '../../types/task';

export default function TaskCard({
  task, onDelete, canEdit, onClick,
}: {
  task: Task;
  onDelete: (id:string)=>void;
  canEdit: boolean;
  onClick?: () => void;
}) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  // Calculate total items across all lists
  const getTotalItemsCount = () => {
    if (!task.taskLists || task.taskLists.length === 0) return null;

    const total = task.taskLists.reduce((sum, list) => sum + list.items.length, 0);
    const completed = task.taskLists.reduce((sum, list) => {
      return sum + list.items.filter(item => item.completed).length;
    }, 0);

    return { completed, total };
  };

  const itemsCount = getTotalItemsCount();
  const allCompleted = itemsCount && itemsCount.total > 0 && itemsCount.completed === itemsCount.total;
  const commentsCount = task.comments?.length || 0;

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-title">{task.title}</div>
      {(itemsCount && itemsCount.total > 0) || commentsCount > 0 ? (
        <div className="task-indicators">
          {itemsCount && itemsCount.total > 0 && (
            <div className="task-items-indicator">
              <div className={`task-items-indicator__checkbox ${allCompleted ? 'task-items-indicator__checkbox--checked' : ''}`}></div>
              <span className="task-items-indicator__count">
                {itemsCount.completed}/{itemsCount.total}
              </span>
            </div>
          )}
          {commentsCount > 0 && (
            <div className="task-comments-indicator">
              <img src={chat} alt="comments" className="task-comments-indicator__icon"/>
              <span className="task-comments-indicator__count">
                {commentsCount}
              </span>
            </div>
          )}
        </div>
      ) : null}
      {canEdit && (
        <button className="task-delete" onClick={handleDeleteClick}>
          <img src={cross} alt="delete"/>
        </button>
      )}
    </div>
  );
}
