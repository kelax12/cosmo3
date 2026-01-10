import React, { useState, useEffect } from "react";
import { X, Clock, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Task, useTasks } from "../context/TaskContext";
import ColorSettingsModal from "./ColorSettingsModal";
import { DatePicker } from "./ui/date-picker";

type TaskToEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onConvert: (eventData: {
    title: string;
    start: string;
    end: string;
    color: string;
    notes?: string;
  }) => void;
};

const TaskToEventModal: React.FC<TaskToEventModalProps> = ({
  isOpen,
  onClose,
  task,
  onConvert
}) => {
  const { categories, favoriteColors } = useTasks();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.name || "");
      setNotes("");

      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000);

      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");

      // Set color based on task category if available
      if (task.category) {
        const categoryColor = categories.find((cat) => cat.id === task.category)?.color;
        setColor(categoryColor || favoriteColors[0] || '#3B82F6');
      } else {
        setColor(favoriteColors[0] || "#3B82F6");
      }
    }
  }, [isOpen, task, categories, favoriteColors]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez saisir un titre pour l'événement");
      return;
    }

    const start = new Date(`${startDate}T${startTime}`).toISOString();
    const end = new Date(`${endDate}T${endTime}`).toISOString();

    if (new Date(end) <= new Date(start)) {
      alert("La date de fin doit être après la date de début");
      return;
    }

    onConvert({
      title: title.trim(),
      start,
      end,
      color,
      notes: notes.trim()
    });

    onClose();
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
    const diffMinutes = Math.floor(diffMs % (1000 * 60 * 60) / (1000 * 60));
    if (diffMs <= 0) return " Fin avant début";
    if (diffHours === 0) return `${diffMinutes} min`;
    if (diffMinutes === 0) return `${diffHours}h`;
    return `${diffHours}h${diffMinutes}min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 opacity-0 animate-modal-backdrop" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden opacity-0 scale-95 animate-modal-content"
        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 transition-colors"
          style={{ borderColor: 'rgb(var(--color-border))' }}>

          <h2
            className="text-xl font-bold"
            style={{ color: 'rgb(var(--color-text-primary))' }}>

            Convertir en événement
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
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
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
                    }}>

                      <div className="grid grid-cols-1 gap-1">
                        {/* Début */}
                        <div 
                          className="group p-2 rounded-xl transition-colors hover:bg-slate-500/5 dark:hover:bg-white/5"
                          style={{ backgroundColor: 'rgb(var(--color-surface))' }}
                        >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: 'rgb(var(--color-text-primary))' }}>
  
                              Date & Heure de début
                            </span>
                          </div>
                            {startTime &&
                              <span
                                className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border transition-colors"
                                style={{
                                  color: 'rgb(var(--color-success))',
                                  borderColor: 'rgba(var(--color-success), 0.2)'
                                }}>
                                {formatTimeDisplay(startTime)}
                              </span>
                            }
                        </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <DatePicker
                                  value={startDate}
                                  onChange={(date) => setStartDate(date)}
                                  placeholder="Sélectionner une date"
                                  className="h-[42px]"
                                />
                            </div>
  
                            <div className="relative w-full sm:w-36">
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="hh:mm"
                                className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                                style={{
                                  backgroundColor: 'rgb(var(--color-surface))',
                                  color: 'rgb(var(--color-text-primary))',
                                  borderColor: 'rgb(var(--color-border))'
                                }}
                                required />
                            </div>
                          </div>
                      </div>
  
                      {/* Fin */}
                      <div 
                        className="group p-2 rounded-xl transition-colors hover:bg-slate-500/5 dark:hover:bg-white/5"
                        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
                      >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: 'rgb(var(--color-text-primary))' }}>

                            Date & Heure de fin
                          </span>
                        </div>
                          {endTime &&
                            <span
                              className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border transition-colors"
                              style={{
                                color: 'rgb(var(--color-error))',
                                borderColor: 'rgba(var(--color-error), 0.2)'
                              }}>
                              {formatTimeDisplay(endTime)}
                            </span>
                          }
                      </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                              <DatePicker
                                value={endDate}
                                onChange={(date) => setEndDate(date)}
                                placeholder="Sélectionner une date"
                                className="h-[42px]"
                              />
                            </div>

                            <div className="relative w-full sm:w-36">
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="hh:mm"
                                className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                                style={{
                                  backgroundColor: 'rgb(var(--color-surface))',
                                  color: 'rgb(var(--color-text-primary))',
                                  borderColor: 'rgb(var(--color-border))'
                                }}
                                required />
                            </div>
                        </div>
                    </div>
                  </div>

                  {calculateDuration() &&
                    <div className="mt-3.5 pt-2.5 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Durée totale</span>
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
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors text-sm"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
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
                      onClick={() => setColor(cat.color)}
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
                    </button>
                  ))}
                </div>

                {categories.length > 0 &&
                <div
                  className="p-2.5 rounded-xl border bg-opacity-30 transition-colors"
                  style={{
                    borderColor: 'rgb(var(--color-border))'
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
                      borderColor: 'rgb(var(--color-border))'
                    }}>
                    <h4 
                      className="text-xs font-semibold mb-2" 
                      style={{ color: 'rgb(var(--color-text-primary))' }}>
                      Aperçu
                    </h4>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-2.5 rounded-lg text-white text-center text-sm font-medium shadow-sm"
                      style={{ backgroundColor: color }}>
                      {title || 'Nom de l\'événement'}
                    </motion.div>
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
                    className="w-full px-4 py-3 rounded-lg font-semibold text-base transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white">

                     Convertir en événement
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
        </div>
        
        <ColorSettingsModal 
          isOpen={isColorSettingsOpen} 
          onClose={() => setIsColorSettingsOpen(false)} 
        />
      </div>);

};

export default TaskToEventModal;

