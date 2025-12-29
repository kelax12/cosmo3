import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Edit2, Trash2, CheckCircle, BarChart3, Settings, X, Clock } from 'lucide-react';
import CategoryManager, { getColorHex } from '../components/CategoryManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import AddTaskForm from '../components/AddTaskForm';
import AddEventModal from '../components/AddEventModal';

type KeyResult = {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  completed: boolean;
  estimatedTime: number;
  history?: {date: string;increment: number;}[];
};

type Objective = {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  keyResults: KeyResult[];
  completed: boolean;
  estimatedTime: number;
};

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

const OKRPage: React.FC = () => {
  const location = useLocation();
  const { okrs: objectives, updateKeyResult: contextUpdateKR, addOKR, deleteOKR, addEvent, updateOKR } = useTasks();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedKeyResultForModal, setSelectedKeyResultForModal] = useState<{kr: KeyResult;obj: Objective;} | null>(null);
  const [editingObjective, setEditingObjective] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([
  { id: 'personal', name: 'Personnel', color: 'blue', icon: '👤' },
  { id: 'professional', name: 'Professionnel', color: 'green', icon: '💼' },
  { id: 'health', name: 'Santé', color: 'red', icon: '❤️' },
  { id: 'learning', name: 'Apprentissage', color: 'purple', icon: '📚' }]
  );

  const [showAddObjective, setShowAddObjective] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingObjective, setDeletingObjective] = useState<string | null>(null);

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    category: 'personal',
    startDate: '',
    endDate: '',
    estimatedTime: 60
  });

  const [keyResults, setKeyResults] = useState([
  { title: '', targetValue: '', currentValue: '', estimatedTime: '' },
  { title: '', targetValue: '', currentValue: '', estimatedTime: '' },
  { title: '', targetValue: '', currentValue: '', estimatedTime: '' }]
  );

  const getProgress = (keyResults: KeyResult[]) => {
    if (keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => {
      return sum + Math.min(kr.currentValue / kr.targetValue * 100, 100);
    }, 0);
    return Math.round(totalProgress / keyResults.length);
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    if (diffTime < 0) return { text: "La date d'échéance doit être après la date de début", isError: true };

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Moins d'un jour", isError: false };
    if (diffDays < 7) return { text: `${diffDays} jour${diffDays > 1 ? 's' : ''}`, isError: false };

    if (diffDays < 32) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      let text = `${weeks} semaine${weeks > 1 ? 's' : ''}`;
      if (remainingDays > 0) text += ` et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
      return { text, isError: false };
    }

    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    let text = `${months} mois`;
    if (remainingDays > 0) text += ` et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}`;
    return { text, isError: false };
  };

  const updateKeyResult = (objectiveId: string, keyResultId: string, newValue: number) => {
    const obj = objectives.find((o) => o.id === objectiveId);
    const kr = obj?.keyResults.find((k) => k.id === keyResultId);
    if (kr) {
      contextUpdateKR(objectiveId, keyResultId, {
        currentValue: newValue,
        completed: newValue >= kr.targetValue
      });
    }
  };

  const addKeyResult = () => {
    if (keyResults.length < 10) {
      setKeyResults([...keyResults, { title: '', targetValue: '', currentValue: '', estimatedTime: '' }]);
    }
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  const updateKeyResultField = (index: number, field: string, value: string) => {
    const updated = keyResults.map((kr, i) =>
    i === index ? { ...kr, [field]: value } : kr
    );
    setKeyResults(updated);
  };

  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) =>
    cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    const isUsed = objectives.some((obj) => obj.category === categoryId);
    if (isUsed) {
      alert('Cette catégorie est utilisée par des objectifs existants et ne peut pas être supprimée.');
      return;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const deleteObjective = (objectiveId: string) => {
    deleteOKR(objectiveId);
    setDeletingObjective(null);
  };

  const handleEditObjective = (id: string) => {
    const objective = objectives.find(obj => obj.id === id);
    if (objective) {
      setEditingObjective(id);
      setNewObjective({
        title: objective.title,
        description: objective.description,
        category: objective.category,
        startDate: objective.startDate,
        endDate: objective.endDate,
        estimatedTime: objective.estimatedTime
      });
      setKeyResults(objective.keyResults.map(kr => ({
        title: kr.title,
        targetValue: kr.targetValue.toString(),
        currentValue: kr.currentValue.toString(),
        estimatedTime: kr.estimatedTime.toString()
      })));
      setShowAddObjective(true);
    }
  };

  const handleSubmitObjective = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newObjective.title.trim()) {
      alert('Veuillez saisir un titre pour l\'objectif');
      return;
    }

    const validKeyResults = keyResults.filter((kr) =>
    kr.title.trim() && kr.targetValue && Number(kr.targetValue) > 0
    );

    if (validKeyResults.length === 0) {
      alert('Veuillez définir au moins un résultat clé valide');
      return;
    }

    const objData: any = {
      title: newObjective.title,
      description: newObjective.description,
      category: newObjective.category,
      startDate: newObjective.startDate,
      endDate: newObjective.endDate,
      completed: false,
      estimatedTime: newObjective.estimatedTime,
      keyResults: validKeyResults.map((kr, index) => ({
        id: editingObjective ? (objectives.find(o => o.id === editingObjective)?.keyResults[index]?.id || `${Date.now()}-${index}`) : `${Date.now()}-${index}`,
        title: kr.title,
        currentValue: Number(kr.currentValue) || 0,
        targetValue: Number(kr.targetValue),
        unit: '',
        completed: Number(kr.currentValue) >= Number(kr.targetValue),
        estimatedTime: Number(kr.estimatedTime) || 30,
        history: editingObjective ? (objectives.find(o => o.id === editingObjective)?.keyResults[index]?.history || []) : []
      }))
    };

    if (editingObjective) {
      updateOKR(editingObjective, objData);
    } else {
      addOKR({ ...objData, id: Date.now().toString() });
    }

    resetForm();
    setShowAddObjective(false);
  };

  const resetForm = () => {
    setNewObjective({
      title: '',
      description: '',
      category: 'personal',
      startDate: '',
      endDate: '',
      estimatedTime: 60
    });
    setKeyResults([
      { title: '', targetValue: '', currentValue: '', estimatedTime: '' },
      { title: '', targetValue: '', currentValue: '', estimatedTime: '' },
      { title: '', targetValue: '', currentValue: '', estimatedTime: '' }
    ]);
    setEditingObjective(null);
  };

  const filteredObjectives = selectedCategory === 'all' ?
  objectives :
  selectedCategory === 'finished' ?
  objectives.filter((obj) => obj.completed) :
  objectives.filter((obj) => obj.category === selectedCategory);

  const stats = {
    total: objectives.length,
    completed: objectives.filter((obj) => obj.completed).length,
    inProgress: objectives.filter((obj) => !obj.completed).length,
    avgProgress: objectives.length > 0 ?
    Math.round(objectives.reduce((sum, obj) => sum + getProgress(obj.keyResults), 0) / objectives.length) :
    0
  };

  const getCategoryById = (id: string) => categories.find((cat) => cat.id === id);

  useEffect(() => {
    const state = location.state as {selectedOKRId?: string;};
    if (state?.selectedOKRId) {
      handleEditObjective(state.selectedOKRId);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-8 max-w-7xl mx-auto"
      style={{ backgroundColor: 'rgb(var(--color-background))' }}>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>
          OKR - Objectifs & Résultats Clés
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Définissez et suivez vos objectifs avec des résultats mesurables
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {[
        { icon: TrendingUp, color: 'orange', label: 'En Cours', value: stats.inProgress },
        { icon: BarChart3, color: 'purple', label: 'Progression Moy.', value: `${stats.avgProgress}%` }].
        map((stat) =>
        <div
          key={stat.label}
          className="p-4 sm:p-6 rounded-lg shadow-sm border transition-all"
          style={{
            backgroundColor: 'rgb(var(--color-surface))',
            borderColor: 'rgb(var(--color-border))'
          }}>

            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `rgba(var(--color-${stat.color}-rgb), 0.1)` }}>
                <stat.icon size={24} style={{ color: `rgb(var(--color-${stat.color}))` }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate" title={stat.label} style={{ color: 'rgb(var(--color-text-secondary))' }}>{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'rgb(var(--color-text-primary))' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 mb-8">
        <button
          onClick={() => setShowCategoryManager(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-all shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          style={{
            borderColor: 'rgb(var(--color-border))',
            color: 'rgb(var(--color-text-secondary))',
            backgroundColor: 'rgb(var(--color-surface))'
          }}>

          <Settings size={20} />
          <span className="whitespace-nowrap">Gérer les catégories</span>
        </button>
          <button
            onClick={() => setShowAddObjective(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">

          <Plus size={20} />
          <span className="whitespace-nowrap">Nouvel Objectif</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'rgb(var(--color-text-secondary))' }}>Filtrer par catégorie :</span>
        <div className="flex gap-2 flex-wrap">
            <button
            onClick={() => setSelectedCategory('all')}
            className="px-3 py-1 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedCategory === 'all' ? 'rgb(var(--color-accent) / 0.1)' : 'rgb(var(--color-hover))',
              color: selectedCategory === 'all' ? 'rgb(var(--color-accent))' : 'rgb(var(--color-text-secondary))'
            }}>

              Tous
            </button>
            <button
            onClick={() => setSelectedCategory('finished')}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedCategory === 'finished' ? 'rgb(var(--color-accent) / 0.1)' : 'rgb(var(--color-hover))',
              color: selectedCategory === 'finished' ? 'rgb(var(--color-accent))' : 'rgb(var(--color-text-secondary))'
            }}>

              <CheckCircle size={14} />
              <span>Finis</span>
            </button>
          {categories.map((category) =>
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedCategory === category.id ? getColorHex(category.color) : 'rgb(var(--color-hover))',
              color: selectedCategory === category.id ? '#ffffff' : 'rgb(var(--color-text-secondary))',
              boxShadow: selectedCategory === category.id ? `0 4px 12px ${getColorHex(category.color)}40` : 'none'
            }}>

              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredObjectives.map((objective, index) => {
            const progress = getProgress(objective.keyResults);
            const category = getCategoryById(objective.category);

            return (
              <motion.div
                key={objective.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg shadow-sm border p-6 transition-all"
                style={{
                  backgroundColor: 'rgb(var(--color-surface))',
                  borderColor: 'rgb(var(--color-border))'
                }}>

                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ backgroundColor: 'rgb(var(--color-accent) / 0.1)', color: 'rgb(var(--color-accent))' }}>
                          {category?.icon && <span>{category.icon}</span>}
                          <span>{category?.name}</span>
                        </span>
                        <span className="text-xs sm:text-sm whitespace-nowrap" style={{ color: 'rgb(var(--color-text-muted))' }}>
                          {new Date(objective.startDate).toLocaleDateString('fr-FR')} - {new Date(objective.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap" style={{ color: 'rgb(var(--color-text-muted))' }}>
                          <Clock size={14} />
                          {objective.estimatedTime} min
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1 truncate" style={{ color: 'rgb(var(--color-text-primary))' }}>{objective.title}</h3>
                      <p className="text-xs sm:text-sm line-clamp-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>{objective.description}</p>
                    </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button
                          onClick={() => handleEditObjective(objective.id)}
                          className="p-1.5 transition-colors hover:bg-hover rounded-md"
                          style={{ color: 'rgb(var(--color-text-muted))' }}>

                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingObjective(objective.id)}
                        className="p-1.5 transition-colors hover:bg-hover rounded-md text-red-500/70 hover:text-red-500"
                        style={{ color: 'rgb(var(--color-text-muted))' }}>

                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" stroke="rgb(var(--color-border-muted))" strokeWidth="8" fill="none" />
                        <circle cx="40" cy="40" r="32" stroke="rgb(var(--color-accent))" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={2 * Math.PI * 32 * (1 - progress / 100)} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg sm:text-xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{progress}%</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>Progression globale</span>
                        <span className="text-xs sm:text-sm font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{progress}%</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgb(var(--color-border-muted))' }}>
                        <div className="h-2 rounded-full transition-all duration-500" style={{ backgroundColor: 'rgb(var(--color-accent))', width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-medium mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Résultats Clés</h4>
                    {objective.keyResults.map((keyResult) => {
                      const krProgress = Math.min(keyResult.currentValue / keyResult.targetValue * 100, 100);

                      return (
                        <div key={keyResult.id} className="rounded-lg p-3 transition-all" style={{ backgroundColor: 'rgb(var(--color-hover))' }}>
                          <div className="flex justify-between items-center mb-3 gap-2">
                            <span className="text-xs sm:text-sm font-medium truncate" style={{ color: 'rgb(var(--color-text-primary))' }}>{keyResult.title}</span>
                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setSelectedKeyResultForModal({ kr: keyResult, obj: objective });
                                  setShowAddTaskModal(true);
                                }}
                                className="p-1.5 rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Créer une tâche">

                                <CheckCircle size={14} className="text-blue-500" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedKeyResultForModal({ kr: keyResult, obj: objective });
                                  setShowAddEventModal(true);
                                }}
                                className="p-1.5 rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Planifier un événement">

                                <Calendar size={14} className="text-purple-500" />
                              </button>
                              <span className="text-[10px] sm:text-xs flex items-center gap-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
                                <Clock size={12} />
                                {keyResult.estimatedTime}min
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                type="number"
                                value={keyResult.currentValue}
                                onChange={(e) => updateKeyResult(objective.id, keyResult.id, Number(e.target.value))}
                                className="w-16 sm:w-20 px-2 py-1 text-xs sm:text-sm border rounded focus:outline-none"
                                style={{ backgroundColor: 'rgb(var(--color-surface))', color: 'rgb(var(--color-text-primary))', borderColor: 'rgb(var(--color-border))' }} />

                              <span className="text-xs sm:text-sm whitespace-nowrap" style={{ color: 'rgb(var(--color-text-secondary))' }}>/ {keyResult.targetValue}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: 'rgb(var(--color-border-muted))' }}>
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${keyResult.completed ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${krProgress}%` }} />
                              </div>
                              <span className="text-[10px] sm:text-xs font-medium w-8 text-right" style={{ color: 'rgb(var(--color-text-secondary))' }}>{Math.round(krProgress)}%</span>
                            </div>
                          </div>
                        </div>);

                    })}
                  </div>
              </motion.div>);

          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddObjective &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                <h2 className="text-xl font-bold">{editingObjective ? 'Modifier l\'objectif' : 'Nouvel Objectif'}</h2>
                <button onClick={() => {
                  resetForm();
                  setShowAddObjective(false);
                }}><X size={20} /></button>
              </div>
                <form onSubmit={handleSubmitObjective} className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                          <label className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200 block !whitespace-pre-line">Titre de l'objectif

                    </label>
                        <input
                      type="text"
                      value={newObjective.title}
                      onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ex: Maîtriser le développement Fullstack"
                      required />

                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200 block">
                          Description
                        </label>
                        <textarea
                      value={newObjective.description}
                      onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Quels sont les enjeux et la motivation derrière cet objectif ?"
                      rows={4} />

                      </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                          <label className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200 block">
                            Catégorie
                          </label>
                        <select
                      value={newObjective.category}
                      onChange={(e) => setNewObjective({ ...newObjective, category: e.target.value })}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none">

                          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                      </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200 block">
                              Date de début
                            </label>
                          <input
                        type="date"
                        value={newObjective.startDate}
                        onChange={(e) => setNewObjective({ ...newObjective, startDate: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />

                        </div>
                          <div>
                            <label className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200 block">
                              Date d'échéance
                            </label>
                          <input
                        type="date"
                        value={newObjective.endDate}
                        onChange={(e) => setNewObjective({ ...newObjective, endDate: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />

                        </div>
                      </div>
                      {(() => {
                    const duration = calculateDuration(newObjective.startDate, newObjective.endDate);
                    if (!duration) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                        duration.isError ?
                        "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400" :
                        "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800/30 dark:text-indigo-400"}`
                        }>

                            <Clock size={16} className={duration.isError ? "text-red-500" : "text-indigo-500"} />
                            <span>
                              {duration.isError ? "" : "Temps prévu pour l'objectif : "}
                              <strong className="font-bold">{duration.text}</strong>
                            </span>
                          </motion.div>);

                  })()}
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 relative inline-block">
                              Résultats Clés
                            </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Définissez comment vous mesurerez votre succès</p>
                      </div>
                      <button
                    type="button"
                    onClick={addKeyResult}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">

                        <Plus size={18} />
                        Ajouter un KR
                      </button>
                    </div>

                    <div className="space-y-3">
                      {keyResults.map((kr, idx) =>
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap md:flex-nowrap gap-4 items-end transition-all hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/30 group-hover:bg-blue-500 transition-colors" />

                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Intitulé du résultat clé *</label>
                            <input
                        type="text"
                        value={kr.title}
                        onChange={(e) => updateKeyResultField(idx, 'title', e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ex: Valider 12 certifications" />

                          </div>
                          <div className="w-full md:w-32">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Objectif</label>
                            <div className="relative">
                              <input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResultField(idx, 'targetValue', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-8"
                          placeholder="100" />

                              <TrendingUp size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>
                          <div className="w-full md:w-40">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Temps (min)</label>
                            <div className="relative">
                              <input
                          type="number"
                          value={kr.estimatedTime}
                          onChange={(e) => updateKeyResultField(idx, 'estimatedTime', e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-8"
                          placeholder="60" />

                              <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>
                          {keyResults.length > 1 &&
                    <button
                      type="button"
                      onClick={() => removeKeyResult(idx)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Supprimer ce résultat">

                              <Trash2 size={20} />
                            </button>
                    }
                        </motion.div>
                  )}
                    </div>
                  </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700">
                      <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowAddObjective(false);
                    }}
                    className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">

                        Annuler
                      </button>
                      <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-blue-500/25 transform transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">

                        {editingObjective ? 'Mettre à jour' : 'Créer l\'objectif'}
                      </button>
                    </div>
                </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {deletingObjective &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-sm">
              <h2 className="text-lg font-bold mb-4">Supprimer l'objectif ?</h2>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletingObjective(null)}>Annuler</button>
                <button onClick={() => deleteObjective(deletingObjective)} className="bg-red-600 text-white px-4 py-2 rounded">Supprimer</button>
              </div>
            </div>
          </div>
        }
      </AnimatePresence>

      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />

      <AddTaskForm expanded={showAddTaskModal} onFormToggle={setShowAddTaskModal} initialData={selectedKeyResultForModal ? { name: `OKR: ${selectedKeyResultForModal.kr.title}`, estimatedTime: selectedKeyResultForModal.kr.estimatedTime, category: 'okr', priority: 2, isFromOKR: true } : undefined} />

      
      <AnimatePresence>
        {selectedKeyResultForModal && showAddEventModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

            <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}>

              <AddEventModal
              isOpen={showAddEventModal}
              onClose={() => setShowAddEventModal(false)}
              task={{
                id: selectedKeyResultForModal.kr.id,
                name: selectedKeyResultForModal.kr.title,
                completed: selectedKeyResultForModal.kr.completed,
                priority: 2,
                category: 'okr',
                estimatedTime: selectedKeyResultForModal.kr.estimatedTime,
                deadline: selectedKeyResultForModal.obj.endDate,
                bookmarked: false
              }}
              onAddEvent={(event) => {
                addEvent(event);
                setShowAddEventModal(false);
              }} />

            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>);

};

export default OKRPage;
export default OKRPage;
