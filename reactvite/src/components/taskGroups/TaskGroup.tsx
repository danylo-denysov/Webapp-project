import React, { useState } from 'react';
import './TaskGroup.css';
import plus from '../../assets/plus.svg';
import cross from '../../assets/close.svg';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import { TaskGroup as TG } from '../../hooks/taskGroups/useTaskGroups';
import { useTasks } from '../../hooks/taskGroups/useTasks';
import { useRenameTaskGroup } from '../../hooks/taskGroups/useRenameTaskGroup';
import RenameTaskGroupModal from './RenameTaskGroupModal';
import DeleteTaskGroupModal  from './DeleteTaskGroupModal';
import { useDeleteTaskGroup } from '../../hooks/taskGroups/useDeleteTaskGroup';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import TaskCardSortable from './TaskCardSortable';
import { useReorderTasks } from '../../hooks/taskGroups/useReorderTasks';

export default function TaskGroup({ boardId, group, onTaskAdded, onTaskDeleted, onGroupRenamed, onGroupDeleted }:{
  boardId: string; 
  group: TG;
  onTaskAdded   : (gId:string,t:any)=>void;
  onTaskDeleted : (gId:string,id:string)=>void;
  onGroupRenamed?: ()=>void;
  onGroupDeleted?: () => void;
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
  const handleDelete = async () => {
    try {
      await remove(group.id);
      onGroupDeleted?.();
      setDeleteOpen(false);
    } catch { /* toast already shown by the hook */ }
  };
  const hasTasks = group.tasks.length > 0;
  const { remove } = useDeleteTaskGroup(boardId, () => onGroupDeleted?.());
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [localOrder, setLocalOrder] = React.useState<string[]>([]);
  React.useEffect(() => {
    setLocalOrder(group.tasks.map((t) => t.id));
  }, [group.tasks]);
  const reorderTasks = useReorderTasks();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = localOrder.indexOf(active.id as string);
    const newIndex = localOrder.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextOrder = [...localOrder];
    nextOrder.splice(oldIndex, 1);
    nextOrder.splice(newIndex, 0, active.id as string);

    setLocalOrder(nextOrder);
    try {
      await reorderTasks(group.id, nextOrder);
    } catch (e) {
      console.error('Failed to reorder tasks:', e);
      setLocalOrder(localOrder);
    }
  };

  return (
    <div className={`task-group ${!hasTasks ? 'task-group--empty' : ''}`}>
      <header className="group-header" style={{ position:'relative' }}>
        <span
          className="group-name"
          onClick={() => setRenameOpen(true)}
          title="Click to rename"
        >
          {group.name}
        </span>
        <button className="group-delete"
          title="Delete group"
          onClick={() => setDeleteOpen(true)}>
          <img src={cross} alt="delete group"/>
        </button>
      </header>

      <div className={`tasks-scroll ${!hasTasks ? 'tasks-scroll--hidden' : ''}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement, restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localOrder}
            strategy={verticalListSortingStrategy}
          >
            {localOrder.map((taskId) => {
              const taskObj = group.tasks.find((t) => t.id === taskId);
              if (!taskObj) return null;
              return (
                <TaskCardSortable
                  key={taskObj.id}
                  task={taskObj}
                  onDelete={deleteTask}
                />
              );
            })}
          </SortableContext>
        </DndContext>
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

      <DeleteTaskGroupModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        name={group.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
