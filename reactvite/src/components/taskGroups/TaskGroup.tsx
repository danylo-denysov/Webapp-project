import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';

import CreateTaskModal from './CreateTaskModal';
import DeleteTaskGroupModal from './DeleteTaskGroupModal';
import RenameTaskGroupModal from './RenameTaskGroupModal';
import TaskCardSortable from './TaskCardSortable';
import TaskGroupEndZone from './TaskGroupEndZone';
import { useCreateTask } from '../../hooks/taskGroups/useCreateTask';
import { useDeleteTask } from '../../hooks/taskGroups/useDeleteTask';
import { useDeleteTaskGroup } from '../../hooks/taskGroups/useDeleteTaskGroup';
import { useRenameTaskGroup } from '../../hooks/taskGroups/useRenameTaskGroup';
import { Task, TaskGroup as TG } from '../../types/task';
import { BoardUserRole } from '../../types/boardUser';
import plus from '../../assets/plus.svg';
import cross from '../../assets/close.svg';

import './TaskGroup.css';

export interface TaskGroupProps {
  boardId: string;
  group: TG;
  onTaskAdded: (gId:string,t:Task)=>void;
  onTaskDeleted: (gId:string,id:string)=>void;
  onGroupRenamed?: ()=>void;
  onGroupDeleted?: () => void;
  userRole: string | null;
  dragHandleProps?: any;
}

export default function TaskGroup({ boardId, group, onTaskAdded, onTaskDeleted, onGroupRenamed, onGroupDeleted, userRole, dragHandleProps }: TaskGroupProps) {
  const canEdit = userRole === BoardUserRole.OWNER || userRole === BoardUserRole.EDITOR;

  const { createTask } = useCreateTask(
    group.id,
    (newTask) => {
      onTaskAdded(group.id, newTask);
    }
  );
  const { deleteTask } = useDeleteTask(
    (deletedId) => {
      onTaskDeleted(group.id, deletedId);
    }
  );
  const [modalOpen,setModalOpen]=useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const { rename } = useRenameTaskGroup(boardId);
  const handleRename = async (newName: string) => {
    try {
      await rename(group.id, newName);
      onGroupRenamed?.();
      setRenameOpen(false);
    } catch {
    }
  };
  const handleDelete = async () => {
    try {
      await remove(group.id);
      onGroupDeleted?.();
      setDeleteOpen(false);
    } catch {
    }
  };
  const hasTasks = group.tasks.length > 0;
  const { remove } = useDeleteTaskGroup(boardId, () => onGroupDeleted?.());
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: `group-container-${group.id}`,
    data: {
      type: 'group-container',
      groupId: group.id,
    },
  });

  const { active, over } = useDndContext();

  // Check if a task is being dragged over this group's empty space (not over a task)
  const isOverGroup = over?.id === `group-container-${group.id}`;
  const isOverAnyTask = over?.data.current?.type === 'task';
  const activeData = active?.data.current;
  const isTaskBeingDragged = activeData?.type === 'task';
  const draggedTaskHeight = activeData?.cardHeight || 80;
  // Only show indicator when over the group container itself, not over any task
  const showDropIndicator = isOverGroup && isTaskBeingDragged && !isOverAnyTask;

  return (
    <div className={`task-group ${!hasTasks ? 'task-group--empty' : ''}`}>
      <header className="group-header" style={{ position:'relative' }} {...dragHandleProps}>
        <span
          className="group-name"
          onClick={canEdit ? () => setRenameOpen(true) : undefined}
          title={canEdit ? "Click to rename" : undefined}
          style={{ cursor: canEdit ? 'pointer' : 'default' }}
        >
          {group.name}
        </span>
        {canEdit && (
          <button className="group-delete"
            title="Delete group"
            onClick={() => setDeleteOpen(true)}>
            <img src={cross} alt="delete group"/>
          </button>
        )}
      </header>

      <div
        ref={setNodeRef}
        className={`tasks-scroll ${!hasTasks ? 'tasks-scroll--empty' : ''}`}
        data-group-id={group.id}
      >
        <SortableContext
          items={[...group.tasks.map((t) => t.id), `end-zone-${group.id}`]}
          strategy={verticalListSortingStrategy}
        >
          {group.tasks.map((task) => (
            <TaskCardSortable
              key={task.id}
              task={task}
              onDelete={deleteTask}
              canEdit={canEdit}
              groupId={group.id}
            />
          ))}
          <TaskGroupEndZone groupId={group.id} />
          {showDropIndicator && (
            <div style={{
              height: `${draggedTaskHeight}px`,
              borderRadius: '6px',
              backgroundColor: 'rgba(90, 200, 250, 0.15)',
              border: '2px dashed rgba(90, 200, 250, 0.4)',
              marginBottom: '0.5rem',
            }} />
          )}
        </SortableContext>
      </div>

      {canEdit && (
        <button className="add-task-btn" onClick={()=>setModalOpen(true)}>
          <img src={plus} alt="add"/>  Add new task
        </button>
      )}

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
