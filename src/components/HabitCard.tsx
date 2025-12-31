import React, { useState, useEffect } from 'react';
import { Clock, Flame, Calendar, Edit2, Trash2, CheckCircle, Circle, X, Save } from 'lucide-react';
import { useTasks, Habit } from '../context/TaskContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

interface HabitCardProps {
  habit: Habit;
  externalIsEditing?: boolean;
  onExternalEditingChange?: (isEditing: boolean) => void;
}

const colorOptions = [
  { value: 'blue', color: '#3B82F6' },
  { value: 'green', color: '#10B981' },
  { value: 'purple', color: '#8B5CF6' },
  { value: 'orange', color: '#F97316' },
  { value: 'red', color: '#EF4444' },
  { value: 'pink', color: '#EC4899' },
];

const HabitCard: React.FC<HabitCardProps> = ({ habit, externalIsEditing, onExternalEditingChange }) => {
  const { toggleHabitCompletion, deleteHabit, updateHabit } = useTasks();
  const [showDetails, setShowDetails] = useState(false);
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: habit.name,
    estimatedTime: habit.estimatedTime,
    color: habit.color
  });

  // Use external editing state if provided, otherwise use internal
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = onExternalEditingChange || setInternalIsEditing;

  // Auto-start editing mode if externalIsEditing is true
  useEffect(() => {
    if (externalIsEditing) {
      setEditData({
        name: habit.name,
        estimatedTime: habit.estimatedTime,
        color: habit.color
      });
    }
  }, [externalIsEditing, habit]);

  const generateDays = (count: number, endAtToday = true) => {
    const today = new Date();
    const days = [];
    
    // Si endAtToday est true, le dernier jour est aujourd'hui
    const startOffset = endAtToday ? -(count - 1) : Math.floor(count / 2) * -1;
    const endOffset = endAtToday ? 0 : Math.floor(count / 2);
    
      for (let i = startOffset; i <= endOffset; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
          date: date.toLocaleDateString('en-CA'),
          dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          dayNumber: date.getDate(),
          isToday: i === 0,
        });
      }
    
    return days;
  };

  const compactDays = generateDays(7, true);
  const detailedDays = generateDays(30, true);

  const handleDayClick = (date: string) => {
    toggleHabitCompletion(habit.id, date);
  };

  const handleSaveEdit = () => {
    updateHabit(habit.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: habit.name,
      estimatedTime: habit.estimatedTime,
      color: habit.color
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const habitColor = habit.color.startsWith('#') 
    ? habit.color 
    : (colorOptions.find(c => c.value === habit.color)?.color || '#3B82F6');

  return (
    <div className="card p-6 hover:shadow-md transition-all">
      {isEditing ? (
        /* Mode édition */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Modifier l'habitude</h3>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm"
            >
              <X size={14} />
              Annuler
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom de l'habitude
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Temps estimé (min)
              </label>
              <input
                type="number"
                value={editData.estimatedTime}
                onChange={(e) => setEditData({ ...editData, estimatedTime: Number(e.target.value) })}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Couleur
            </label>
            <div className="flex gap-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditData({ ...editData, color: option.value })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 ${
                    editData.color === option.value ? 'border-slate-900 scale-110' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: option.color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <Save size={16} />
              Sauvegarder
            </button>
          </div>
        </div>
      ) : (
        /* Mode affichage normal */
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: habitColor }}
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{habit.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{habit.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame size={14} className="text-orange-500" />
                    <span>{habit.streak} jours</span>
                  </div>
                </div>
              </div>
            </div>
            
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    showDetails 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Calendar size={16} />
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer l'habitude "{habit.name}" ? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteHabit(habit.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Calendrier compact - toujours visible */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">7 derniers jours</span>
            </div>
            <div className="flex gap-2">
                {compactDays.map(day => {
                  const isCompleted = habit.completions[day.date];
                  const createdDate = habit.createdAt ? habit.createdAt.split('T')[0] : '';
                  const isBeforeCreation = createdDate ? day.date < createdDate : false;
                  
                  return (
                    <div key={day.date} className="flex flex-col items-center">
                      <div className="text-xs text-slate-500 mb-1 font-medium">{day.dayName}</div>
                          <button
                            onClick={() => !isBeforeCreation && handleDayClick(day.date)}
                            disabled={isBeforeCreation}
                            className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                              day.isToday 
                                ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800' 
                                : 'border-slate-200 dark:border-slate-700'
                            } ${
                              isCompleted 
                                ? 'border-blue-500 text-white' 
                                : isBeforeCreation
                                  ? 'opacity-30 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-transparent'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                            style={{
                              backgroundColor: isCompleted ? '#2563EB' : undefined
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle size={16} />
                            ) : isBeforeCreation ? (
                              <Circle size={14} className="opacity-10" />
                            ) : (
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{day.dayNumber}</span>
                            )}
                          </button>

                    </div>
                  );
                })}

            </div>
          </div>

            {/* Vue détaillée */}
            {showDetails && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Suivi détaillé (30 jours)</h4>
                  <div className="grid grid-cols-10 gap-1">
                    {detailedDays.map(day => {
                      const isCompleted = habit.completions[day.date];
                      const createdDate = habit.createdAt ? habit.createdAt.split('T')[0] : '';
                      const isBeforeCreation = createdDate ? day.date < createdDate : false;
                      
                      return (
                        <div key={day.date} className="flex flex-col items-center">
                          <div className="text-[10px] text-slate-500 mb-0.5">{day.dayName}</div>
                            <button
                              onClick={() => !isBeforeCreation && handleDayClick(day.date)}
                              disabled={isBeforeCreation}
                              className={`w-8 h-8 rounded-md border-2 transition-all flex items-center justify-center ${
                                day.isToday 
                                  ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800' 
                                  : 'border-slate-200 dark:border-slate-700'
                              } ${
                                isCompleted 
                                  ? 'border-blue-500 text-white' 
                                  : isBeforeCreation
                                    ? 'opacity-30 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-transparent'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
style={{
                                  backgroundColor: isCompleted ? '#2563EB' : undefined
                                }}
                            >
                              {isCompleted ? (
                                <CheckCircle size={16} />
                              ) : isBeforeCreation ? (
                                <Circle size={14} className="opacity-10" />
                              ) : (
                                <span className="text-xs text-slate-600 dark:text-slate-400">{day.dayNumber}</span>
                              )}
                            </button>

                        </div>
                      );
                    })}
                  </div>

            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HabitCard;
