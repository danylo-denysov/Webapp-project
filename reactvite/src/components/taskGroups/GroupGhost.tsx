import { TaskGroup as TG } from '../../types/task';
import './TaskGroup.css';
import './GroupGhost.css';

export default function GroupGhost({ group }: { group: TG }) {
  return (
    <div className="group-ghost">
      <header className="group-header">
        <span className="group-name">{group.name}</span>
      </header>
      <div className="tasks-scroll">
        {group.tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="ghost-task-card">
            <div className="task-title">{task.title}</div>
            <div className="task-desc">{task.description}</div>
          </div>
        ))}
        {group.tasks.length > 3 && (
          <div className="ghost-task-more">
            +{group.tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
