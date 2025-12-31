import React, { useState, useEffect } from "react";
import { X, Clock, Plus } from "lucide-react";
import { CalendarEvent, useTasks } from "../context/TaskContext";
import { motion, AnimatePresence } from "framer-motion";
import ColorSettingsModal from "./ColorSettingsModal";
import { DatePicker } from "./ui/date-picker";

type EditEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onUpdateEvent: (
    eventId: string,
    eventData: {
      title: string;
      start: string;
      end: string;
      color: string;
      notes?: string;
    }
  ) => void;
  onDeleteEvent: (eventId: string) => void;
};

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const { categories, favoriteColors } = useTasks();
  
  // State initialization
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  // Sync state with event prop
  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || "");
      setNotes(event.notes || "");
      setColor(event.color || "#3B82F6");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start.toISOString().split("T")[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split("T")[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  }, [isOpen, event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

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

    onUpdateEvent(event.id, {
      title: title.trim(),
      start,
      end,
      color,
      notes: notes.trim(),
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (event) {
      onDeleteEvent(event.id);
      setShowDeleteConfirm(false);
    }
  };

  const formatTimeDisplay = (timeValue: string) => {
    if (!timeValue) return "";
    const [hours, minutes] = timeValue.split(":");
    return `${hours}h${minutes}`;
  };

  const calculateDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffMs <= 0) return "⚠️ Fin avant début";
    if (diffHours === 0) return `${diffMinutes} min`;
    if (diffMinutes === 0) return `${diffHours}h`;
    return `${diffHours}h${diffMinutes}min`;
  };

  if (!isOpen || !event) return null;

  return (
    <>
      <div
        className="modal-content rounded-2xl shadow-2xl w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-[1600px] min-h-[50vh] 3xl:min-h-[85vh] h-auto transition-colors overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--color-surface))' }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 transition-colors"
          style={{ borderColor: 'rgb(var(--color-border))' }}>

          <h2
            className="text-xl font-bold"
            style={{ color: 'rgb(var(--color-text-primary))' }}>
            Modifier l'événement
          </h2>

          <button
            onClick={onClose}
            type="button"
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
                className="p-2 rounded-xl border transition-colors"
                style={{
                  borderColor: 'rgb(var(--color-border))'
                }}>

                <div className="grid grid-cols-1 gap-1">
                  {/* Début */}
                  <div 
                    className="group p-2 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
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
                            className="h-[38px]"
                          />
                      </div>

                      <div className="relative w-full sm:w-32">
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="hh:mm"
                          className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                    className="group p-2 rounded-lg"
                    style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
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
                            className="h-[38px]"
                          />
                        </div>

                        <div className="relative w-full sm:w-32">
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="hh:mm"
                            className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
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
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors text-sm"
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
                    className="w-4 h-4 text-blue-500 cursor-pointer hover:scale-125 transition-transform" 
                    onClick={() => setIsColorSettingsOpen(true)}
                  />
                </label>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {favoriteColors.map((favColor, index) => (
                    <button
                      key={`${favColor}-${index}`}
                      type="button"
                      onClick={() => setColor(favColor)}
                      className="relative w-full h-10 rounded-lg border-2 transition-all hover:scale-105"
                      style={{
                        backgroundColor: favColor,
                        borderColor:
                        color === favColor ?
                        'rgb(var(--color-text-primary))' :
                        'rgb(var(--color-border))',
                        boxShadow: color === favColor ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
                      }}>
                        {color === favColor && (
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

                {categories.length > 0 && (
                  <div
                    className="p-2.5 rounded-xl border bg-opacity-30 transition-colors"
                    style={{ borderColor: 'rgb(var(--color-border))' }}
                  >
                    <h4
                      className="text-[12px] font-bold uppercase tracking-widest mb-2"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                    >
                      Légende des catégories
                    </h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{ backgroundColor: cat.color }} />
                          <span
                            className="text-[13px] font-medium truncate"
                            style={{ color: 'rgb(var(--color-text-primary))' }}
                          >
                            {cat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Aperçu */}
              <div 
                className="p-3 rounded-xl border transition-colors"
                style={{ borderColor: 'rgb(var(--color-border))' }}>
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
                    Enregistrer les modifications
                  </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgb(var(--color-border))',
                    color: '#DC2626'
                  }}>
                  Supprimer l'événement
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="rounded-xl shadow-2xl w-full max-w-md p-6 transition-colors"
              style={{ backgroundColor: "rgb(var(--color-surface))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: "rgb(var(--color-text-primary))" }}
              >
                Confirmer la suppression
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: "rgb(var(--color-text-secondary))" }}
              >
                Êtes-vous sûr de vouloir supprimer cet événement ? Cette action
                est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: "rgb(var(--color-border))",
                    color: "rgb(var(--color-text-primary))",
                  }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditEventModal;
