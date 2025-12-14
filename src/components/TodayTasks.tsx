import React from 'react';
import { CheckSquare, Clock, Star, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const TodayTasks: React.FC = () => {
  const { tasks, toggleComplete, toggleBookmark } = useTasks();
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

  const getCategoryColor = (category: string) => {
    const colors = {
      red: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-800/40 hover:border-red-500 dark:hover:border-red-600',
      blue: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800/40 hover:border-blue-500 dark:hover:border-blue-600',
      green: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800/40 hover:border-green-500 dark:hover:border-green-600',
      purple: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-800/40 hover:border-purple-500 dark:hover:border-purple-600',
      orange: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-800/40 hover:border-orange-500 dark:hover:border-orange-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700/60 hover:border-gray-500 dark:hover:border-gray-600';
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
        {todayTasks.map(task => (
          <div 
            key={task.id}
            onClick={() => navigate('/tasks', { state: { openTaskId: task.id } })}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
              task.isCollaborative ? 'collaborative-task' : getCategoryColor(task.category)
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComplete(task.id);
                }}
                className="flex-shrink-0"
              >
                <CheckSquare size={20} className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400" />
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
                    <span className={`w-3 h-3 rounded-full bg-${task.category}-500`}></span>
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
                className="flex-shrink-0"
              >
                <Star 
                  size={18} 
                  className={task.bookmarked ? 'favorite-icon filled' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400'} 
                />
              </button>
            </div>
          </div>
        ))}

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
