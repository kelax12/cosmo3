import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Task, useTasks } from "../context/TaskContext";

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
  onConvert,
}) => {
  const { categories } = useTasks();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("13:00");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3B82F6");

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.name || "");
      setNotes("");

      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000);

      setStartDate(now.toISOString().split("T")[0]);
      setStartTime(now.toTimeString().slice(0, 5));
      setEndDate(later.toISOString().split("T")[0]);
      setEndTime(later.toTimeString().slice(0, 5));

      // Set color based on task category if available
      if (task.category) {
        const categoryColor = categories.find(cat => cat.id === task.category)?.color;
        setColor(categoryColor || '#3B82F6');
      } else {
        setColor("#3B82F6");
      }
    }
  }, [isOpen, task, categories]);

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
      notes: notes.trim(),
    });

    onClose();
  };

  const colorOptions = [
    { value: '#3B82F6', name: 'Bleu', color: '#3B82F6' },
    { value: '#EF4444', name: 'Rouge', color: '#EF4444' },
    { value: '#10B981', name: 'Vert', color: '#10B981' },
    { value: '#8B5CF6', name: 'Violet', color: '#8B5CF6' },
    { value: '#F97316', name: 'Orange', color: '#F97316' },
    { value: '#F59E0B', name: 'Jaune', color: '#F59E0B' },
    { value: '#EC4899', name: 'Rose', color: '#EC4899' },
    { value: '#6366F1', name: 'Indigo', color: '#6366F1' },
  ];

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="modal-content rounded-2xl shadow-2xl w-full max-w-4xl h-auto transition-colors"
        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 transition-colors"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
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
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Colonne gauche */}
            <div className="col-span-7 space-y-4">
              {/* Titre */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                   Titre de l'événement *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
                  }}
                  placeholder="Nom de l'événement"
                  required
                />
              </div>

              {/* Planification */}
              <div
                className="p-4 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'rgb(var(--color-hover))',
                  borderColor: 'rgb(var(--color-border))'
                }}
              >
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  Planification
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Début */}
                  <div
                    className="p-3 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      borderColor: 'rgb(var(--color-border))'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        Début
                      </span>
                      {startTime && (
                        <span className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                          {formatTimeDisplay(startTime)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        style={{
                          backgroundColor: 'rgb(var(--color-surface))',
                          color: 'rgb(var(--color-text-primary))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                        required
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        style={{
                          backgroundColor: 'rgb(var(--color-surface))',
                          color: 'rgb(var(--color-text-primary))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Fin */}
                  <div
                    className="p-3 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      borderColor: 'rgb(var(--color-border))'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'rgb(var(--color-text-secondary))' }}
                      >
                        Fin
                      </span>
                      {endTime && (
                        <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                          {formatTimeDisplay(endTime)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        style={{
                          backgroundColor: 'rgb(var(--color-surface))',
                          color: 'rgb(var(--color-text-primary))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                        required
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        style={{
                          backgroundColor: 'rgb(var(--color-surface))',
                          color: 'rgb(var(--color-text-primary))',
                          borderColor: 'rgb(var(--color-border))'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {calculateDuration() && (
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock size={14} />
                      <span>Durée : {calculateDuration()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                   Description
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
                  }}
                  placeholder="Description de l'événement"
                />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="col-span-5 space-y-4">
              {/* Couleur */}
              <div>
                <label
                  className="block text-sm font-semibold mb-3"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                   Couleur de l'événement
                </label>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className="relative w-full h-12 rounded-lg border-2 transition-all hover:scale-105"
                      style={{
                        backgroundColor: option.color,
                        borderColor:
                          color === option.value
                            ? 'rgb(var(--color-text-primary))'
                            : 'rgb(var(--color-border))',
                        boxShadow: color === option.value ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
                      }}
                      title={option.name}
                    >
                      {color === option.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-4 h-4 rounded-full"
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

                <div
                  className="flex items-center gap-2 justify-center p-2 rounded-lg"
                  style={{ backgroundColor: 'rgb(var(--color-hover))' }}
                >
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color, borderColor: 'rgb(var(--color-border))' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {colorOptions.find(opt => opt.value === color)?.name}
                  </span>
                </div>
              </div>

              {/* Aperçu */}
              <div
                className="p-4 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'rgb(var(--color-hover))',
                  borderColor: 'rgb(var(--color-border))'
                }}
              >
                <h4
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                   Aperçu
                </h4>
                <div
                  className="p-3 rounded-lg text-white text-center font-medium shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {title || "Nom de l'événement"}
                </div>
                {calculateDuration() && (
                  <div
                    className="text-xs text-center mt-2"
                    style={{ color: 'rgb(var(--color-text-muted))' }}
                  >
                    {calculateDuration()}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600 hover:bg-green-700 text-white"
                >
                   Convertir en événement
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-lg border font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-text-secondary))'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskToEventModal;
