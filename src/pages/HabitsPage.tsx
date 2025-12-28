import React, { useState } from 'react';
import { Plus, Calendar, Clock, Flame, CheckCircle, Circle, X, Edit2, Trash2, Grid3X3, List } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import HabitCard from '../components/HabitCard';
import HabitForm from '../components/HabitForm';
import HabitTable from '../components/HabitTable';

const HabitsPage: React.FC = () => {
  const { habits, toggleHabitCompletion } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

    const getTodayCompletionRate = () => {
      if (habits.length === 0) return 0;
      const today = new Date().toLocaleDateString('en-CA');
      const completedToday = habits.filter(habit => habit.completions[today]).length;
      return Math.round((completedToday / habits.length) * 100);
    };
    return (
      <div className="p-8" style={{ backgroundColor: 'rgb(var(--color-background))' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Habitudes</h1>
            <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Développez de bonnes habitudes au quotidien</p>
            {habits.length > 0 && (
              <div className="mt-2 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
                Progression du jour : {getTodayCompletionRate()}% ({habits.filter(h => h.completions[new Date().toLocaleDateString('en-CA')]).length}/{habits.length})
              </div>
            )}
          </div>
        <div className="flex items-center gap-4">
          {habits.length > 0 && (
            <div className="flex items-center rounded-lg p-1 transition-colors" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'rgb(var(--color-surface))' : 'transparent',
                  color: viewMode === 'list' ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-text-secondary))',
                  boxShadow: viewMode === 'list' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <List size={16} />
                <span>Liste</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{
                  backgroundColor: viewMode === 'table' ? 'rgb(var(--color-surface))' : 'transparent',
                  color: viewMode === 'table' ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-text-secondary))',
                  boxShadow: viewMode === 'table' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <Grid3X3 size={16} />
                <span>Tableau</span>
              </button>
            </div>
          )}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
            <Plus size={20} />
            <span>Nouvelle habitude</span>
          </button>
        </div>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="mb-6">
          <HabitForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* Habits List */
        <div className="space-y-6">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}

          {habits.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
                <Calendar size={32} style={{ color: 'rgb(var(--color-text-muted))' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Aucune habitude</h3>
              <p className="mb-6" style={{ color: 'rgb(var(--color-text-secondary))' }}>Commencez par créer votre première habitude</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  Créer une habitude
                </button>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <HabitTable />
      )}
    </div>
  );
};

export default HabitsPage;
