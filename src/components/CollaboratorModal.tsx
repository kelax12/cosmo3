import React, { useMemo, useState } from 'react';
import { X, Users, UserPlus, Trash2, Mail, Search } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import CollaboratorItem from './CollaboratorItem';

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
  const { tasks, updateTask, friends, shareTask } = useTasks();
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
    // Check if it's a known friend
    const friend = friends.find(f => f.email === value || f.id === value);
    if (friend) {
      shareTask(task.id, friend.id, 'editor');
    } else {
      setCollaborators([...assignedCollaborators, value]);
    }
    setInput('');
  };

  const handleToggleFriend = (friendId: string) => {
    if (assignedCollaborators.includes(friendId)) {
      setCollaborators(assignedCollaborators.filter((c) => c !== friendId));
    } else {
      shareTask(task.id, friendId, 'editor');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0 animate-modal-backdrop">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transition-colors opacity-0 scale-95 animate-modal-content" style={{ backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'rgb(var(--color-text-muted))' }}>Collaborateurs</p>
              <h2 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                {task.name}
              </h2>
            </div>
          </div>
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
            aria-label="Fermer la fenêtre des collaborateurs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
            {/* Assigned collaborators */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>Collaborateurs assignés</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {assignedCollaborators.length}
                </span>
              </div>
              {assignedCollaborators.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed text-center transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>Aucun collaborateur pour l’instant.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {assignedCollaborators.map((collaboratorId) => {
                    const info = displayInfo(collaboratorId);
                    return (
                      <CollaboratorItem
                        key={collaboratorId}
                        id={collaboratorId}
                        name={info.name}
                        email={info.email}
                        avatar={info.avatar}
                        onAction={() => handleRemove(collaboratorId)}
                        variant="remove"
                      />
                    );
                  })}
                </div>
              )}
            </section>


          {/* Add collaborator by email/id */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>Ajouter un collaborateur</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Email ou identifiant"
                  className="w-full px-4 py-3 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{ 
                    backgroundColor: 'rgb(var(--color-surface))', 
                    borderColor: 'rgb(var(--color-border))',
                    color: 'rgb(var(--color-text-primary))'
                  }}
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
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>Collaborateurs disponibles</h3>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un contact"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ 
                      backgroundColor: 'rgb(var(--color-surface))', 
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {availableFriends.length === 0 ? (
                <div className="p-8 rounded-2xl text-center transition-colors" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
                  <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>Aucun contact trouvé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableFriends.map((friend) => (
                    <CollaboratorItem
                      key={friend.id}
                      id={friend.id}
                      name={friend.name}
                      email={friend.email}
                      avatar={friend.avatar}
                      onAction={() => handleToggleFriend(friend.id)}
                      variant="add"
                    />
                  ))}
                </div>
              )}
            </section>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t transition-colors" style={{ backgroundColor: 'rgb(var(--color-hover))', borderColor: 'rgb(var(--color-border))' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ color: 'rgb(var(--color-text-primary))', backgroundColor: 'rgb(var(--color-active))' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorModal;
