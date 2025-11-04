import { useState, useEffect, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';

import CreateTaskModal from './CreateTaskModal';
import DeleteTaskGroupModal from './DeleteTaskGroupModal';
import TaskDetailModal from './TaskDetailModal';
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
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [groupNameText, setGroupNameText] = useState(group.name);
  const renameContainerRef = useRef<HTMLDivElement>(null);
  const { rename } = useRenameTaskGroup(boardId);

  const handleRename = async () => {
    if (!groupNameText.trim()) return;
    try {
      await rename(group.id, groupNameText);
      onGroupRenamed?.();
      setRenameOpen(false);
    } catch {
    }
  };

  const handleCancelRename = () => {
    setGroupNameText(group.name);
    setRenameOpen(false);
  };

  
  // Handle click outside to close rename
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (renameOpen && renameContainerRef.current && !renameContainerRef.current.contains(event.target as Node)) {
        handleCancelRename();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [renameOpen]);


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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    // Update the task in the group's tasks array
    const updatedTasks = group.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    group.tasks = updatedTasks;
    setSelectedTask(updatedTask);
  };

  return (
    <div className={`task-group ${!hasTasks ? 'task-group--empty' : ''}`}>
      <header className={`group-header ${!canEdit ? 'group-header--no-drag' : ''}`} style={{ position:'relative' }} {...dragHandleProps}>
        {renameOpen ? (
          <div
            ref={renameContainerRef}
            className="group-name-edit-container"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              className="group-name-input"
              value={groupNameText}
              onChange={(e) => setGroupNameText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRename();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancelRename();
                }
              }}
              autoFocus
            />
            <div className="group-name-actions">
              <button
                className="group-name-btn group-name-btn--save"
                onClick={handleRename}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Save
              </button>
              <button
                className="group-name-btn group-name-btn--cancel"
                onClick={handleCancelRename}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <span
            className="group-name"
            onClick={(e) => {
              if (canEdit) {
                e.stopPropagation();
                e.preventDefault();
                setRenameOpen(true);
              }
            }}
            onMouseDown={(e) => {
              if (canEdit) {
                e.stopPropagation();
              }
            }}
            onPointerDown={(e) => {
              if (canEdit) {
                e.stopPropagation();
              }
            }}
            style={{ cursor: canEdit ? 'pointer' : 'default' }}
            title={canEdit ? "Click to rename" : undefined}
          >
            {group.name}
          </span>
        )}
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
              onClick={() => handleTaskClick(task)}
              userRole={userRole}
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
          <img src={plus} alt="add"/> Add task
        </button>
      )}

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={()=>setModalOpen(false)}
        onCreate={(title)=>createTask(title)}
      />

      <DeleteTaskGroupModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        name={group.name}
        onConfirm={handleDelete}
      />

      {selectedTask && (
        <TaskDetailModal
          isOpen={taskDetailOpen}
          onClose={() => setTaskDetailOpen(false)}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
