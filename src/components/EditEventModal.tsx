import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { CalendarEvent } from "../context/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

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
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  if (!isOpen || !event) return null;

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
    onDeleteEvent(event.id);
    setShowDeleteConfirm(false);
  };

  const colorOptions = [
    { value: "#3B82F6", name: "Bleu", color: "#3B82F6" },
    { value: "#EF4444", name: "Rouge", color: "#EF4444" },
    { value: "#10B981", name: "Vert", color: "#10B981" },
    { value: "#8B5CF6", name: "Violet", color: "#8B5CF6" },
    { value: "#F97316", name: "Orange", color: "#F97316" },
    { value: "#F59E0B", name: "Jaune", color: "#F59E0B" },
    { value: "#EC4899", name: "Rose", color: "#EC4899" },
    { value: "#6366F1", name: "Indigo", color: "#6366F1" },
  ];

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

  return (
    <div
      className="modal-content rounded-xl shadow-2xl w-full max-w-4xl h-auto"
      style={{
        backgroundColor: "rgb(var(--color-surface))",
        border: "1px solid rgb(var(--color-border))",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-6 py-4 border-b"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <h2
          className="text-xl font-bold"
          style={{ color: "rgb(var(--color-text-primary))" }}
        >
          Modifier l'événement
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "rgb(var(--color-text-muted))" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgb(var(--color-text-primary))";
            e.currentTarget.style.backgroundColor = "rgb(var(--color-hover))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgb(var(--color-text-muted))";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
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
                style={{ color: "rgb(var(--color-text-secondary))" }}
              >
                 Titre de l'événement *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: "rgb(var(--color-surface))",
                  color: "rgb(var(--color-text-primary))",
                  borderColor: "rgb(var(--color-border))",
                }}
                placeholder="Nom de l'événement"
                required
              />
            </div>

            {/* Planification */}
            <div
              className="p-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: "rgb(var(--color-hover))",
                borderColor: "rgb(var(--color-border))",
              }}
            >
              <h3
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: "rgb(var(--color-text-secondary))" }}
              >
                <Clock size={16} />
                Planification
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Début */}
                <div
                  className="p-3 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: "rgb(var(--color-surface))",
                    borderColor: "rgb(var(--color-border))",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--color-text-secondary))" }}
                    >
                      Début
                    </span>
                    {startTime && (
                      <span
                        className="text-sm font-bold px-2 py-1 rounded"
                        style={{
                          color: "#16A34A",
                          backgroundColor: "rgba(16,185,129,0.15)",
                        }}
                      >
                        {formatTimeDisplay(startTime)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-primary))",
                        borderColor: "rgb(var(--color-border))",
                      }}
                      required
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-primary))",
                        borderColor: "rgb(var(--color-border))",
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Fin */}
                <div
                  className="p-3 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: "rgb(var(--color-surface))",
                    borderColor: "rgb(var(--color-border))",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--color-text-secondary))" }}
                    >
                      Fin
                    </span>
                    {endTime && (
                      <span
                        className="text-sm font-bold px-2 py-1 rounded"
                        style={{
                          color: "#DC2626",
                          backgroundColor: "rgba(239,68,68,0.15)",
                        }}
                      >
                        {formatTimeDisplay(endTime)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-primary))",
                        borderColor: "rgb(var(--color-border))",
                      }}
                      required
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-2 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-primary))",
                        borderColor: "rgb(var(--color-border))",
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {calculateDuration() && (
                <div className="mt-3 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(59,130,246,0.15)",
                      color: "#2563EB",
                    }}
                  >
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
                style={{ color: "rgb(var(--color-text-secondary))" }}
              >
                 Description
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                style={{
                  backgroundColor: "rgb(var(--color-surface))",
                  color: "rgb(var(--color-text-primary))",
                  borderColor: "rgb(var(--color-border))",
                }}
                placeholder="Description de l'événement (optionnel)"
              />
            </div>
          </div>

          {/* Colonne droite */}
          <div className="col-span-5 space-y-4">
            {/* Couleur */}
            <div>
              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "rgb(var(--color-text-secondary))" }}
              >
                 Couleur de l'événement
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className="relative w-full h-12 rounded-lg border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: option.color,
                      borderColor:
                        color === option.value
                          ? "rgb(var(--color-text-primary))"
                          : "rgb(var(--color-border))",
                      boxShadow:
                        color === option.value
                          ? "0 4px 10px rgba(0,0,0,0.15)"
                          : "none",
                    }}
                    title={option.name}
                  >
                    {color === option.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: "rgb(var(--color-surface))",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div
                className="flex items-center gap-2 justify-center p-2 rounded-lg"
                style={{ backgroundColor: "rgb(var(--color-hover))" }}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: color,
                    borderColor: "rgb(var(--color-border))",
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "rgb(var(--color-text-secondary))" }}
                >
                  {colorOptions.find((opt) => opt.value === color)?.name}
                </span>
              </div>
            </div>

            {/* Aperçu */}
            <div
              className="p-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: "rgb(var(--color-hover))",
                borderColor: "rgb(var(--color-border))",
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: "rgb(var(--color-text-secondary))" }}
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
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  {calculateDuration()}
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                className="w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  backgroundColor: "#16A34A",
                  color: "#fff",
                }}
              >
                 Valider
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-6 py-2 rounded-lg font-medium transition-colors border"
                style={{
                  backgroundColor: "rgb(var(--color-surface))",
                  color: "#DC2626",
                  borderColor: "rgb(var(--color-border))",
                }}
              >
                 Supprimer l'événement
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
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
    </div>
  );
};

export default EditEventModal;
