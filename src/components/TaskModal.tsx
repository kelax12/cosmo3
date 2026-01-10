import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle, CheckCircle, Bookmark, Trash2, Search, UserPlus, Mail, List, ChevronDown, Plus } from 'lucide-react';
import { Task, useTasks } from '../context/TaskContext';
import { Dialog, DialogContent } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import CollaboratorItem from './CollaboratorItem';
import { DatePicker } from './ui/date-picker';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskData: Partial<Task>) => void;
  isCreating?: boolean;
  showCollaborators?: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, isCreating = false, showCollaborators = false }) => {
    const { updateTask, deleteTask, colorSettings, categories, friends, isPremium, shareTask, lists, addTaskToList, removeTaskFromList } = useTasks();
  
    // Form state
    const [formData, setFormData] = useState({
      name: '',
      priority: 3,
      category: '',
      deadline: '',
      estimatedTime: 30,
      completed: false,
      bookmarked: false,
      isFromOKR: false
    });
  
    const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  const [okrFields, setOkrFields] = useState<Record<string, boolean>>({});

  // Collaborator state (integrated from AddTaskForm)
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showCollaboratorSection, setShowCollaboratorSection] = useState(showCollaborators);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);

  const getCategoryColor = (id: string) => {
    return categories.find((cat) => cat.id === id)?.color || '#9CA3AF';
  };

  // Initialize form data when task changes
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name,
        priority: task.priority,
        category: task.category,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        estimatedTime: task.estimatedTime,
        completed: task.completed,
        bookmarked: task.bookmarked,
        isFromOKR: (task as any).isFromOKR || false
      });
      
      const isFromOKR = (task as any).isFromOKR || false;
      if (isFromOKR) {
        setOkrFields({
          name: true,
          category: true,
          estimatedTime: true,
        });
      } else {
        setOkrFields({});
      }

        setCollaborators(task.collaborators || []);
        
        const taskLists = lists.filter(l => l.taskIds.includes(task.id)).map(l => l.id);
        setSelectedListIds(taskLists);

        setHasChanges(false);
      setErrors({});
      setShowCollaboratorSection(showCollaborators || (task.collaborators && task.collaborators.length > 0) || false);
    }
  }, [isOpen, task, showCollaborators]);

  // Track changes
  useEffect(() => {
    if (!task) return;

    const hasFormChanges =
      formData.name !== task.name ||
      formData.priority !== task.priority ||
      formData.category !== task.category ||
      formData.deadline !== (task.deadline ? task.deadline.split('T')[0] : '') ||
      formData.estimatedTime !== task.estimatedTime ||
      formData.completed !== task.completed ||
      formData.bookmarked !== task.bookmarked ||
      JSON.stringify(collaborators) !== JSON.stringify(task.collaborators || []);

    setHasChanges(hasFormChanges);
  }, [formData, collaborators, task]);

  // Validation rules
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la tâche est obligatoire';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    if (formData.estimatedTime === '' || formData.estimatedTime === null) {
        newErrors.estimatedTime = 'Le temps estimé est obligatoire';
    } else if (isNaN(Number(formData.estimatedTime))) {
        newErrors.estimatedTime = 'Veuillez entrer un nombre valide';
    } else if (Number(formData.estimatedTime) < 0) {
        newErrors.estimatedTime = 'Le temps estimé ne peut pas être négatif';
    }

    if (formData.priority === 0) {
      newErrors.priority = 'Veuillez choisir une priorité';
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez choisir une catégorie';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineDate < today) {
        newErrors.deadline = 'La date limite ne peut pas être dans le passé';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const nameValid = formData.name.length >= 1 && formData.name.length <= 100;
    const timeValid = formData.estimatedTime !== '' && formData.estimatedTime !== null && !isNaN(Number(formData.estimatedTime)) && Number(formData.estimatedTime) >= 0;
    const priorityValid = formData.priority !== 0;
    const categoryValid = !!formData.category;
    
    let deadlineValid = true;
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineValid = deadlineDate >= today;
    }

    return nameValid && timeValid && priorityValid && categoryValid && deadlineValid;
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (okrFields[field]) {
      setOkrFields(prev => ({ ...prev, [field]: false }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const taskData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : (isCreating ? new Date().toISOString() : task.deadline),
        isCollaborative: collaborators.length > 0,
        collaborators: collaborators,
      };

          if (isCreating && onSave) {
            onSave(taskData);
          } else {
            updateTask(task.id, taskData);
            
            // Sync lists
            const currentListIds = lists.filter(l => l.taskIds.includes(task.id)).map(l => l.id);
            
            // Add to new lists
            selectedListIds.forEach(listId => {
                if (!currentListIds.includes(listId)) {
                    addTaskToList(task.id, listId);
                }
            });
            
            // Remove from deselected lists
            currentListIds.forEach(listId => {
                if (!selectedListIds.includes(listId)) {
                    removeTaskFromList(task.id, listId);
                }
            });

            if (isPremium()) {
          collaborators.forEach(userId => {
            if (!task.collaborators?.includes(userId)) {
                shareTask(task.id, userId, 'editor');
            }
          });
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setErrors({ general: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        deleteTask(task.id);
        onClose();
      } catch (err) {
        console.error('Error deleting task:', err);
        setErrors({ general: 'Erreur lors de la suppression. Veuillez réessayer.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const availableFriends = friends || [];
  const filteredFriends = availableFriends.filter((friend) =>
    !collaborators.includes(friend.id) && (
      friend.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchUser.toLowerCase())
    )
  );

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

  const handleAddEmail = () => {
    const value = emailInput.trim();
    if (!value) return;
    if (collaborators.includes(value)) {
      setEmailInput('');
      return;
    }
    setCollaborators([...collaborators, value]);
    setEmailInput('');
  };

  const toggleCollaborator = (userId: string) => {
    setCollaborators((prev) =>
      prev.includes(userId) ?
      prev.filter((id) => id !== userId) :
      [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="p-0 border-0 sm:bg-transparent sm:shadow-none sm:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-[1600px] w-full min-h-[50vh] 3xl:min-h-[85vh] max-h-[90vh] sm:max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <div className="sm:rounded-2xl sm:shadow-2xl w-full transition-colors h-full min-h-inherit" style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <CheckCircle size={24} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                {isCreating ? 'Créer une nouvelle tâche' : 'Modifier la tâche'}
              </h2>
              {hasChanges &&
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>Non sauvegardé</span>
                </div>
              }
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'rgb(var(--color-text-muted))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgb(var(--color-accent))';
                e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(var(--color-text-muted))';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Fermer le formulaire"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="p-6">
            {/* Error display */}
            {errors.general &&
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span className="font-medium">{errors.general}</span>
                </div>
              </div>
            }

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column - Main Information */}
                <div className="space-y-5">

                  {/* Task Name */}
                  <div>
                    <label htmlFor="task-name" className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Nom de la tâche *
                    </label>
                    <input
                      id="task-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 h-12 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 transition-all text-base ${
                        errors.name ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'
                      } ${okrFields.name ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
                      style={{
                        backgroundColor: okrFields.name ? undefined : 'rgb(var(--color-surface))',
                        color: 'rgb(var(--color-text-primary))',
                        borderColor: errors.name ? 'rgb(var(--error))' : (okrFields.name ? undefined : undefined)
                      }}
                      placeholder="Entrez le nom de la tâche"
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      aria-invalid={!!errors.name}
                    />

                    {errors.name &&
                      <div id="name-error" className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm" role="alert">
                        <AlertCircle size={14} aria-hidden="true" />
                        {errors.name}
                      </div>
                    }
                  </div>

                  {/* Priority and Category */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="task-priority" className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                          Priorité
                        </label>
                        <select
                          id="task-priority"
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                          className="w-full px-4 h-12 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 transition-all text-base border-slate-200 dark:border-slate-700"
                          style={{
                            backgroundColor: 'rgb(var(--color-surface))',
                            color: formData.priority === 0 ? 'rgb(var(--color-text-muted))' : 'rgb(var(--color-text-primary))',
                          }}
                          aria-label="Sélectionner la priorité de la tâche"
                        >
                        <option value="0" disabled hidden>Choisir une priorité</option>
                        <option value="1" style={{ color: 'rgb(var(--color-text-primary))' }}>1 (Très haute)</option>
                        <option value="2" style={{ color: 'rgb(var(--color-text-primary))' }}>2 (Haute)</option>
                        <option value="3" style={{ color: 'rgb(var(--color-text-primary))' }}>3 (Moyenne)</option>
                        <option value="4" style={{ color: 'rgb(var(--color-text-primary))' }}>4 (Basse)</option>
                        <option value="5" style={{ color: 'rgb(var(--color-text-primary))' }}>5 (Très basse)</option>
                      </select>
                      {errors.priority &&
                        <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm" role="alert">
                          <AlertCircle size={14} aria-hidden="true" />
                          {errors.priority}
                        </div>
                      }
                    </div>

                            <div>
                              <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                                Catégorie
                              </label>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className={`w-full flex items-center justify-between px-4 h-12 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 data-[state=open]:border-blue-600 data-[state=open]:border-2 transition-all text-base ${
                                            errors.category ? 'border-red-500' : (okrFields.category ? 'border-blue-500 dark:border-blue-400' : 'border-slate-200 dark:border-slate-700')
                                          } ${okrFields.category ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                                          style={{
                                          backgroundColor: okrFields.category ? undefined : 'rgb(var(--color-surface))',
                                          color: formData.category ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-text-muted))',
                                          borderColor: errors.category ? 'rgb(var(--color-error))' : (okrFields.category ? undefined : undefined)
                                        }}
                                      >
                                      <span>{categories.find(c => c.id === formData.category)?.name || (formData.category === 'okr' ? 'OKR' : 'Choisir...')}</span>
                                      <ChevronDown size={18} className="text-blue-500" />
                                    </button>
                                  </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="start" 
                                  className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#f8fafc] dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 p-1 shadow-xl"
                                >
                                  {formData.category === 'okr' && !categories.find(c => c.id === 'okr') && (
                                    <DropdownMenuItem asChild>
                                      <button
                                        type="button"
                                        onClick={() => handleInputChange('category', 'okr')}
                                        className="w-full text-left px-4 py-3 text-base rounded-md transition-colors flex items-center gap-2 bg-blue-600 text-white shadow-sm"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        OKR
                                      </button>
                                    </DropdownMenuItem>
                                  )}
                                  {categories.map((cat) => (
                                    <DropdownMenuItem key={cat.id} asChild>
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleInputChange('category', cat.id)}
                                        className={`w-full text-left px-4 py-3 text-base rounded-md transition-colors flex items-center gap-2 ${
                                          formData.category === cat.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                                        }`}
                                      >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        {cat.name}
                                      </button>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                        {errors.category &&
                          <div className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm" role="alert">
                            <AlertCircle size={14} aria-hidden="true" />
                            {errors.category}
                          </div>
                        }
                      </div>
                  </div>

                  {/* Deadline and Estimated Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="task-deadline" className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                          Échéance
                        </label>
                        <DatePicker
                          value={formData.deadline}
                          onChange={(date) => handleInputChange('deadline', date)}
                          placeholder="Sélectionner une date"
                          className={`h-12 ${errors.deadline ? 'border-red-300 dark:border-red-600' : ''}`}
                        />

                        {errors.deadline &&
                          <div id="deadline-error" className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm" role="alert">
                            <AlertCircle size={14} aria-hidden="true" />
                            {errors.deadline}
                          </div>
                        }
                      </div>

                      <div>
                        <label htmlFor="task-time" className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                          Temps estimé (min)
                        </label>
                          <input
                            id="task-time"
                            type="number"
                            value={formData.estimatedTime === 0 ? '' : formData.estimatedTime}
                            onChange={(e) => handleInputChange('estimatedTime', e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Estimation en minute"
                            className={`w-full px-4 h-12 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 transition-all text-base ${
                              errors.estimatedTime ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'
                            } ${okrFields.estimatedTime ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}
                            style={{
                              backgroundColor: okrFields.estimatedTime ? undefined : 'rgb(var(--color-surface))',
                              color: 'rgb(var(--color-text-primary))',
                              borderColor: errors.estimatedTime ? 'rgb(var(--color-error))' : (okrFields.estimatedTime ? undefined : undefined)
                            }}
                            aria-describedby={errors.estimatedTime ? 'time-error' : undefined}
                            aria-invalid={!!errors.estimatedTime}
                          />

                      {errors.estimatedTime &&
                        <div id="time-error" className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm" role="alert">
                          <AlertCircle size={14} aria-hidden="true" />
                          {errors.estimatedTime}
                        </div>
                      }
                    </div>
                  </div>

                  {/* Status toggles */}
                  <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center justify-between p-4 rounded-lg border transition-colors min-w-[140px]" style={{
                        backgroundColor: 'rgb(var(--color-hover))',
                        borderColor: 'rgb(var(--color-border))'
                      }}>
                        <div className="flex items-center gap-3">
                          <Bookmark size={20} className={formData.bookmarked ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'} aria-hidden="true" />
                          <span className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>Favori</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.bookmarked}
                            onChange={(e) => handleInputChange('bookmarked', e.target.checked)}
                            aria-label="Marquer comme favori"
                          />
                          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                      </div>

                              <div className="flex items-center gap-3 p-4 rounded-lg border transition-colors" style={{
                                backgroundColor: 'rgb(var(--color-hover))',
                                borderColor: 'rgb(var(--color-border))'
                              }}>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <List size={18} className="text-blue-500" aria-hidden="true" />
                                    <span className="font-semibold text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>Listes</span>
                                  </div>
                                  
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="p-1 rounded-lg transition-all hover:bg-blue-500/10"
                                          style={{ color: "rgb(var(--color-text-primary))" }}
                                        >
                                          <Plus size={18} className="text-blue-500" />
                                        </button>
                                      </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-[#1e293b] border-slate-700 text-white">
                                      {lists.length === 0 && (
                                        <div className="p-2 text-sm text-center text-slate-400">
                                          Aucune liste disponible
                                        </div>
                                      )}
                                      {lists.map(list => (
                                        <DropdownMenuCheckboxItem
                                          key={list.id}
                                          checked={selectedListIds.includes(list.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedListIds([...selectedListIds, list.id]);
                                            } else {
                                              setSelectedListIds(selectedListIds.filter(id => id !== list.id));
                                            }
                                            setHasChanges(true);
                                          }}
                                          className="focus:bg-slate-700 focus:text-white"
                                        >
                                          {list.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                              </div>

                              <div className="flex flex-wrap gap-2 items-center">
                                {selectedListIds.map(id => {
                                  const list = lists.find(l => l.id === id);
                                  if (!list) return null;
                                  return (
                                    <div 
                                      key={id} 
                                      className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20"
                                    >
                                      {list.name}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedListIds(selectedListIds.filter(lid => lid !== id));
                                          setHasChanges(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-400 transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                  </div>
                </div>

                {/* Right Column - Collaborators and Preview */}
                <div className="space-y-6">

                  {/* Collaborators Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                        Collaborateurs
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCollaboratorSection(!showCollaboratorSection)}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Users size={16} />
                        <span>{showCollaboratorSection ? 'Masquer' : 'Gérer'}</span>
                      </button>
                    </div>

                    {showCollaboratorSection && (
                      <div
                        className="rounded-lg p-4 border transition-colors"
                        style={{
                          backgroundColor: 'rgb(var(--color-hover))',
                          borderColor: 'rgb(var(--color-border))',
                        }}
                      >
                        {!isPremium() ? (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <Users size={24} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-sm mb-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                              Fonctionnalité Premium requise
                            </p>
                            <button type="button" className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full transition-colors">
                              Débloquer Premium
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Add collaborator by email/id */}
                            <div className="flex gap-2 mb-4">
                              <div className="relative flex-1">
                                <Mail
                                  size={16}
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                                />
                                <input
                                  type="text"
                                  value={emailInput}
                                  onChange={(e) => setEmailInput(e.target.value)}
                                  placeholder="Email ou identifiant"
                                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 text-sm transition-colors border-slate-200 dark:border-slate-700"
                                  style={{
                                    backgroundColor: 'rgb(var(--color-surface))',
                                    color: 'rgb(var(--color-text-primary))',
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleAddEmail}
                                disabled={!emailInput.trim()}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                <UserPlus size={18} />
                              </button>
                            </div>

                            {/* Search users */}
                            <div className="relative mb-4">
                              <Search
                                size={16}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                              />
                              <input
                                type="text"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Rechercher parmi vos amis..."
                                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none hover:border-blue-500 focus:border-blue-600 focus:border-2 text-sm transition-colors border-slate-200 dark:border-slate-700"
                                  style={{
                                    backgroundColor: 'rgb(var(--color-surface))',
                                    color: 'rgb(var(--color-text-primary))',
                                  }}
                              />
                            </div>

                            {/* Friends list */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {filteredFriends.map((friend) => (
                                <CollaboratorItem
                                  key={friend.id}
                                  id={friend.id}
                                  name={friend.name}
                                  email={friend.email}
                                  avatar={friend.avatar}
                                  isSelected={collaborators.includes(friend.id)}
                                  onAction={() => toggleCollaborator(friend.id)}
                                  variant="toggle"
                                />
                              ))}
                              {filteredFriends.length === 0 && searchUser && (
                                <p className="text-center py-4 text-sm text-slate-500">Aucun contact trouvé</p>
                              )}
                            </div>

                            {/* Selected collaborators */}
                            {collaborators.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Sélectionnés ({collaborators.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {collaborators.map((userId) => {
                                    const info = displayInfo(userId);
                                    return (
                                      <CollaboratorItem
                                        key={userId}
                                        id={userId}
                                        name={info.name}
                                        email={info.email}
                                        avatar={info.avatar}
                                        onAction={() => toggleCollaborator(userId)}
                                        variant="remove"
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Task Preview */}
                  <div className="p-4 rounded-lg border transition-colors" style={{
                    backgroundColor: 'rgb(var(--color-hover))',
                    borderColor: 'rgb(var(--color-border))'
                  }}>
                    <h4 className="text-sm font-semibold mb-3 !whitespace-pre-line" style={{ color: 'rgb(var(--color-text-secondary))' }}>Aperçu de la tâche</h4>
                    <div className="p-4 rounded-lg border transition-colors" style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      borderColor: 'rgb(var(--color-border))'
                    }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getCategoryColor(formData.category) }}
                        />
                        <span className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                          {formData.name || 'Nom de la tâche'}
                        </span>
                        {formData.bookmarked && <Bookmark size={16} className="text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                        <span>Priorité {formData.priority}</span>
                        <span>{formData.estimatedTime} min</span>
                        {formData.completed && <span className="text-blue-600 dark:text-blue-400">✓ Complétée</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t mt-6" style={{ borderColor: 'rgb(var(--color-border))' }}>
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                )}
                {isCreating && <div></div>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'rgb(var(--color-hover))',
                      color: 'rgb(var(--color-text-secondary))'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = 'rgb(var(--color-active))';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = 'rgb(var(--color-hover))';
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid() || (!hasChanges && !isCreating)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" role="status"></div>
                        {isCreating ? 'Création...' : 'Sauvegarde...'}
                      </>
                    ) : (
                      <>
                        {isCreating ? 'Créer' : 'Sauvegarder'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
