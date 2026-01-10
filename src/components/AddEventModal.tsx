import React, { useState, useEffect } from 'react';
import { X, Clock, Plus } from 'lucide-react';
import { Task, useTasks } from '../context/TaskContext';
import ColorSettingsModal from './ColorSettingsModal';
import { DatePicker } from './ui/date-picker';

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onAddEvent: (event: {
    title: string;
    start: string;
    end: string;
    color: string;
    notes?: string;
    taskId?: string;
  }) => void;
  prefilledTimeSlot?: {
    start: string;
    end: string;
  };
};

const AddEventModal: React.FC<AddEventModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onAddEvent, 
  prefilledTimeSlot 
}) => {
  const { categories } = useTasks();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prefilled = new Set<string>();
      
      setTitle(task.name || '');
      if (task.name) prefilled.add('title');
      
      if (prefilledTimeSlot) {
        const start = new Date(prefilledTimeSlot.start);
        const end = new Date(prefilledTimeSlot.end);
        setStartDate(start.toISOString().split('T')[0]);
        setStartTime(start.toTimeString().slice(0, 5));
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toTimeString().slice(0, 5));
        if (task.description || task.notes) {
          setNotes(task.description || task.notes || '');
          prefilled.add('notes');
        }
        prefilled.add('startDate');
        prefilled.add('startTime');
        prefilled.add('endDate');
        prefilled.add('endTime');
      } else if (task.id !== '') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        setStartDate(todayStr);
        setEndDate(todayStr);
        
        if (task.description || task.notes) {
          setNotes(task.description || task.notes || '');
          prefilled.add('notes');
        }

        // Use task estimated time if available
        if (task.estimatedTime) {
          const defaultStart = '12:00';
          setStartTime(defaultStart);
          const startTimeDate = new Date(`${todayStr}T${defaultStart}`);
          const endTimeDate = new Date(startTimeDate.getTime() + task.estimatedTime * 60000);
          setEndTime(endTimeDate.toTimeString().slice(0, 5));
          setEndDate(endTimeDate.toISOString().split('T')[0]);
          prefilled.add('endTime');
          prefilled.add('endDate');
          prefilled.add('startTime');
        }
      } else {
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setNotes('');
      }

      if (task.category) {
        const categoryColor = categories.find(cat => cat.id === task.category)?.color;
        setColor(categoryColor || categories[0]?.color || '#3B82F6');
      } else {
        setColor(categories[0]?.color || '#3B82F6');
      }

      setPrefilledFields(prefilled);
    }
  }, [isOpen, task, prefilledTimeSlot, categories]);

  const handleFieldChange = (field: string, setter: (val: any) => void, value: any) => {
    setter(value);
    setPrefilledFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Veuillez saisir un titre pour l\'événement');
      return;
    }
    
    const start = new Date(`${startDate}T${startTime}`).toISOString();
    const end = new Date(`${endDate}T${endTime}`).toISOString();
    if (new Date(end) <= new Date(start)) {
      alert('La date de fin doit être après la date de début');
      return;
    }
    
    onAddEvent({
      title: title.trim(),
      start,
      end,
      color,
      notes: notes.trim(),
      taskId: task.id
    });
    
    onClose();
    setTitle('');
    setNotes('');
    setColor(categories[0]?.color || '#3B82F6');
  };

  const formatTimeDisplay = (timeValue: string) => {
    if (!timeValue) return '';
    const [hours, minutes] = timeValue.split(':');
    return `${hours}h${minutes}`;
  };

  const calculateDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffMs <= 0) return " Fin avant début";
    if (diffHours === 0) return `${diffMinutes} min`;
    if (diffMinutes === 0) return `${diffHours}h`;
    return `${diffHours}h${diffMinutes}min`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 opacity-0 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden opacity-0 scale-95 animate-modal-content"
        style={{ 
          backgroundColor: 'rgb(var(--color-surface))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 transition-colors"
          style={{ borderColor: 'rgb(var(--color-border))' }}>

          <h2
            className="text-xl font-bold"
            style={{ color: 'rgb(var(--color-text-primary))' }}>
            Ajouter un événement
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgb(var(--color-text-muted))' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgb(var(--color-text-primary))';
              e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-5 overflow-y-auto max-h-[85vh] md:max-h-none">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-5">
            {/* Colonne gauche */}
            <div className="md:col-span-7 space-y-3">
              {/* Titre */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1 !whitespace-pre-line"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Titre de l'événement
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleFieldChange('title', setTitle, e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    prefilledFields.has('title') ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                  }`}
                  style={{
                    backgroundColor: prefilledFields.has('title') ? undefined : 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: prefilledFields.has('title') ? undefined : 'rgb(var(--color-border))'
                  }}
                  placeholder="Nom de l'événement"
                  required />
              </div>

                    {/* Planification */}
                       <div
                         className="p-4 rounded-2xl border transition-colors shadow-inner"
                         style={{ 
                           backgroundColor: 'rgb(var(--color-surface))',
                           borderColor: 'rgb(var(--color-border))'
                         }}
                       >
                    <div className="grid grid-cols-1 gap-2">
                      {/* Début */}
                      <div 
                        className="group p-2 rounded-xl transition-colors hover:bg-slate-500/5 dark:hover:bg-white/5"
                        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span
                              className="text-sm font-bold"
                              style={{ color: 'rgb(var(--color-text-primary))' }}>
                              Début de l'événement
                            </span>
                          </div>
                          {startTime &&
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                              style={{
                                backgroundColor: prefilledFields.has('startTime') ? 'rgba(59, 130, 246, 0.1)' : 'rgb(var(--color-hover))',
                                color: prefilledFields.has('startTime') ? 'rgb(59, 130, 246)' : 'rgb(var(--color-text-secondary))',
                                borderColor: prefilledFields.has('startTime') ? 'rgba(59, 130, 246, 0.2)' : 'rgb(var(--color-border))'
                              }}>
                              {formatTimeDisplay(startTime)}
                            </span>
                          }
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <DatePicker
                              value={startDate}
                              onChange={(date) => handleFieldChange('startDate', setStartDate, date)}
                              placeholder="Sélectionner une date"
                              className={`h-11 ${
                                prefilledFields.has('startDate') ? 'border-blue-300 dark:border-blue-800' : ''
                              }`}
                            />
                          </div>
    
                              <div className="relative w-full sm:w-36">
                                  <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => handleFieldChange('startTime', setStartTime, e.target.value)}
                                    className={`w-full px-3 pr-10 py-2.5 h-11 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:border-blue-400 dark:text-white ${
                                      prefilledFields.has('startTime')
                                        ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-white/10'
                                    }`}
                                    style={{
                                      backgroundColor: prefilledFields.has('startTime') ? undefined : 'rgb(var(--color-surface))',
                                      borderColor: prefilledFields.has('startTime') ? undefined : 'rgb(var(--color-border))'
                                    }}
                                    required />
                                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                              </div>
                        </div>
                      </div>
    
                      {/* Fin */}
                      <div 
                        className="group p-2 rounded-xl transition-colors hover:bg-slate-500/5 dark:hover:bg-white/5"
                        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
                      >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: 'rgb(var(--color-text-primary))' }}>
                            Fin de l'événement
                          </span>
                        </div>
                        {endTime &&
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                            style={{
                              backgroundColor: prefilledFields.has('endTime') ? 'rgba(59, 130, 246, 0.1)' : 'rgb(var(--color-hover))',
                              color: prefilledFields.has('endTime') ? 'rgb(59, 130, 246)' : 'rgb(var(--color-text-secondary))',
                              borderColor: prefilledFields.has('endTime') ? 'rgba(59, 130, 246, 0.2)' : 'rgb(var(--color-border))'
                            }}>
                            {formatTimeDisplay(endTime)}
                          </span>
                        }
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <DatePicker
                            value={endDate}
                            onChange={(date) => handleFieldChange('endDate', setEndDate, date)}
                            placeholder="Sélectionner une date"
                            className={`h-11 ${
                              prefilledFields.has('endDate') ? 'border-blue-300 dark:border-blue-800' : ''
                            }`}
                          />
                        </div>
  
                            <div className="relative w-full sm:w-36">
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => handleFieldChange('endTime', setEndTime, e.target.value)}
                                  className={`w-full px-3 pr-10 py-2.5 h-11 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:border-blue-400 dark:text-white ${
                                    prefilledFields.has('endTime')
                                      ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-white/10'
                                  }`}
                                  style={{
                                    backgroundColor: prefilledFields.has('endTime') ? undefined : 'rgb(var(--color-surface))',
                                    borderColor: prefilledFields.has('endTime') ? undefined : 'rgb(var(--color-border))'
                                  }}
                                  required />
                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>
                      </div>
                    </div>
                  </div>

                {calculateDuration() &&
                  <div 
                    className="mt-3.5 pt-2.5 border-t border-dashed"
                    style={{ borderColor: 'rgb(var(--color-border))' }}>
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-medium"
                        style={{ color: 'rgb(var(--color-text-muted))' }}>
                        Durée totale
                      </span>
                      <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        <Clock size={12} />
                        <span>{calculateDuration()}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Description
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => handleFieldChange('notes', setNotes, e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors text-sm ${
                    prefilledFields.has('notes') ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : ''
                  }`}
                  style={{
                    backgroundColor: prefilledFields.has('notes') ? undefined : 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: prefilledFields.has('notes') ? undefined : 'rgb(var(--color-border))'
                  }}
                  placeholder="Description de l'événement" />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="md:col-span-5 space-y-3">
              {/* Couleur */}
              <div>
                <label
                  className="flex justify-between items-center text-sm font-semibold mb-2"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  <span>Couleur de l'événement</span>
<Plus 
                      className="w-6 h-6 text-blue-500 cursor-pointer hover:scale-125 transition-transform" 
                      onClick={() => setIsColorSettingsOpen(true)}
                    />
                </label>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleFieldChange('color', setColor, cat.color)}
                      className="relative w-full h-10 rounded-lg border-2 transition-all hover:scale-105 group"
                      style={{
                        backgroundColor: cat.color,
                        borderColor:
                        color === cat.color ?
                        'rgb(var(--color-text-primary))' :
                        'rgb(var(--color-border))',
                        boxShadow: color === cat.color ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
                      }}
                      title={cat.name}>
                      {color === cat.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{
                              backgroundColor: 'rgb(var(--color-surface))',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                            }} 
                          />
                        </div>
                      )}
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" style={{ color: 'rgb(var(--color-text-muted))' }}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>

                {categories.length > 0 &&
                <div
                  className="p-2.5 rounded-xl border transition-colors"
                  style={{
                    borderColor: 'rgb(var(--color-border))',
                    backgroundColor: 'rgba(var(--color-border), 0.05)'
                  }}>

                    <h4
                      className="text-[12px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'rgb(var(--color-text-muted))' }}>
                      Légende des catégories
                    </h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {categories.map((cat) =>
                      <div key={cat.id} className="flex items-center gap-1.5">
                          <div
                          className="w-2 h-2 rounded-full shadow-sm"
                          style={{ backgroundColor: cat.color }} />

                          <span
                          className="text-[13px] font-medium truncate"
                          style={{ color: 'rgb(var(--color-text-primary))' }}>
                          {cat.name}
                        </span>
                        </div>
                      )}
                    </div>
                    </div>
                    }
              </div>

                {/* Aperçu */}
                <div 
                  className="p-3 rounded-xl border transition-colors"
                  style={{ 
                    borderColor: 'rgb(var(--color-border))',
                    backgroundColor: 'rgba(var(--color-border), 0.05)'
                  }}>
                  <h4 
                    className="text-xs font-semibold mb-2" 
                    style={{ color: 'rgb(var(--color-text-primary))' }}>
                    Aperçu
                  </h4>
                <div
                  className="p-2.5 rounded-lg text-white text-center text-sm font-medium shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: color }}>
                  {title || 'Nom de l\'événement'}
                </div>
                {calculateDuration() && (
                  <div 
                    className="text-[12px] text-center mt-1.5" 
                    style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {calculateDuration()}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                  Valider
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-secondary))'
                    }}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </form>

      <ColorSettingsModal 
        isOpen={isColorSettingsOpen} 
        onClose={() => setIsColorSettingsOpen(false)} 
      />
      </div>
    </div>
  );
};

export default AddEventModal;
