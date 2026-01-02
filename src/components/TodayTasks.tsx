import React from 'react';
import { CheckSquare, Clock, Bookmark, AlertCircle, Check } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const TodayTasks: React.FC = () => {
  const { tasks, categories, toggleComplete, toggleBookmark } = useTasks();
  const navigate = useNavigate();
  
  // Tâches prioritaires pour aujourd'hui
  const todayTasks = tasks
    .filter(task => !task.completed)
    .filter(task => {
      const taskDate = new Date(task.deadline);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString() || task.priority <= 2;
    })
    .sort((a, b) => {
      // Trier par favoris puis par priorité
      if (a.bookmarked && !b.bookmarked) return -1;
      if (!a.bookmarked && b.bookmarked) return 1;
      return a.priority - b.priority;
    })
    .slice(0, 5); // Limiter à 5 tâches

  const totalTime = todayTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getPriorityIcon = (priority: number) => {
    if (priority <= 2) return <AlertCircle size={16} className="text-red-500" />;
    return null;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-800/30">
          <CheckSquare size={24} className="text-blue-700 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">Tâches prioritaires</h2>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">
            {todayTasks.length} tâches • {Math.floor(totalTime / 60)}h{totalTime % 60}min
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {todayTasks.map(task => {
          const categoryData = getCategoryData(task.category);
          return (
              <div 
                key={task.id}
                onClick={() => navigate('/tasks', { state: { openTaskId: task.id } })}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
                  task.isCollaborative ? 'collaborative-task' : ''
                } ${task.priority <= 2 ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' : ''}`}
                style={{
                  backgroundColor: task.priority > 2 && !task.isCollaborative && categoryData ? `${categoryData.color}20` : undefined,
                  borderColor: task.priority > 2 && !task.isCollaborative && categoryData ? `${categoryData.color}50` : undefined,
                }}
            >
              <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(task.id);
                    }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-400 hover:border-green-500'
                    }`}
                    title={task.completed ? "Marquer comme non faite" : "Marquer comme faite"}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[rgb(var(--color-text-primary))]">{task.name}</h3>
                    {getPriorityIcon(task.priority)}
                    {task.isCollaborative && (
                      <span className="text-xs bg-blue-600 dark:bg-blue-600 text-white px-2 py-1 rounded-full">
                        Collaboratif
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-[rgb(var(--color-text-secondary))]">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{task.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryData?.color || '#CBD5E1' }}
                      ></span>
                      <span>P{task.priority}</span>
                    </div>
                    <div className="text-xs">
                      {new Date(task.deadline).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(task.id);
                  }}
                  className="flex-shrink-0 p-1 rounded-md transition-colors hover:bg-[rgb(var(--color-hover))]"
                >
                  <Bookmark 
                    size={18} 
                    className={task.bookmarked ? 'favorite-icon filled' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'} 
                  />
                </button>
              </div>
            </div>
          );
        })}

        {todayTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune tâche prioritaire</p>
            <p className="text-sm">Toutes vos tâches urgentes sont terminées !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTasks;
