import React, { useState } from 'react';
import { Clock, Flame, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const colorOptions = [
  { value: 'blue', color: '#3B82F6' },
  { value: 'green', color: '#10B981' },
  { value: 'purple', color: '#8B5CF6' },
  { value: 'orange', color: '#F97316' },
  { value: 'red', color: '#EF4444' },
  { value: 'pink', color: '#EC4899' },
];

type PeriodType = 'week' | 'month' | '3months' | 'all';

  const HabitTable: React.FC = () => {
    const { habits, toggleHabitCompletion } = useTasks();
    const [period, setPeriod] = useState<PeriodType>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const periodOptions = [
      { value: 'week' as PeriodType, label: 'Semaine', days: 7 },
      { value: 'month' as PeriodType, label: 'Mois', days: 30 },
      { value: '3months' as PeriodType, label: '3 Mois', days: 90 },
      { value: 'all' as PeriodType, label: 'Depuis création', days: 0 },
    ];

      const getOldestHabitDate = () => {
        if (habits.length === 0) return new Date();
        
        let oldestDate = new Date();
        oldestDate.setHours(0, 0, 0, 0);

        habits.forEach(habit => {
          // Prendre en compte la date de création si elle existe
          if (habit.createdAt) {
            const createdDate = new Date(habit.createdAt);
            createdDate.setHours(0, 0, 0, 0);
            if (createdDate < oldestDate) {
              oldestDate = createdDate;
            }
          }

          const completionDates = Object.keys(habit.completions);
          if (completionDates.length > 0) {
            const habitOldestDate = new Date(Math.min(...completionDates.map(date => parseLocalDate(date).getTime())));
            habitOldestDate.setHours(0, 0, 0, 0);
            if (habitOldestDate < oldestDate) {
              oldestDate = habitOldestDate;
            }
          }
        });
        
        // S'assurer qu'on montre au moins les 7 derniers jours même si c'est nouveau
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        
        if (oldestDate > sevenDaysAgo) {
          return sevenDaysAgo;
        }
        
        return oldestDate;
      };

      const generateDays = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [];
        
        let startDate: Date;
        let dayCount: number;
        
        if (period === 'all') {
          startDate = getOldestHabitDate();
          startDate.setHours(0, 0, 0, 0);
          // S'assurer que le dernier jour est aujourd'hui
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          dayCount = Math.max(1, Math.ceil((todayEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        } else {
          const selectedPeriod = periodOptions.find(p => p.value === period);
          dayCount = selectedPeriod?.days || 7;
          
          // Pour toutes les périodes, le dernier jour visible est la date actuelle
          startDate = new Date(currentDate);
          startDate.setHours(0, 0, 0, 0);
          startDate.setDate(currentDate.getDate() - dayCount + 1);
        }
        
        for (let i = 0; i < dayCount; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          date.setHours(0, 0, 0, 0);
          
          days.push({
            date: date.toLocaleDateString('en-CA'),
            dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            dayNumber: date.getDate(),
            monthName: date.toLocaleDateString('fr-FR', { month: 'short' }),
            isToday: date.toDateString() === today.toDateString(),
            isPast: date < today,
            isFuture: date > today
          });
        }
        
        return days;
      };

  const days = generateDays();

  const handleDayClick = (habitId: string, date: string) => {
    toggleHabitCompletion(habitId, date);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (period) {
      case 'week': {
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      }
      case 'month': {
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      }
      case '3months': {
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      }
      default:
        return;
    }
    
    setCurrentDate(newDate);
  };

  const canNavigateNext = () => {
    if (period === 'all') return false;
    const today = new Date();
    const nextPeriodStart = new Date(currentDate);
    
    switch (period) {
      case 'week':
        nextPeriodStart.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        nextPeriodStart.setMonth(currentDate.getMonth() + 1);
        break;
      case '3months':
        nextPeriodStart.setMonth(currentDate.getMonth() + 3);
        break;
    }
    
    return nextPeriodStart <= today;
  };

  const getCurrentPeriodLabel = () => {
    switch (period) {
      case 'week':
        return `Semaine du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
      case 'month':
        return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case '3months':
        const endDate = new Date(currentDate);
        endDate.setMonth(currentDate.getMonth() + 2);
        return `${currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
      case 'all':
        return 'Depuis la création';
      default:
        return '';
    }
  };

  if (habits.length === 0) {
    return (
      <div className="rounded-xl shadow-sm border p-12 text-center transition-colors" style={{
        backgroundColor: 'rgb(var(--color-surface))',
        borderColor: 'rgb(var(--color-border))'
      }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
          <Circle size={32} style={{ color: 'rgb(var(--color-text-muted))' }} />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Aucune habitude à afficher</h3>
        <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Créez des habitudes pour voir le tableau de suivi</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b transition-colors" style={{
        backgroundColor: 'rgb(var(--color-hover))',
        borderColor: 'rgb(var(--color-border))'
      }}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>Tableau de suivi</h2>
            <p className="mt-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>Vue d'ensemble de toutes vos habitudes</p>
          </div>
          
          {/* Sélecteur de période */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg p-1 shadow-sm border transition-colors" style={{
              backgroundColor: 'rgb(var(--color-surface))',
              borderColor: 'rgb(var(--color-border))'
            }}>
              {periodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPeriod(option.value);
                    if (option.value !== 'all') {
                      setCurrentDate(new Date());
                    }
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: period === option.value ? 'rgb(var(--color-accent))' : 'transparent',
                    color: period === option.value ? 'white' : 'rgb(var(--color-text-secondary))',
                    boxShadow: period === option.value ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                    onMouseEnter={(e) => {
                      if (period !== option.value) {
                        e.currentTarget.style.color = 'rgb(var(--color-accent))';
                        e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (period !== option.value) {
                        e.currentTarget.style.color = 'rgb(var(--color-text-secondary))';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Navigation */}
              {period !== 'all' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigatePeriod('prev')}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'rgb(var(--color-accent))';
                      e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgb(var(--color-text-secondary))';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="text-sm font-medium min-w-[120px] text-center" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {getCurrentPeriodLabel()}
                  </div>
                  <button
                    onClick={() => navigatePeriod('next')}
                    disabled={!canNavigateNext()}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      color: canNavigateNext() ? 'rgb(var(--color-text-secondary))' : 'rgb(var(--color-text-muted))',
                      cursor: canNavigateNext() ? 'pointer' : 'not-allowed'
                    }}
                    onMouseEnter={(e) => {
                      if (canNavigateNext()) {
                        e.currentTarget.style.color = 'rgb(var(--color-accent))';
                        e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canNavigateNext()) {
                        e.currentTarget.style.color = 'rgb(var(--color-text-secondary))';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b transition-colors" style={{
            backgroundColor: 'rgb(var(--table-header-bg))',
            borderColor: 'rgb(var(--table-border))'
          }}>
            <tr>
              <th className="text-left p-4 font-semibold sticky left-0 z-10 min-w-[250px] border-r transition-colors" style={{
                color: 'rgb(var(--table-header-text))',
                backgroundColor: 'rgb(var(--table-header-bg))',
                borderColor: 'rgb(var(--table-border))'
              }}>
                Habitude
              </th>
              {days.map(day => (
                <th key={day.date} className="text-center p-2 font-medium min-w-[50px] transition-colors" style={{ color: 'rgb(var(--table-header-text))' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>{day.dayName}</div>
                  <div className={`text-sm ${day.isToday ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`} style={{
                    color: day.isToday ? 'rgb(var(--color-accent))' : 'rgb(var(--table-header-text))'
                  }}>
                    {day.dayNumber}
                  </div>
                  {(period === 'month' || period === '3months' || period === 'all') && (
                    <div className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>{day.monthName}</div>
                  )}
                </th>
              ))}
              <th className="text-center p-4 font-semibold min-w-[80px] transition-colors" style={{ color: 'rgb(var(--table-header-text))' }}>
                Série
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, index) => (
              <tr key={habit.id} className="border-b transition-colors" style={{
                borderColor: 'rgb(var(--table-border))',
                backgroundColor: index % 2 === 0 ? 'rgb(var(--table-row-even))' : 'rgb(var(--table-row-odd))'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(var(--table-row-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgb(var(--table-row-even))' : 'rgb(var(--table-row-odd))'}
              >
                <td className="p-4 sticky left-0 bg-inherit z-10 border-r transition-colors" style={{ borderColor: 'rgb(var(--table-border))' }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorOptions.find(c => c.value === habit.color)?.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate" style={{ color: 'rgb(var(--color-text-primary))' }}>{habit.name}</div>
                      <div className="text-sm flex items-center gap-2 mt-1" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{habit.estimatedTime} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                  {days.map(day => {
                    const isCompleted = habit.completions[day.date];
                    const createdDate = habit.createdAt ? habit.createdAt.split('T')[0] : '';
                    const isBeforeCreation = createdDate ? day.date < createdDate : false;
                    
                    return (
                        <td key={day.date} className="p-2 text-center transition-colors">
                          <button
                            onClick={() => handleDayClick(habit.id, day.date)}
                            disabled={day.isFuture || isBeforeCreation}
                            className="w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center mx-auto"
                              style={{
                                backgroundColor: isCompleted ? '#2563EB' : (day.isFuture || isBeforeCreation) ? 'rgb(var(--color-hover) / 0.5)' : day.isToday ? 'rgb(var(--color-accent) / 0.1)' : 'transparent',
                                borderColor: isCompleted ? '#2563EB' : day.isToday ? 'rgb(var(--color-accent))' : (day.isFuture || isBeforeCreation) ? 'transparent' : 'rgb(var(--color-border))',
                                color: isCompleted ? 'white' : (day.isFuture || isBeforeCreation) ? 'rgb(var(--color-text-muted) / 0.3)' : 'rgb(var(--color-text-secondary))',
                                cursor: (day.isFuture || isBeforeCreation) ? 'not-allowed' : 'pointer',
                                opacity: isBeforeCreation ? 0.3 : 1,
                                filter: isBeforeCreation ? 'grayscale(1)' : 'none'
                              }}
                            onMouseEnter={(e) => {
                              if (!day.isFuture && !isBeforeCreation && !isCompleted) {
                                e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                                e.currentTarget.style.borderColor = 'rgb(var(--color-accent))';
                                e.currentTarget.style.color = 'rgb(var(--color-accent))';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!day.isFuture && !isBeforeCreation && !isCompleted) {
                                e.currentTarget.style.backgroundColor = day.isToday ? 'rgb(var(--color-accent) / 0.1)' : 'transparent';
                                e.currentTarget.style.borderColor = day.isToday ? 'rgb(var(--color-accent))' : 'rgb(var(--color-border))';
                                e.currentTarget.style.color = 'rgb(var(--color-text-secondary))';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle size={14} />
                            ) : (day.isFuture || isBeforeCreation) ? (
                              <Circle size={14} className="opacity-10" />
                            ) : (
                              <Circle size={14} />
                            )}
                          </button>
                        </td>

                    );
                  })}

                <td className="p-4 text-center transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <Flame size={16} className="text-orange-500" />
                    <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{habit.streak}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Légende pour les longues périodes */}
      {(period === '3months' || period === 'all') && (
        <div className="p-4 border-t transition-colors" style={{
          backgroundColor: 'rgb(var(--color-hover))',
          borderColor: 'rgb(var(--color-border))'
        }}>
          <div className="flex items-center justify-center gap-6 text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-500"></div>
              <span>Complété</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 rounded" style={{
                backgroundColor: 'rgb(var(--color-surface))',
                borderColor: 'rgb(var(--color-border))'
              }}></div>
              <span>Non complété</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 rounded" style={{
                backgroundColor: 'rgb(var(--color-accent) / 0.1)',
                borderColor: 'rgb(var(--color-accent))'
              }}></div>
              <span>Aujourd'hui</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTable;
