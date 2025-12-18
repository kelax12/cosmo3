import AnimatedList from './AnimatedList';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bookmark, Calendar, MoreHorizontal, Trash2, BookmarkCheck, Palette, UserPlus } from 'lucide-react';
import { Task, useTasks } from '../context/TaskContext';
import TaskCategoryIndicator from './TaskCategoryIndicator';
import TaskModal from './TaskModal';
import AddToListModal from './AddToListModal';
import ColorSettingsModal from './ColorSettingsModal';
import TaskToEventModal from './TaskToEventModal';
import CollaboratorModal from './CollaboratorModal';

type TaskTableProps = {
  tasks?: Task[];
  sortField?: string;
  showCompleted?: boolean;
  selectedTaskId?: string | null;
  onTaskModalClose?: () => void;
};

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks: propTasks, 
  sortField, 
  showCompleted = false,
  selectedTaskId: externalSelectedTaskId,
  onTaskModalClose
}) => {
  const { tasks: contextTasks, deleteTask, toggleBookmark, toggleComplete, addEvent, priorityRange } = useTasks();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedTaskForCollaborators, setSelectedTaskForCollaborators] = useState<string | null>(null);
  const [addToListTask, setAddToListTask] = useState<string | null>(null);
  const [collaboratorModalTask, setCollaboratorModalTask] = useState<string | null>(null);
  const [taskToEventModal, setTaskToEventModal] = useState<Task | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showColorSettings, setShowColorSettings] = useState(false);

  const tasks = propTasks || contextTasks;

  useEffect(() => {
    if (externalSelectedTaskId) {
      setSelectedTask(externalSelectedTaskId);
    }
  }, [externalSelectedTaskId]);

  const handleCloseTaskModal = () => {
    setSelectedTask(null);
    if (onTaskModalClose) {
      onTaskModalClose();
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortDirection('asc');
    }
  };

  // Filter tasks based on completion status, bookmark filter and priority range
  const filteredByCompletion = (showCompleted 
    ? tasks.filter(task => task.completed)
    : tasks.filter(task => !task.completed)
  ).filter(task => task.priority >= priorityRange[0] && task.priority <= priorityRange[1]);

  const filteredTasks = showBookmarkedOnly 
    ? filteredByCompletion.filter(task => task.bookmarked)
    : filteredByCompletion;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First, prioritize bookmarked tasks
    if (a.bookmarked && !b.bookmarked) return -1;
    if (!a.bookmarked && b.bookmarked) return 1;

    // Then apply the selected sort
    if (!sortField) return 0;

    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'priority') {
      comparison = a.priority - b.priority;
    } else if (sortField === 'deadline') {
      comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else if (sortField === 'estimatedTime') {
      comparison = a.estimatedTime - b.estimatedTime;
    } else if (sortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortField === 'completedAt' && showCompleted) {
      const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      comparison = aDate - bDate;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const selectedTaskData = tasks.find(task => task.id === selectedTask);
  const selectedTaskForCollaboratorsData = tasks.find(task => task.id === selectedTaskForCollaborators);

  const handleCreateEventFromTask = (eventData: any) => {
    if (taskToEventModal) {
      addEvent({
        ...eventData,
        taskId: taskToEventModal.id
      });
    }
    setTaskToEventModal(null);
  };

  const handleTaskComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete(taskId);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showBookmarkedOnly 
                ? 'bg-primary-100 text-primary-700 dark:bg-slate-100 dark:text-slate-900' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {showBookmarkedOnly ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            <span>{showBookmarkedOnly ? 'Tous' : 'Favoris'}</span>
          </button>

          <button
            onClick={() => setShowColorSettings(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Palette size={20} />
            <span>Couleurs</span>
          </button>
        </div>
      </div>

      <div className="table-container shadow-sm overflow-x-auto">
        <table className="data-table" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th className="px-2 py-3" style={{ width: '30px' }}></th>
              <th className="px-1 py-3" style={{ width: '30px' }}></th>
              <th 
                className="cursor-pointer px-2 py-3"
                onClick={() => handleSort('name')}
                style={{ width: '140px' }}
              >
                Nom de la tache
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer text-center px-1 py-3"
                onClick={() => handleSort('priority')}
                style={{ width: '70px' }}
              >
                Priorité
                {sortField === 'priority' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer px-2 py-3"
                onClick={() => handleSort('deadline')}
                style={{ width: '100px' }}
              >
                Dead line
                {sortField === 'deadline' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer text-center px-1 py-3"
                onClick={() => handleSort('estimatedTime')}
                style={{ width: '70px' }}
              >
                TEMPS
                {sortField === 'estimatedTime' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="text-center px-1 py-3" style={{ width: '220px' }}>Actions</th>
              <th 
                className="cursor-pointer px-2 py-3"
                onClick={() => handleSort(showCompleted ? 'completedAt' : 'createdAt')}
                style={{ width: '90px' }}
              >
                {showCompleted ? 'Réalisé' : 'Créé'}
                {sortField === (showCompleted ? 'completedAt' : 'createdAt') && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr 
                key={task.id} 
                className={`animate-fade-in cursor-pointer transition-colors ${
                  task.bookmarked ? 'bg-primary-100 bg-opacity-60' : ''
                } ${task.completed ? 'opacity-75' : ''}`}
                onClick={() => setSelectedTask(task.id)}
                style={{ 
                  backgroundColor: task.bookmarked ? 'rgb(var(--color-accent) / 0.1)' : 'transparent'
                }}
              >
                <td className="text-center px-2 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={(e) => handleTaskComplete(task.id, e as any)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-800"
                  />
                </td>
                <td className="px-1 py-4 whitespace-nowrap">
                  <TaskCategoryIndicator category={task.category} />
                </td>
                <td className={`font-medium px-2 py-4 text-base ${task.completed ? 'line-through' : ''}`} 
                    style={{ color: task.completed ? 'rgb(var(--color-text-muted))' : 'rgb(var(--color-text-primary))' }}>
                  <div className="truncate" title={task.name}>
                    {task.name}
                  </div>
                </td>
                <td className="text-center px-1 py-4 whitespace-nowrap">
                  <span className={`inline-flex justify-center items-center w-8 h-8 rounded-full task-priority-${task.priority} text-base font-bold`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-base font-medium">
                  {formatDate(task.deadline)}
                </td>
                <td className="text-center px-1 py-4 whitespace-nowrap text-base font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>{task.estimatedTime}</td>
                <td onClick={e => e.stopPropagation()} className="px-2 py-4 whitespace-nowrap">
                  <div className="flex justify-center items-center gap-1">
                    <button 
                      onClick={() => toggleBookmark(task.id)} 
                      className={`p-2 rounded transition-colors ${task.bookmarked ? 'favorite-icon filled' : ''}`}
                      style={{ 
                        color: task.bookmarked ? '#EAB308' : 'rgb(var(--color-text-muted))'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Favori"
                    >
                      <Bookmark size={16} className={task.bookmarked ? 'favorite-icon filled' : ''} />
                    </button>
                    {!task.completed && (
                      <button 
                        onClick={() => setTaskToEventModal(task)}
                        className="p-2 rounded transition-colors hover:text-blue-500"
                        style={{ color: 'rgb(var(--color-text-muted))' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                          e.currentTarget.style.color = 'rgb(var(--color-accent))';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
                        }}
                        title="Ajouter au calendrier"
                      >
                        <Calendar size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setAddToListTask(task.id)}
                      className="p-2 rounded transition-colors"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                        e.currentTarget.style.color = 'rgb(var(--color-text-secondary))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
                      }}
                      title="Options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <button 
                      onClick={() => setCollaboratorModalTask(task.id)}
                      className="p-2 rounded transition-colors hover:text-blue-500"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                        e.currentTarget.style.color = 'rgb(var(--color-accent))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
                      }}
                      title="Ajouter collaborateur"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)} 
                      className="p-2 rounded transition-colors hover:text-red-500"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                        e.currentTarget.style.color = 'rgb(var(--color-error))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-base" style={{ color: 'rgb(var(--color-text-primary))' }}>
                  {showCompleted && task.completedAt 
                    ? formatDate(task.completedAt) 
                    : formatDate(task.createdAt)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty state */}
        {sortedTasks.length === 0 && (
          <div className="text-center py-12" style={{ color: 'rgb(var(--color-text-muted))' }}>
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>
              {showCompleted ? 'Aucune tâche complétée' : 'Aucune tâche'}
            </h3>
            <p className="text-sm">
              {showCompleted ? 'Complétez des tâches pour les voir ici' : 'Créez votre première tâche pour commencer'}
            </p>
          </div>
        )}
      </div>

      {selectedTaskData && (
        <TaskModal
          task={selectedTaskData}
          isOpen={!!selectedTask}
          onClose={handleCloseTaskModal}
        />
      )}

      {selectedTaskForCollaboratorsData && (
        <TaskModal
          task={selectedTaskForCollaboratorsData}
          isOpen={!!selectedTaskForCollaborators}
          onClose={() => setSelectedTaskForCollaborators(null)}
          showCollaborators={true}
        />
      )}

      <AddToListModal
        isOpen={!!addToListTask}
        onClose={() => setAddToListTask(null)}
        taskId={addToListTask || ''}
      />

      {collaboratorModalTask && (
        <CollaboratorModal
          isOpen={!!collaboratorModalTask}
          onClose={() => setCollaboratorModalTask(null)}
          taskId={collaboratorModalTask}
        />
      )}

      {taskToEventModal && (
        <TaskToEventModal
          isOpen={true}
          onClose={() => setTaskToEventModal(null)}
          task={taskToEventModal}
          onConvert={handleCreateEventFromTask}
        />
      )}

      <ColorSettingsModal
        isOpen={showColorSettings}
        onClose={() => setShowColorSettings(false)}
      />
    </>
  );
};

export default TaskTable;
