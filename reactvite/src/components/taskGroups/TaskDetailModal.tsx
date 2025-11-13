import { useState, useEffect } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, CollisionDetection, pointerWithin } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Modal from '../common/Modal/Modal';
import Avatar from '../common/Avatar';
import { useUpdateTask } from '../../hooks/taskGroups/useUpdateTask';
import { useTaskLists } from '../../hooks/taskGroups/useTaskLists';
import { useUpdateTaskList } from '../../hooks/taskGroups/useUpdateTaskList';
import { useMoveListItem } from '../../hooks/taskGroups/useMoveListItem';
import { useReorderTaskLists } from '../../hooks/taskGroups/useReorderTaskLists';
import { useTaskComments } from '../../hooks/taskGroups/useTaskComments';
import { useCurrentUser } from '../../hooks/auth/useCurrentUser';
import { BoardUserRole } from '../../types/boardUser';
import { safe_fetch } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';
import { toastError } from '../../utils/toast';
import type { Task, TaskList, TaskListItem, TaskComment } from '../../types/task';
import ListItemSortable from './ListItemSortable';
import ListItemEndZone from './ListItemEndZone';
import ListSortable from './ListSortable';
import ListEndZone from './ListEndZone';
import ListGhost from './ListGhost';
import closeIcon from '../../assets/close.svg';
import plusIcon from '../../assets/plus.svg';
import './TaskDetailModal.css';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    description: string;
  };
  onTaskUpdated?: (updatedTask: Task) => void;
  userRole: string | null;
}

