import React from 'react';
import { Repeat, Clock, CheckCircle, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

const TodayHabits: React.FC = () => {
  const { habits, toggleHabitCompletion } = useTasks();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const todayHabits = habits.map((habit) => ({
    ...habit,
    completedToday: habit.completions[today] || false
  }));

  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const totalTime = todayHabits.reduce((sum, habit) =>
  habit.completedToday ? sum + habit.estimatedTime : sum, 0
  );

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
          <Repeat size={24} className="text-purple-700 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">Habitudes du jour</h2>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">
            {completedCount}/{todayHabits.length} complétées • {Math.floor(totalTime / 60)}h{totalTime % 60}min
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {todayHabits.map((habit) =>
        <div
          key={habit.id}
          className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
          habit.completedToday ?
          'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-700' :
          'bg-purple-100 dark:bg-gray-800/50 border-purple-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 hover:bg-purple-200 dark:hover:bg-purple-900/30'}`
          }
          onClick={(e) => {
            // Only toggle completion if clicking the circle icon area
            if ((e.target as HTMLElement).closest('.completion-toggle')) {
              toggleHabitCompletion(habit.id, today);
            } else {
              // Otherwise navigate to habits page with this habit
              navigate('/habits', { state: { selectedHabitId: habit.id } });
            }
          }}>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 completion-toggle" onClick={(e) => e.stopPropagation()}>
                {habit.completedToday ?
              <CheckCircle size={24} className="text-green-700 dark:text-green-400" /> :

              <Circle size={24} className="text-purple-700 dark:text-gray-500" />
              }
              </div>
              
              <div className="flex-1">
                <h3 className={`font-bold ${habit.completedToday ? 'text-green-800 dark:text-green-300 line-through' : 'text-[rgb(var(--color-text-primary))]'}`}>
                  {habit.name}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-sm text-[rgb(var(--color-text-secondary))]">
                    <Clock size={14} />
                    <span>{habit.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-orange-800 dark:text-orange-400 font-medium">
                    <span>🔥</span>
                    <span>{habit.streak} jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {todayHabits.length === 0 &&
        <div className="text-center py-8 text-[rgb(var(--color-text-muted))]">
            <Repeat size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Aucune habitude configurée</p>
            <p className="text-sm">Ajoutez des habitudes dans la section dédiée</p>
          </div>
        }
      </div>
    </div>);

};

export default TodayHabits;
