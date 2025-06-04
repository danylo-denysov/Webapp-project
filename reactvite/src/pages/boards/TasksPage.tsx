import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import teamIcon from '../../assets/team.svg'
import listIcon from '../../assets/list.svg'
import plusIcon from '../../assets/plus.svg';
import './TasksPage.css'
import { useTaskGroups } from '../../hooks/taskGroups/useTaskGroups';
import { useCreateTaskGroup } from '../../hooks/taskGroups/useCreateTaskGroup';
import CreateTaskGroupModal from '../../components/taskGroups/CreateTaskGroupModal';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import TaskGroupSortable from '../../components/taskGroups/TaskGroupSortable';
import { useReorderTaskGroups } from '../../hooks/taskGroups/useReorderTaskGroups';
import { safe_fetch } from '../../utils/api'
import { toastError } from '../../utils/toast'
import Header from '../../components/common/Header'

export default function TasksPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const [boardName, setBoardName] = useState('')
  const { groups, loading: groupsLoading, error: groupsError, refresh } = useTaskGroups(boardId);
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );
  const { create: createGroup } = useCreateTaskGroup(boardId, ()=>refresh());
  const [groupModalOpen,setGroupModalOpen]=useState(false);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = localOrder.indexOf(active.id as string);
    const newIndex = localOrder.indexOf(over.id as string);
    const next = arrayMove(localOrder, oldIndex, newIndex);
    setLocalOrder(next);
    try {
      await reorderGroups(next);
    } catch (e) {
      setLocalOrder(localOrder); // rollback on error
    }
  };

  useEffect(() => {
    async function loadBoardName() {
      if (!boardId) {
        setBoardLoading(false);
        return;
      }

      try {
        setBoardLoading(true);
        const res = await safe_fetch(`/api/boards/${boardId}/user`, {
          method: 'GET',
          credentials: 'include',
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
      } catch (err) {
        setBoardError('Failed to load board name');
      } finally {
        setBoardLoading(false);
      }
    }

      loadBoardName();
  }, []);

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
            <button
              className="tasks-action-btn"
              onClick={() => setGroupModalOpen(true)}
            >
              <img src={plusIcon} alt="add group" /> New group
            </button>
            <button className="tasks-action-btn">
              <img src={teamIcon} alt="Team" /> Team
            </button>
            <Link to="/boards" className="tasks-action-btn tasks-boards-link">
              <img src={listIcon} alt="Boards" /> Boards
            </Link>
            <Link to="/profile">
              <Avatar />
            </Link>
          </>
        }
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToFirstScrollableAncestor, restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className="groups-row">
            <div className="groups-row__inner-wrapper">
              {localOrder.map(id => {
                const g = groups.find(grp => grp.id === id);
                if (!g) return null;
                return (
                  <TaskGroupSortable
                    key={g.id}
                    boardId={boardId!}
                    group={g}
                    onTaskAdded   ={refresh}
                    onTaskDeleted ={refresh}
                    onGroupRenamed={refresh}
                    onGroupDeleted={refresh}
                  />
                );
              })}
            </div>
          </div>
        </SortableContext>
      </DndContext>

      <CreateTaskGroupModal
         isOpen={groupModalOpen}
         onClose={()=>setGroupModalOpen(false)}
         onCreate={name=>createGroup(name)}/>

    </div>
  )
}