export default function TaskDetailModal({ isOpen, onClose, task, onTaskUpdated, userRole }: TaskDetailModalProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState(task.description || '');
  const [currentDescription, setCurrentDescription] = useState(task.description || '');
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingItemForList, setCreatingItemForList] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(task.title || '');
  const [currentTitle, setCurrentTitle] = useState(task.title || '');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [activeItem, setActiveItem] = useState<TaskListItem | null>(null);
  const [activeList, setActiveList] = useState<TaskList | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isWritingComment, setIsWritingComment] = useState(false);

  const { user: currentUser } = useCurrentUser();
  const canEdit = userRole === BoardUserRole.OWNER || userRole === BoardUserRole.EDITOR;
  const { updateTask } = useUpdateTask((updatedTask) => {
    setCurrentDescription(updatedTask.description || '');
    setCurrentTitle(updatedTask.title || '');
    onTaskUpdated?.(updatedTask);
  });

  const { createList, deleteList, createItem, toggleItem, deleteItem } = useTaskLists();
  const { updateTaskList } = useUpdateTaskList();
  const { moveItem } = useMoveListItem();
  const { reorderLists } = useReorderTaskLists();
  const { createComment, deleteComment } = useTaskComments();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Custom collision detection that filters out the actively dragged item
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const activeData = args.active?.data.current;

    // If dragging a list, use pointerWithin for more lenient detection (same as groups)
    if (activeData?.type === 'list') {
      const allCollisions = pointerWithin(args);
      const listCollisions = allCollisions.filter((collision) => {
        const container = args.droppableContainers.find(c => c.id === collision.id);
        const overData = container?.data.current;
        return (overData?.type === 'list' || overData?.type === 'list-end-zone') && collision.id !== args.active.id;
      });
      return listCollisions.length > 0 ? listCollisions : [];
    }

    // For list items, use closestCorners
    const allCollisions = closestCorners(args);
    return allCollisions.filter((collision) => {
      if (args.active && collision.id === args.active.id) {
        return false;
      }
      return true;
    });
  };

  // Sync state with task prop when task changes
  useEffect(() => {
    setCurrentTitle(task.title || '');
    setTitleText(task.title || '');
    setCurrentDescription(task.description || '');
    setDescriptionText(task.description || '');
  }, [task.id, task.title, task.description]);

  // Fetch full task details including lists and comments
  useEffect(() => {
    if (isOpen && task.id) {
      const fetchTaskDetails = async () => {
        setLoading(true);
        try {
          const res = await safe_fetch(`/api/tasks/${task.id}`);
          if (res.ok) {
            const data = await res.json() as Task;
            setTaskLists(data.taskLists || []);
            setComments(data.comments || []);
          } else {
            await handleApiError(res);
          }
        } catch (error) {
          console.error('Failed to fetch task details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTaskDetails();
    } else if (!isOpen) {
      // Reset editing states when modal closes
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setEditingListId(null);
      setIsCreatingList(false);
      setCreatingItemForList(null);
      setNewCommentText('');
      setIsWritingComment(false);
    }
  }, [isOpen, task.id]);

  const handleDescriptionClick = () => {
    if (!canEdit) return;
    // Close any other editing states
    setIsEditingTitle(false);
    setEditingListId(null);
    setIsCreatingList(false);
    setCreatingItemForList(null);
    setIsWritingComment(false);
    setNewCommentText('');
    setIsEditingDescription(true);
    setDescriptionText(currentDescription);
  };

  const handleDescriptionSave = async () => {
    try {
      await updateTask(task.id, { description: descriptionText });
      setIsEditingDescription(false);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleDescriptionCancel = () => {
    setDescriptionText(currentDescription);
    setIsEditingDescription(false);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    const newList = await createList(task.id, newListName);
    if (newList) {
      setTaskLists([...taskLists, newList]);
      setNewListName('');
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    const success = await deleteList(listId);
    if (success) {
      setTaskLists(taskLists.filter(list => list.id !== listId));
    }
  };

  const handleCreateItem = async (listId: string) => {
    if (!newItemContent.trim()) return;

    const newItem = await createItem(listId, newItemContent);
    if (newItem) {
      const updatedTaskLists = taskLists.map(list =>
        list.id === listId
          ? { ...list, items: [...list.items, newItem] }
          : list
      );
      setTaskLists(updatedTaskLists);
      setNewItemContent('');
      setCreatingItemForList(null);

      // Notify parent component with updated task including taskLists
      if (onTaskUpdated) {
        onTaskUpdated({
          id: task.id,
          title: currentTitle,
          description: currentDescription,
          created_at: '',
          order: 0,
          taskLists: updatedTaskLists,
        });
      }
    }
  };

  const handleToggleItem = async (listId: string, itemId: string, completed: boolean) => {
    const updatedItem = await toggleItem(itemId, completed);
    if (updatedItem) {
      const updatedTaskLists = taskLists.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId ? updatedItem : item
              ),
            }
          : list
      );
      setTaskLists(updatedTaskLists);

      // Notify parent component with updated task including taskLists
      if (onTaskUpdated) {
        onTaskUpdated({
          id: task.id,
          title: currentTitle,
          description: currentDescription,
          created_at: '',
          order: 0,
          taskLists: updatedTaskLists,
        });
      }
    }
  };

  const handleDeleteItem = async (listId: string, itemId: string) => {
    const success = await deleteItem(itemId);
    if (success) {
      const updatedTaskLists = taskLists.map(list =>
        list.id === listId
          ? { ...list, items: list.items.filter(item => item.id !== itemId) }
          : list
      );
      setTaskLists(updatedTaskLists);

      // Notify parent component with updated task including taskLists
      if (onTaskUpdated) {
        onTaskUpdated({
          id: task.id,
          title: currentTitle,
          description: currentDescription,
          created_at: '',
          order: 0,
          taskLists: updatedTaskLists,
        });
      }
    }
  };

  const getCompletionCount = (list: TaskList) => {
    const completed = list.items.filter(item => item.completed).length;
    const total = list.items.length;
    return { completed, total };
  };

  const handleTitleClick = () => {
    if (!canEdit) return;
    // Close any other editing states
    setEditingListId(null);
    setIsEditingDescription(false);
    setIsCreatingList(false);
    setCreatingItemForList(null);
    setIsWritingComment(false);
    setNewCommentText('');
    setIsEditingTitle(true);
    setTitleText(currentTitle);
  };

  const handleTitleSave = async () => {
    if (!titleText.trim()) return;

    try {
      await updateTask(task.id, { title: titleText });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleTitleCancel = () => {
    setTitleText(currentTitle);
    setIsEditingTitle(false);
  };

  const handleListNameClick = (list: TaskList) => {
    if (!canEdit) return;
    // Close any other editing states
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsCreatingList(false);
    setCreatingItemForList(null);
    setIsWritingComment(false);
    setNewCommentText('');
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const handleListNameSave = async (listId: string) => {
    if (!editingListName.trim()) return;

    const updatedList = await updateTaskList(listId, editingListName);
    if (updatedList) {
      setTaskLists(taskLists.map(list =>
        list.id === listId ? { ...list, name: editingListName } : list
      ));
      setEditingListId(null);
      setEditingListName('');
    }
  };

  const handleListNameCancel = () => {
    setEditingListId(null);
    setEditingListName('');
  };

  const closeEditingStates = () => {
    // Close all editing states
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setEditingListId(null);
    setIsCreatingList(false);
    setCreatingItemForList(null);
    setIsWritingComment(false);
    setNewCommentText('');
  };

  const handleContainerClick = () => {
    closeEditingStates();
  };

  const handleCommentClick = () => {
    // Close any other editing states
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setEditingListId(null);
    setIsCreatingList(false);
    setCreatingItemForList(null);
    setIsWritingComment(true);
  };

  const handleCommentSave = async () => {
    if (!newCommentText.trim()) return;

    const newComment = await createComment(task.id, newCommentText);
    if (newComment) {
      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
      setNewCommentText('');
      setIsWritingComment(false);

      // Notify parent component with updated task including comments
      if (onTaskUpdated) {
        onTaskUpdated({
          id: task.id,
          title: currentTitle,
          description: currentDescription,
          created_at: '',
          order: 0,
          taskLists,
          comments: updatedComments,
        });
      }
    }
  };

  const handleCommentCancel = () => {
    setNewCommentText('');
    setIsWritingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      const updatedComments = comments.filter(c => c.id !== commentId);
      setComments(updatedComments);

      // Notify parent component with updated task including comments
      if (onTaskUpdated) {
        onTaskUpdated({
          id: task.id,
          title: currentTitle,
          description: currentDescription,
          created_at: '',
          order: 0,
          taskLists,
          comments: updatedComments,
        });
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'list-item') {
      // Find the item being dragged
      for (const list of taskLists) {
        const item = list.items.find(i => i.id === active.id);
        if (item) {
          setActiveItem(item);
          break;
        }
      }
    } else if (activeData?.type === 'list') {
      // Find the list being dragged
      const list = taskLists.find(l => l.id === active.id);
      if (list) {
        setActiveList(list);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    setActiveList(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle list item dragging
    if (activeData?.type === 'list-item') {
      const itemId = active.id as string;
      const sourceListId = activeData.listId;
      let targetListId: string | undefined;
      let newOrder: number | undefined;

      // Check if dropped on end zone (after all items)
      if (overData?.type === 'list-end-zone') {
        targetListId = overData.listId;
        const targetList = taskLists.find(l => l.id === targetListId);

        if (targetList) {
          if (sourceListId === targetListId) {
            // Moving within same list to the end
            // After removal, length decreases by 1, so we want length - 1
            newOrder = targetList.items.length - 1;
          } else {
            // Moving to different list - add at the end
            newOrder = targetList.items.length;
          }
        } else {
          newOrder = 0;
        }
      }
      // Check if dropped on another item
      else if (overData?.type === 'list-item') {
        targetListId = overData.listId;
        const targetList = taskLists.find(l => l.id === targetListId);

        if (targetList) {
          const overItemIndex = targetList.items.findIndex(i => i.id === over.id);

          if (overItemIndex >= 0) {
            if (sourceListId === targetListId) {
              const sourceItemIndex = targetList.items.findIndex(i => i.id === itemId);
              // If dragging down, account for removal shifting indices
              if (sourceItemIndex < overItemIndex) {
                newOrder = overItemIndex - 1;
              } else {
                newOrder = overItemIndex;
              }
            } else {
              // Different list - insert at the hovered item position
              newOrder = overItemIndex;
            }
          } else {
            newOrder = targetList.items.length;
          }
        }
      }

      if (targetListId !== undefined && newOrder !== undefined) {
        // Save current state for rollback
        const previousLists = [...taskLists];

        // Optimistically update UI
        const updatedLists = taskLists.map(l => ({ ...l, items: [...l.items] }));
        const sourceList = updatedLists.find(l => l.id === sourceListId);
        const targetList = updatedLists.find(l => l.id === targetListId);

        if (sourceList && targetList) {
          // Remove item from source list
          const itemIndex = sourceList.items.findIndex(i => i.id === itemId);
          if (itemIndex >= 0) {
            const [movedItem] = sourceList.items.splice(itemIndex, 1);

            // Add item to target list at specified position
            targetList.items.splice(newOrder, 0, movedItem);

            // Update UI immediately
            setTaskLists(updatedLists);

            // Send request to backend
            try {
              await moveItem(itemId, targetListId, newOrder);
            } catch (e) {
              console.error('Failed to move list item:', e);
              toastError('Failed to move list item');
              // Rollback on error
              setTaskLists(previousLists);
            }
          }
        }
      }
    }
    // Handle list dragging
    else if (activeData?.type === 'list') {
      const activeListId = active.id as string;
      const oldIndex = taskLists.findIndex(l => l.id === activeListId);
      let newIndex: number;

      // Check if dropped on end zone
      if (overData?.type === 'list-end-zone') {
        newIndex = taskLists.length - 1;
      } else if (overData?.type === 'list') {
        const overListId = over.id as string;
        newIndex = taskLists.findIndex(l => l.id === overListId);
      } else {
        return;
      }

      if (oldIndex !== newIndex) {
        // Save current state for rollback
        const previousLists = [...taskLists];

        // Reorder lists optimistically
        const reorderedLists = [...taskLists];
        const [movedList] = reorderedLists.splice(oldIndex, 1);
        reorderedLists.splice(newIndex, 0, movedList);

        setTaskLists(reorderedLists);

        // Send request to backend
        try {
          await reorderLists(task.id, reorderedLists.map(l => l.id));
        } catch (e) {
          console.error('Failed to reorder lists:', e);
          toastError('Failed to reorder lists');
          // Rollback on error
          setTaskLists(previousLists);
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="task-detail-modal">
          {/* Left side - Task details */}
          <div className="task-detail-modal__left" onClick={handleContainerClick}>
          {/* Task Title Section */}
          <div className="task-detail-modal__header" onClick={(e) => e.stopPropagation()}>
            {isEditingTitle ? (
              <div className="task-detail-modal__title-edit">
                <input
                  type="text"
                  className="task-detail-modal__title-input"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTitleSave();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTitleCancel();
                    }
                  }}
                  autoFocus
                />
                <div className="task-detail-modal__description-actions">
                  <button className="task-detail-modal__action-btn task-detail-modal__action-btn--small" onClick={handleTitleSave}>
                    Save
                  </button>
                  <button className="task-detail-modal__action-btn task-detail-modal__action-btn--small" onClick={handleTitleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h2
                className={`task-detail-modal__title ${canEdit ? 'task-detail-modal__title--editable' : ''}`}
                onClick={handleTitleClick}
                title={canEdit ? "Click to edit task title" : undefined}
              >
                {currentTitle}
              </h2>
            )}
          </div>

          {canEdit && (
            <div className="task-detail-modal__actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="task-detail-modal__action-btn"
                onClick={() => {
                  // Close any other editing states
                  setIsEditingTitle(false);
                  setIsEditingDescription(false);
                  setEditingListId(null);
                  setCreatingItemForList(null);
                  setIsWritingComment(false);
                  setNewCommentText('');
                  setIsCreatingList(true);
                }}
              >
                Add List
              </button>
            </div>
          )}

          <div className="task-detail-modal__description-section" onClick={(e) => e.stopPropagation()}>
            <h3 className="task-detail-modal__section-title">Description</h3>
            {isEditingDescription ? (
              <div className="task-detail-modal__description-edit">
                <textarea
                  className="task-detail-modal__description-textarea"
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDescriptionCancel();
                    }
                  }}
                  placeholder="Add a description..."
                  autoFocus
                />
                <div className="task-detail-modal__description-actions">
                  <button className="task-detail-modal__action-btn" onClick={handleDescriptionSave}>
                    Save
                  </button>
                  <button className="task-detail-modal__action-btn" onClick={handleDescriptionCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`task-detail-modal__description-content ${canEdit ? 'task-detail-modal__description-content--editable' : ''}`}
                onClick={handleDescriptionClick}
              >
                {currentDescription || <span className="task-detail-modal__empty-state">No description yet</span>}
              </div>
            )}
          </div>

          {/* Task Lists Section */}
          {!loading && (
            <div className="task-detail-modal__lists-section" onClick={(e) => e.stopPropagation()}>
              {isCreatingList && (
                <div className="task-detail-modal__create-list">
                  <input
                    type="text"
                    className="task-detail-modal__list-name-input"
                    placeholder="List name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateList();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCreatingList(false);
                        setNewListName('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="task-detail-modal__description-actions">
                    <button className="task-detail-modal__action-btn" onClick={handleCreateList}>
                      Create
                    </button>
                    <button className="task-detail-modal__action-btn" onClick={() => {
                      setIsCreatingList(false);
                      setNewListName('');
                    }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <SortableContext
                items={[...taskLists.map(l => l.id), 'list-end-zone']}
                strategy={verticalListSortingStrategy}
              >
                {taskLists.map((list) => {
                  const { completed, total } = getCompletionCount(list);
                  return (
                    <ListSortable key={list.id} listId={list.id} canEdit={canEdit}>
                      <div className="task-detail-modal__list">
                    <div className={`task-detail-modal__list-header ${canEdit ? 'task-detail-modal__list-header--draggable' : ''}`}>
                      <div className="task-detail-modal__list-info">
                        <span className="task-detail-modal__list-progress">
                          {completed}/{total}
                        </span>
                        {editingListId === list.id ? (
                          <div className="task-detail-modal__list-name-edit">
                            <input
                              type="text"
                              className="task-detail-modal__list-name-input-edit"
                              value={editingListName}
                              onChange={(e) => setEditingListName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleListNameSave(list.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleListNameCancel();
                                }
                              }}
                              autoFocus
                            />
                            <div className="task-detail-modal__list-name-actions">
                              <button
                                className="task-detail-modal__action-btn task-detail-modal__action-btn--small"
                                onClick={() => handleListNameSave(list.id)}
                              >
                                Save
                              </button>
                              <button
                                className="task-detail-modal__action-btn task-detail-modal__action-btn--small"
                                onClick={handleListNameCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <h4
                            className={`task-detail-modal__list-name ${canEdit ? 'task-detail-modal__list-name--editable' : ''}`}
                            onClick={() => handleListNameClick(list)}
                            title={canEdit ? "Click to edit list name" : undefined}
                          >
                            {list.name}
                          </h4>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          className="task-detail-modal__list-delete"
                          onClick={() => {
                            closeEditingStates();
                            handleDeleteList(list.id);
                          }}
                          title="Delete list"
                        >
                          <img src={closeIcon} alt="Delete" />
                        </button>
                      )}
                    </div>

                    <div className="task-detail-modal__list-items">
                      <SortableContext
                        items={[...list.items.map(item => item.id), `list-end-zone-${list.id}`]}
                        strategy={verticalListSortingStrategy}
                      >
                        {list.items.map((item) => (
                          <ListItemSortable
                            key={item.id}
                            item={item}
                            listId={list.id}
                            onToggle={(itemId, completed) => handleToggleItem(list.id, itemId, completed)}
                            onDelete={(itemId) => handleDeleteItem(list.id, itemId)}
                            closeEditingStates={closeEditingStates}
                            canEdit={canEdit}
                          />
                        ))}
                        <ListItemEndZone listId={list.id} />
                      </SortableContext>

                      {creatingItemForList === list.id ? (
                        <div className="task-detail-modal__create-item">
                          <input
                            type="text"
                            className="task-detail-modal__item-input"
                            placeholder="Item content..."
                            value={newItemContent}
                            onChange={(e) => setNewItemContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateItem(list.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                e.stopPropagation();
                                setCreatingItemForList(null);
                                setNewItemContent('');
                              }
                            }}
                            autoFocus
                          />
                          <div className="task-detail-modal__item-actions">
                            <button
                              className="task-detail-modal__action-btn task-detail-modal__action-btn--small"
                              onClick={() => handleCreateItem(list.id)}
                            >
                              Add
                            </button>
                            <button
                              className="task-detail-modal__action-btn task-detail-modal__action-btn--small"
                              onClick={() => {
                                setCreatingItemForList(null);
                                setNewItemContent('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : canEdit ? (
                        <button
                          className="task-detail-modal__add-item-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Close any other editing states
                            setIsEditingTitle(false);
                            setIsEditingDescription(false);
                            setEditingListId(null);
                            setIsCreatingList(false);
                            setIsWritingComment(false);
                            setNewCommentText('');
                            setCreatingItemForList(list.id);
                          }}
                        >
                          <img src={plusIcon} alt="Add" />
                          Add item
                        </button>
                      ) : null}
                    </div>
                  </div>
                    </ListSortable>
                  );
                })}
                <ListEndZone />
              </SortableContext>
            </div>
          )}
        </div>

          {/* Right side - Comments */}
          <div className="task-detail-modal__right">
            <h3 className="task-detail-modal__section-title">Comments</h3>

            {/* Comment input */}
            <div className="task-detail-modal__comment-section">
              {isWritingComment ? (
                <div className="task-detail-modal__comment-edit">
                  <textarea
                    className="task-detail-modal__comment-textarea"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCommentCancel();
                      }
                    }}
                    placeholder="Write a comment..."
                    autoFocus
                  />
                  <div className="task-detail-modal__description-actions">
                    <button className="task-detail-modal__action-btn" onClick={handleCommentSave}>
                      Save
                    </button>
                    <button className="task-detail-modal__action-btn" onClick={handleCommentCancel}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="task-detail-modal__comment-placeholder"
                  onClick={handleCommentClick}
                >
                  <span className="task-detail-modal__empty-state">Write a comment...</span>
                </div>
              )}
            </div>

            {/* Comments list */}
            <div className="task-detail-modal__comments-list">
              {comments.length === 0 ? (
                <div className="task-detail-modal__empty-state">
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="task-detail-modal__comment">
                    <div className="task-detail-modal__comment-header">
                      <Avatar size={32} profilePicture={comment.user.profile_picture} />
                      <div className="task-detail-modal__comment-info">
                        <span className="task-detail-modal__comment-username">
                          {comment.user.username}
                        </span>
                        <span className="task-detail-modal__comment-date">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </div>
                      {currentUser?.id === comment.user.id && (
                        <button
                          className="task-detail-modal__comment-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete comment"
                        >
                          <img src={closeIcon} alt="Delete" />
                        </button>
                      )}
                    </div>
                    <div className="task-detail-modal__comment-separator"></div>
                    <div className="task-detail-modal__comment-content">
                      {comment.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DragOverlay zIndex={9999} dropAnimation={null}>
          {activeItem ? (
            <div style={{
              width: '400px',
              opacity: 0.95,
              cursor: 'grabbing',
              transform: 'rotate(2deg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}>
              <div className="task-detail-modal__list-item">
                <label className="task-detail-modal__checkbox-container">
                  <input type="checkbox" checked={activeItem.completed} readOnly />
                  <span className="task-detail-modal__checkbox-custom"></span>
                </label>
                <span className={`task-detail-modal__item-content ${activeItem.completed ? 'task-detail-modal__item-content--completed' : ''}`}>
                  {activeItem.content}
                </span>
              </div>
            </div>
          ) : activeList ? (
            <ListGhost list={activeList} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Modal>
  );
}
