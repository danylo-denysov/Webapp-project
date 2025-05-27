import React, { useState } from 'react';
import './TaskGroup.css';
import plus from '../../assets/plus.svg';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { TaskGroup as TG } from '../../hooks/taskGroups/useTaskGroups';
import { useTasks } from '../../hooks/taskGroups/useTasks';
import { useRenameTaskGroup } from '../../hooks/taskGroups/useRenameTaskGroup';
import RenameTaskGroupModal from './RenameTaskGroupModal'; 

export default function TaskGroup({ boardId, group, onTaskAdded, onTaskDeleted, onGroupRenamed, }:{
  boardId: string; 
  group: TG;
  onTaskAdded   : (gId:string,t:any)=>void;
  onTaskDeleted : (gId:string,id:string)=>void;
  onGroupRenamed?: ()=>void;
}) {
  const { createTask, deleteTask } = useTasks(
    group.id,
    t => onTaskAdded(group.id, t),
    id => onTaskDeleted(group.id, id),
  );
  const [modalOpen,setModalOpen]=useState(false);
  const [renameOpen, setRenameOpen] = useState(false); 
  const { rename } = useRenameTaskGroup(boardId);
  const handleRename = async (newName: string) => {
    try {
      await rename(group.id, newName);
      onGroupRenamed?.();
    } catch { /* toast already shown in the hook */ }
  };
  const hasTasks = group.tasks.length > 0;

  return (
    <div className={`task-group ${!hasTasks ? 'task-group--empty' : ''}`}>
      <header className="group-header">
        <span
          className="group-name"
          onClick={() => setRenameOpen(true)}
          title="Click to rename"
        >
          {group.name}
        </span>
      </header>

      <div className={`tasks-scroll ${!hasTasks ? 'tasks-scroll--hidden' : ''}`}>
        {group.tasks.map(t =>
          <TaskCard key={t.id} task={t} onDelete={deleteTask}/>)}
      </div>

      <button className="add-task-btn" onClick={()=>setModalOpen(true)}>
        <img src={plus} alt="add"/>  Add new task
      </button>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={()=>setModalOpen(false)}
        onCreate={(title,desc)=>createTask(title,desc)}
      />

      <RenameTaskGroupModal
        isOpen={renameOpen}
        onClose={()=>setRenameOpen(false)}
        currentName={group.name}
        onRename={handleRename}
      />
    </div>
  );
}
