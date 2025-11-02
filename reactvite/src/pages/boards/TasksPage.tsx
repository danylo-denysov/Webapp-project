import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay, CollisionDetection, pointerWithin } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

import Avatar from '../../components/common/Avatar';
import Header from '../../components/common/Header';
import TeamModal from '../../components/boards/TeamModal';
import CreateTaskGroupModal from '../../components/taskGroups/CreateTaskGroupModal';
import TaskGroupSortable from '../../components/taskGroups/TaskGroupSortable';
import TaskCard from '../../components/taskGroups/TaskCard';
import GroupGhost from '../../components/taskGroups/GroupGhost';
import { useCreateTaskGroup } from '../../hooks/taskGroups/useCreateTaskGroup';
import { useReorderTaskGroups } from '../../hooks/taskGroups/useReorderTaskGroups';
import { useTaskGroups } from '../../hooks/taskGroups/useTaskGroups';
import { useMoveTask } from '../../hooks/taskGroups/useMoveTask';
import { useCurrentUser } from '../../hooks/auth/useCurrentUser';
import { BoardUserRole } from '../../types/boardUser';
import { safe_fetch } from '../../utils/api';
import { toastError } from '../../utils/toast';
import teamIcon from '../../assets/team.svg';
import listIcon from '../../assets/list.svg';
import plusIcon from '../../assets/plus.svg';

import './TasksPage.css';

