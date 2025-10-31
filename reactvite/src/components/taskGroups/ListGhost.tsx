import { TaskList } from '../../types/task';
import './ListGhost.css';

export default function ListGhost({ list }: { list: TaskList }) {
  const { completed, total } = getCompletionCount(list);

  return (
    <div className="list-ghost">
      <div className="list-ghost__header">
        <div className="list-ghost__info">
          <span className="list-ghost__progress">
            {completed}/{total}
          </span>
          <h4 className="list-ghost__name">{list.name}</h4>
        </div>
      </div>
      <div className="list-ghost__items">
        {list.items.slice(0, 3).map((item) => (
          <div key={item.id} className="list-ghost__item">
            <span className={`list-ghost__item-content ${item.completed ? 'list-ghost__item-content--completed' : ''}`}>
              {item.content}
            </span>
          </div>
        ))}
        {list.items.length > 3 && (
          <div className="list-ghost__more">
            +{list.items.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

function getCompletionCount(list: TaskList) {
  const completed = list.items.filter(i => i.completed).length;
  const total = list.items.length;
  return { completed, total };
}
