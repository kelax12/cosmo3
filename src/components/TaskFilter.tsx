import React, { useState } from 'react';
import { ChevronDown, Filter, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../context/TaskContext';
import { Slider } from './ui/slider';

type TaskFilterProps = {
  onFilterChange: (value: string) => void;
  currentFilter: string;
  showCompleted?: boolean;
  onShowCompletedChange?: (show: boolean) => void;
};

const TaskFilter: React.FC<TaskFilterProps> = ({ 
  onFilterChange, 
  currentFilter, 
  showCompleted = false,
  onShowCompletedChange 
}) => {
  const { categories, priorityRange, setPriorityRange } = useTasks();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriorityRange([1, 5]);
    onFilterChange('');
    onShowCompletedChange?.(false);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || 
                          priorityRange[0] !== 1 || priorityRange[1] !== 5 || 
                          showCompleted;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="task-filter" className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>
            Trier par :
          </label>
          <div className="relative">
            <select
              id="task-filter"
              className="appearance-none border rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              style={{ 
                backgroundColor: 'rgb(var(--color-surface))',
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'completed') {
                  onShowCompletedChange?.(true);
                  onFilterChange('');
                } else {
                  onShowCompletedChange?.(false);
                  onFilterChange(value);
                }
              }}
              value={showCompleted ? 'completed' : currentFilter}
              aria-label="Trier les tâches par"
            >
              <option value="">Toutes les tâches</option>
              <option value="priority">Par priorité</option>
              <option value="deadline">Par échéance</option>
              <option value="createdAt">Par date de création</option>
              <option value="name">Par nom</option>
              <option value="category">Par catégorie</option>
              <option value="completed">Tâches complétées</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2" style={{ color: 'rgb(var(--color-text-muted))' }}>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-2 border-blue-700'
              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
          }`}
          aria-label={showAdvancedFilters ? "Masquer les filtres avancés" : "Afficher les filtres avancés"}
          aria-expanded={showAdvancedFilters}
        >
          <Filter size={18} aria-hidden="true" />
          <span>Filtres</span>
          {hasActiveFilters && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-blue-500 text-blue-600 dark:text-white text-xs px-2 py-0.5 rounded-full font-bold"
              aria-label={`${[searchTerm, ...selectedCategories, showCompleted ? 'completed' : ''].filter(Boolean).length} filtres actifs`}
            >
              {[searchTerm, ...selectedCategories, showCompleted ? 'completed' : ''].filter(Boolean).length}
            </motion.span>
          )}
        </motion.button>

        {/* Clear Filters */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all shadow-sm"
              aria-label="Réinitialiser tous les filtres"
            >
              <X size={18} aria-hidden="true" />
              <span>Réinitialiser</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="p-6 rounded-xl border shadow-lg space-y-6"
              style={{
                backgroundColor: 'rgb(var(--color-surface))',
                borderColor: 'rgb(var(--color-border))'
              }}
            >
              {/* Search */}
              <div>
                <label htmlFor="search-tasks" className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                   Rechercher
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="search-tasks"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une tâche..."
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      borderColor: 'rgb(var(--color-border))',
                      color: 'rgb(var(--color-text-primary))'
                    }}
                    aria-label="Rechercher une tâche par nom"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="Effacer la recherche"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                   Filtrer par catégories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md border-2 border-slate-900 dark:border-slate-100'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                      }`}
                      aria-label={`${selectedCategories.includes(category.id) ? 'Retirer' : 'Ajouter'} le filtre ${category.name}`}
                      aria-pressed={selectedCategories.includes(category.id)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span>{category.name}</span>
                      {selectedCategories.includes(category.id) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          aria-hidden="true"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Priority Range */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-500">
                     Intervalle de priorité
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">
                      P{priorityRange[0]}
                    </span>
                    <span className="text-slate-600">à</span>
                    <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">
                      P{priorityRange[1]}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={priorityRange}
                    onValueChange={(value) => setPriorityRange(value as [number, number])}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex justify-between mt-6 px-1">
                  {[1, 2, 3, 4, 5].map(p => {
                    const isActive = p >= priorityRange[0] && p <= priorityRange[1];
                    return (
                      <div key={p} className="flex flex-col items-center gap-2">
                        <div className={`text-xs font-black transition-colors ${isActive ? 'text-blue-400 scale-110' : 'text-slate-600'}`}>
                          P{p}
                        </div>
                        <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-slate-800'}`} />
                        <span className="text-[10px] text-slate-500 font-medium">
                          {p === 1 ? 'Basse' : p === 5 ? 'Critique' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'rgb(var(--color-hover))',
                    borderColor: 'rgb(var(--color-border))'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Filtres actifs
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      aria-label="Effacer tous les filtres"
                    >
                      Tout effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                        Recherche: "{searchTerm}"
                      </span>
                    )}
                    {selectedCategories.map((cat) => {
                      const selected = categories.find(c => c.id === cat);
                      const color = selected?.color || '#3B82F6';
                      return (
                        <div key={cat} className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                          <span>{selected?.name || cat}</span>
                          <button
                            onClick={() => toggleCategory(cat)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                    {showCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                        Complétées
                      </span>
                    )}
                    {(priorityRange[0] !== 1 || priorityRange[1] !== 5) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">
                        Priorité: {priorityRange[0]}-{priorityRange[1]}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskFilter;
