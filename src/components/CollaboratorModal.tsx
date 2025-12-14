import React, { useMemo, useState } from 'react';
import { X, Users, UserPlus, Trash2, Mail, Search } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

type CollaboratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getInitials = (value: string) => {
  if (!value) return '?';
  const parts = value.split(/\s|@/).filter(Boolean);
  const firstTwo = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return firstTwo.join('') || value.charAt(0).toUpperCase();
};

const CollaboratorModal: React.FC<CollaboratorModalProps> = ({ isOpen, onClose, taskId }) => {
  const { tasks, updateTask, friends } = useTasks();
  const task = tasks.find((t) => t.id === taskId);

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const assignedCollaborators = task?.collaborators || [];

  const availableFriends = useMemo(
    () =>
      (friends || []).filter(
        (friend) => !assignedCollaborators.includes(friend.id) &&
          (search.trim() === '' ||
            friend.name.toLowerCase().includes(search.toLowerCase()) ||
            friend.email.toLowerCase().includes(search.toLowerCase()))
      ),
    [friends, assignedCollaborators, search]
  );

  if (!isOpen) return null;
  if (!task) return null;

  const setCollaborators = (collaborators: string[]) => {
    updateTask(task.id, { collaborators, isCollaborative: collaborators.length > 0 });
  };

  const handleAdd = () => {
    const value = input.trim();
    if (!value) return;
    if (assignedCollaborators.includes(value)) {
      setInput('');
      return;
    }
    setCollaborators([...assignedCollaborators, value]);
    setInput('');
  };

  const handleToggleFriend = (friendId: string) => {
    if (assignedCollaborators.includes(friendId)) {
      setCollaborators(assignedCollaborators.filter((c) => c !== friendId));
    } else {
      setCollaborators([...assignedCollaborators, friendId]);
    }
  };

  const handleRemove = (collaboratorId: string) => {
    setCollaborators(assignedCollaborators.filter((c) => c !== collaboratorId));
  };

  const displayInfo = (id: string) => {
    const friend = friends?.find((f) => f.id === id);
    if (friend) {
      return { name: friend.name, email: friend.email, avatar: friend.avatar };
    }
    if (emailRegex.test(id)) {
      return { name: id.split('@')[0], email: id, avatar: undefined };
    }
    return { name: id, email: undefined, avatar: undefined };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Collaborateurs</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {task.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer la fenêtre des collaborateurs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Assigned collaborators */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Collaborateurs assignés</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {assignedCollaborators.length}
              </span>
            </div>
            {assignedCollaborators.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                Aucun collaborateur pour l’instant.
              </div>
            ) : (
              <div className="space-y-3">
                {assignedCollaborators.map((collaboratorId) => {
                  const info = displayInfo(collaboratorId);
                  return (
                    <div
                      key={collaboratorId}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold">
                          {info.avatar ? info.avatar : getInitials(info.name || collaboratorId)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{info.name}</p>
                          {info.email && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Mail size={12} />
                              <span>{info.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(collaboratorId)}
                        className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Retirer ce collaborateur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add collaborator by email/id */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ajouter un collaborateur</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Email ou identifiant"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Effacer l'entrée"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={!input.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={16} />
                Ajouter
              </button>
            </div>
            {input && !emailRegex.test(input.trim()) && input.includes('@') && (
              <p className="text-xs text-orange-500">Le format de l'adresse semble invalide.</p>
            )}
          </section>

          {/* Available friends */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Collaborateurs disponibles</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un contact"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {availableFriends.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aucun contact à ajouter.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold">
                        {friend.avatar ? friend.avatar : getInitials(friend.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{friend.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{friend.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFriend(friend.id)}
                      className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 transition-colors"
                      aria-label="Ajouter ce collaborateur"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorModal;
