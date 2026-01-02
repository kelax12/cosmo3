import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bookmark, Calendar, MoreHorizontal, Trash2, BookmarkCheck, UserPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Task, useTasks } from '../context/TaskContext';
import TaskCategoryIndicator from './TaskCategoryIndicator';
import TaskModal from './TaskModal';
import AddToListModal from './AddToListModal';
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
  sortField: propSortField, 
  showCompleted = false,
  selectedTaskId: externalSelectedTaskId,
  onTaskModalClose
}) => {
  const { tasks: contextTasks, deleteTask, toggleBookmark, toggleComplete, addEvent, priorityRange } = useTasks();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localSortField, setLocalSortField] = useState<string | undefined>(propSortField);

  useEffect(() => {
    if (propSortField) {
      setLocalSortField(propSortField);
    }
  }, [propSortField]);

  useEffect(() => {
    if (localSortField === 'priority') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  }, [localSortField]);

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedTaskForCollaborators, setSelectedTaskForCollaborators] = useState<string | null>(null);
  const [addToListTask, setAddToListTask] = useState<string | null>(null);
  const [collaboratorModalTask, setCollaboratorModalTask] = useState<string | null>(null);
  const [taskToEventModal, setTaskToEventModal] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'none' | 'favoris' | 'terminées' | 'retard'>('none');

  const tasks = propTasks || contextTasks;

  const toggleQuickFilter = (filter: 'favoris' | 'terminées' | 'retard') => {
    setActiveQuickFilter(prev => prev === filter ? 'none' : filter);
  };

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
    if (localSortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setLocalSortField(field);
      setSortDirection(field === 'priority' ? 'desc' : 'asc');
    }
  };

  let filteredTasksForView;
  const now = new Date();

  switch (activeQuickFilter) {
    case 'favoris':
      filteredTasksForView = tasks.filter(task => task.bookmarked && !task.completed);
      break;
    case 'terminées':
      filteredTasksForView = tasks.filter(task => task.completed);
      break;
    case 'retard':
      filteredTasksForView = tasks.filter(task => !task.completed && new Date(task.deadline) < now);
      break;
    default:
      filteredTasksForView = showCompleted 
        ? tasks.filter(task => task.completed)
        : tasks.filter(task => !task.completed);
  }

  const filteredTasks = filteredTasksForView.filter(task => 
    task.priority >= priorityRange[0] && task.priority <= priorityRange[1]
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (localSortField) {
      let comparison = 0;
      if (localSortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (localSortField === 'priority') {
        comparison = a.priority - b.priority;
      } else if (localSortField === 'deadline') {
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (localSortField === 'estimatedTime') {
        comparison = a.estimatedTime - b.estimatedTime;
      } else if (localSortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (localSortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (localSortField === 'completedAt' && showCompleted) {
        const aDate = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bDate = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        comparison = aDate - bDate;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    if (a.bookmarked && !b.bookmarked) return -1;
    if (!a.bookmarked && b.bookmarked) return 1;

    return 0;
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

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return 'N/A';
    }
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={() => toggleQuickFilter('favoris')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm border ${
              activeQuickFilter === 'favoris' 
                ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600 shadow-md' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
            }`}
          >
            {activeQuickFilter === 'favoris' ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            <span>{activeQuickFilter === 'favoris' ? 'Tous' : 'Favoris'}</span>
          </button>

          <button
            onClick={() => toggleQuickFilter('terminées')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm border ${
              activeQuickFilter === 'terminées'
                ? 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 size={20} />
            <span>Terminées</span>
          </button>

          <button
            onClick={() => toggleQuickFilter('retard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm border ${
              activeQuickFilter === 'retard'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 shadow-md'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
            }`}
            title="Afficher uniquement les tâches en retard"
          >
            <AlertTriangle size={20} />
            <span>Retard</span>
          </button>
        </div>
      </div>

<div className="table-container shadow-sm overflow-x-auto">
          <table className="data-table w-full" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th className="px-2 py-3" style={{ width: '40px' }}></th>
                              <th className="px-1 py-3" style={{ width: '30px' }}></th>
<th 
                  className="cursor-pointer px-2 py-3"
                  onClick={() => handleSort('name')}
                >
                  Nom de la tache
                {localSortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer text-center px-1 py-3"
                onClick={() => handleSort('priority')}
                style={{ width: '70px' }}
              >
                Priorité
                {localSortField === 'priority' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer px-2 py-3"
                onClick={() => handleSort('deadline')}
                style={{ width: '100px' }}
              >
                Dead line
                {localSortField === 'deadline' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="cursor-pointer text-center px-1 py-3"
                onClick={() => handleSort('estimatedTime')}
                style={{ width: '70px' }}
              >
                TEMPS
                {localSortField === 'estimatedTime' && (
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
                {localSortField === (showCompleted ? 'completedAt' : 'createdAt') && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className={`animate-fade-in cursor-pointer transition-colors ${task.completed ? 'opacity-75' : ''}`}
                  onClick={() => setSelectedTask(task.id)}
                  style={{ 
                    backgroundColor: activeQuickFilter === 'retard' 
                      ? 'rgba(239, 68, 68, 0.15)' 
                      : (task.bookmarked ? 'rgba(234, 179, 8, 0.15)' : 'transparent'),
                    borderLeft: activeQuickFilter === 'retard'
                      ? '3px solid #EF4444'
                      : (task.bookmarked ? '3px solid #EAB308' : '3px solid transparent')
                  }}
                >
                <td className="px-2 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-400 hover:border-blue-500'
                    }`}
                    title={task.completed ? "Marquer comme non faite" : "Marquer comme faite"}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
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
                      title="Favori"
                    >
                      <Bookmark size={16} />
                    </button>
                    {!task.completed && (
                      <button 
                        onClick={() => setTaskToEventModal(task)}
                        className="p-2 rounded transition-colors"
                        style={{ color: 'rgb(var(--color-text-muted))' }}
                        title="Ajouter au calendrier"
                      >
                        <Calendar size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setAddToListTask(task.id)}
                      className="p-2 rounded transition-colors"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      title="Options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <button 
                      onClick={() => setCollaboratorModalTask(task.id)}
                      className="p-2 rounded transition-colors"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      title="Ajouter collaborateur"
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      onClick={() => setTaskToDelete(task.id)} 
                      className="p-2 rounded transition-colors"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
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

      {taskToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supprimer la tâche</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md shadow-red-500/20"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default TaskTable;