export default function TasksPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const [boardName, setBoardName] = useState('')
  const { user: currentUser } = useCurrentUser();
  const { groups, setGroups, loading: groupsLoading, error: groupsError, refresh } = useTaskGroups(boardId);
  const [groupErrorToasted, setGroupErrorToasted] = useState(false);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [boardErrorToasted, setBoardErrorToasted] = useState(false);
  useEffect(() => {
    if (groupsError === 'Forbidden') {
      navigate('/boards', { replace: true });
    }
  }, [groupsError, navigate]);
  useEffect(() => {
    if (
      groupsError &&
      groupsError !== 'Forbidden' &&
      !groupErrorToasted
    ) {
      toastError(groupsError);
      setGroupErrorToasted(true);
    }
  }, [groupsError, groupErrorToasted]);
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  useEffect(() => {            // keep local array in sync when groups load/refresh
    setLocalOrder(groups.map(g => g.id))
  }, [groups]);
  const reorderGroups = useReorderTaskGroups(boardId, refresh);
  const { moveTask } = useMoveTask();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Custom collision detection that filters out the actively dragged task
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const activeData = args.active?.data.current;

    // If dragging a group, use pointerWithin for more lenient detection
    if (activeData?.type === 'group') {
      const allCollisions = pointerWithin(args);
      const groupCollisions = allCollisions.filter((collision) => {
        const container = args.droppableContainers.find(c => c.id === collision.id);
        const overData = container?.data.current;
        return overData?.type === 'group' && collision.id !== args.active.id;
      });
      return groupCollisions.length > 0 ? groupCollisions : [];
    }

    // For tasks, use closestCorners
    const allCollisions = closestCorners(args);
    return allCollisions.filter((collision) => {
      if (args.active && collision.id === args.active.id) {
        return false;
      }
      return true;
    });
  };

  const { create: createGroup } = useCreateTaskGroup(boardId, ()=>refresh());
  const [groupModalOpen,setGroupModalOpen]=useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'task') {
      // Find the task being dragged
      for (const group of groups) {
        const task = group.tasks.find(t => t.id === active.id);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    } else if (activeData?.type === 'group') {
      // Find the group being dragged
      const group = groups.find(g => g.id === active.id);
      if (group) {
        setActiveGroup(group);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    // Only handle task dragging (not groups - groups use CSS transforms during drag)
    if (activeData?.type !== 'task') return;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveGroup(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if we are dragging a task or a group
    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle task dragging
    if (activeData?.type === 'task') {
      const taskId = active.id as string;
      const sourceGroupId = activeData.groupId;
      let targetGroupId: string | undefined;
      let newOrder: number | undefined;

      // Check if dropped on end zone (after all tasks)
      if (overData?.type === 'end-zone') {
        targetGroupId = overData.groupId;
        const targetGroup = groups.find(g => g.id === targetGroupId);

        if (targetGroup) {
          if (sourceGroupId === targetGroupId) {
            // Moving within same group to the end
            // After removal, length decreases by 1, so we want length - 1
            newOrder = targetGroup.tasks.length - 1;
          } else {
            // Moving to different group - add at the end
            newOrder = targetGroup.tasks.length;
          }
        } else {
          newOrder = 0;
        }
      }
      // Check if dropped on a group container (at the end, after all tasks)
      else if (overData?.type === 'group-container') {
        targetGroupId = overData.groupId;
        const targetGroup = groups.find(g => g.id === targetGroupId);

        if (targetGroup) {
          if (sourceGroupId === targetGroupId) {
            // Moving within same group to the end
            // After removal, length decreases by 1, so we want length - 1
            newOrder = targetGroup.tasks.length - 1;
          } else {
            // Moving to different group - add at the end
            newOrder = targetGroup.tasks.length;
          }
        } else {
          newOrder = 0;
        }
      }
      // Check if dropped on another task
      else if (overData?.type === 'task') {
        targetGroupId = overData.groupId;
        const targetGroup = groups.find(g => g.id === targetGroupId);

        if (targetGroup) {
          const overTaskIndex = targetGroup.tasks.findIndex(t => t.id === over.id);

          if (overTaskIndex >= 0) {
            // Placeholder shows before the hovered task, so we insert at that position
            if (sourceGroupId === targetGroupId) {
              const sourceTaskIndex = targetGroup.tasks.findIndex(t => t.id === taskId);
              // If dragging down (source is before target), after removal target shifts left by 1
              if (sourceTaskIndex < overTaskIndex) {
                newOrder = overTaskIndex - 1; // Account for removal shifting indices
              } else {
                newOrder = overTaskIndex; // Insert at the target position
              }
            } else {
              // Different group - insert at the hovered task position
              newOrder = overTaskIndex;
            }
          } else {
            newOrder = targetGroup.tasks.length;
          }
        }
      }

      if (targetGroupId !== undefined && newOrder !== undefined) {
        // Save current state for rollback
        const previousGroups = [...groups];

        // Optimistically update UI
        const updatedGroups = groups.map(g => ({ ...g, tasks: [...g.tasks] }));
        const sourceGroup = updatedGroups.find(g => g.id === sourceGroupId);
        const targetGroup = updatedGroups.find(g => g.id === targetGroupId);

        if (sourceGroup && targetGroup) {
          // Remove task from source group
          const taskIndex = sourceGroup.tasks.findIndex(t => t.id === taskId);
          if (taskIndex >= 0) {
            const [movedTask] = sourceGroup.tasks.splice(taskIndex, 1);

            // Add task to target group at specified position
            targetGroup.tasks.splice(newOrder, 0, movedTask);

            // Update UI immediately
            setGroups(updatedGroups);

            // Send request to backend
            try {
              await moveTask(taskId, targetGroupId, newOrder);
            } catch (e) {
              console.error('Failed to move task:', e);
              toastError('Failed to move task');
              // Rollback on error
              setGroups(previousGroups);
            }
          }
        }
      }
      return;
    }

    // Handle group dragging
    if (activeData?.type === 'group') {
      const oldIndex = localOrder.indexOf(active.id as string);
      const newIndex = localOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(localOrder, oldIndex, newIndex);
        setLocalOrder(newOrder);
        try {
          await reorderGroups(newOrder);
        } catch (error) {
          console.error('Failed to reorder groups:', error);
          toastError('Failed to reorder groups');
          setLocalOrder(localOrder); // rollback
        }
      }
    }
  };

  const loadBoardName = useCallback(async (signal?: AbortSignal) => {
    if (!boardId) {
      setBoardLoading(false);
      return;
    }

    try {
      setBoardLoading(true);
      const res = await safe_fetch(`/api/boards/${boardId}/user`, {
        method: 'GET',
        credentials: 'include',
        signal,
      });
      if (res.status === 403 || res.status === 401) {
        navigate('/boards', { replace: true });
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load board');
      }
      const b = await res.json();
      setBoardName(b.name);

      const boardUsersRes = await safe_fetch(`/api/boards/${boardId}/users`, {
        method: 'GET',
        credentials: 'include',
        signal,
      });

      if (boardUsersRes.ok) {
        const boardUsers = await boardUsersRes.json();
        const userRes = await safe_fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
          signal,
        });

        if (userRes.ok) {
          const currentUser = await userRes.json();
          const currentBoardUser = boardUsers.find((bu: any) => bu.user.id === currentUser.id);
          if (currentBoardUser) {
            setUserRole(currentBoardUser.role);
            setIsOwner(currentBoardUser.role === BoardUserRole.OWNER);
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        setBoardError('Failed to load board name');
      }
    } finally {
      setBoardLoading(false);
    }
  }, [boardId, navigate]);

  useEffect(() => {
    const abortController = new AbortController();

    loadBoardName(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadBoardName]);

  useEffect(() => {
    if (boardError && !boardErrorToasted) {
      toastError(boardError);
      setBoardErrorToasted(true);
    }
  }, [boardError, boardErrorToasted]);

  if (boardLoading || groupsLoading) {
    return <div className="tasks-loading">Loading board…</div>;
  }

  return (
    <div className="tasks-page">
      <Header
        left={
          <h1 className="tasks-title" data-text={boardName}>
            {boardName}
          </h1>
        }
        right={
          <>
            {(userRole === BoardUserRole.OWNER || userRole === BoardUserRole.EDITOR) && (
              <button
                className="tasks-action-btn"
                onClick={() => setGroupModalOpen(true)}
              >
                <img src={plusIcon} alt="add group" /> New group
              </button>
            )}
            <button className="tasks-action-btn" onClick={() => setTeamModalOpen(true)}>
              <img src={teamIcon} alt="Team" /> Team
            </button>
            <Link to="/boards" className="tasks-action-btn tasks-boards-link">
              <img src={listIcon} alt="Boards" /> Boards
            </Link>
            <Link to="/profile">
              <Avatar profilePicture={currentUser?.profile_picture} />
            </Link>
          </>
        }
      />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className="groups-row">
            {groups.length === 0 ? (
              <div className="tasks-empty-state">
                <p className="tasks-empty-state__text">
                  No task groups created yet. Click "New group" to get started!
                </p>
              </div>
            ) : (
              <div className="groups-row__inner-wrapper">
                {localOrder.map(id => {
                  const g = groups.find(grp => grp.id === id);
                  if (!g) return null;
                  return (
                    <TaskGroupSortable
                      key={g.id}
                      boardId={boardId!}
                      group={g}
                      onTaskAdded={() => refresh()}
                      onTaskDeleted={() => refresh()}
                      onGroupRenamed={refresh}
                      onGroupDeleted={refresh}
                      userRole={userRole}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <div style={{
              width: '220px',
              opacity: 0.95,
              cursor: 'grabbing',
              transform: 'rotate(3deg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <TaskCard task={activeTask} onDelete={() => {}} canEdit={false} />
            </div>
          ) : activeGroup ? (
            <GroupGhost group={activeGroup} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {/* TODO: when moving task for first time down the little flicker appears showing the ghost card under the next position and then in cards original position */}
      {/* TODO: fix toast error */}
      

      <CreateTaskGroupModal
         isOpen={groupModalOpen}
         onClose={()=>setGroupModalOpen(false)}
         onCreate={name=>createGroup(name)}/>

      <TeamModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        boardId={boardId!}
        isOwner={isOwner}
      />

    </div>
  )
}
