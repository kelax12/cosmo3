import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, LayoutGrid, Type, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void;
}

export const COLORS: { name: string; hex: string; fr: string }[] = [
  { name: 'blue', hex: '#3b82f6', fr: 'Bleu' },
  { name: 'green', hex: '#22c55e', fr: 'Vert' },
  { name: 'red', hex: '#ef4444', fr: 'Rouge' },
  { name: 'purple', hex: '#a855f7', fr: 'Violet' },
  { name: 'orange', hex: '#f97316', fr: 'Orange' },
  { name: 'yellow', hex: '#eab308', fr: 'Jaune' },
  { name: 'pink', hex: '#ec4899', fr: 'Rose' },
  { name: 'indigo', hex: '#6366f1', fr: 'Indigo' },
  { name: 'cyan', hex: '#06b6d4', fr: 'Cyan' },
  { name: 'emerald', hex: '#10b981', fr: 'Émeraude' },
  { name: 'rose', hex: '#f43f5e', fr: 'Rose vif' },
  { name: 'amber', hex: '#f59e0b', fr: 'Ambre' },
  { name: 'slate', hex: '#64748b', fr: 'Ardoise' },
  { name: 'teal', hex: '#14b8a6', fr: 'Sarcelle' },
];

export const ICONS = [
  '📂', '📁', '🏠', '💼', '🛒', '🎮', '🎵', '📚',
  '💰', '🏋️', '🍔', '✈️', '🚗', '💊', '🎬', '📱',
  '💡', '🎯', '⭐', '❤️', '🔥', '⚡', '🌟', '🎁',
  '🎨', '🔧', '🧪', '🧬', '🚀', '🌈', '🍦', '🍕',
  '🏀', '⚽', '🎸', '🎹', '💻', '🖥️', '🖋️', '📝',
  '📍', '⏰', '🔒', '🔑', '💎', '💡', '🌱', '☀️'
];

export const getColorHex = (colorName: string): string => {
  return COLORS.find(c => c.name === colorName)?.hex || '#3b82f6';
};

export const getColorFr = (colorName: string): string => {
  return COLORS.find(c => c.name === colorName)?.fr || colorName;
};

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    color: 'blue',
    icon: '📂'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd({
        ...formData,
        id: Date.now().toString()
      });
      setIsAdding(false);
    }
    setFormData({ name: '', color: 'blue', icon: '📂' });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      color: cat.color,
      icon: cat.icon
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', color: 'blue', icon: '📂' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <LayoutGrid className="text-blue-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Catégories OKR</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gérez vos domaines d'objectifs</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">
                {/* Form Section */}
                <AnimatePresence mode="wait">
                  {(isAdding || editingId) && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-6"
                    >
                        <form onSubmit={handleSubmit} className="relative bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-5">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors z-10"
                            title="Fermer"
                          >
                            <X size={16} />
                          </button>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center">
                              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h3>
                            <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 mr-8">
                                <div 
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs shadow-sm transition-transform"
                                style={{ 
                                  backgroundColor: getColorHex(formData.color) + '30',
                                  color: getColorHex(formData.color),
                                  border: `1.5px solid ${getColorHex(formData.color)}60`
                                }}
                              >
                                {formData.icon}
                              </div>
                            <span className="text-[10px] font-bold" style={{ color: getColorHex(formData.color) }}>
                              {formData.name || 'Nom'}
                            </span>
                          </div>
                        </div>

                        {/* Name Input */}
                        <div className="relative group">
                          <input
                            type="text"
                            autoFocus
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                            placeholder="Nom de la catégorie (ex: Sport, Travail...)"
                          />
                        </div>

                        {/* Icon & Color Grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Icons Grid */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                              <LayoutGrid size={10} /> Icône
                            </label>
                            <div className="grid grid-cols-6 gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-[140px] overflow-y-auto custom-scrollbar shadow-inner">
                              {ICONS.map((icon) => (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icon })}
                                  className={`aspect-square rounded-lg text-lg flex items-center justify-center transition-all ${
                                    formData.icon === icon 
                                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105' 
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {icon}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Colors Grid */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                              <Palette size={10} /> Couleur : <span style={{ color: getColorHex(formData.color) }} className="lowercase italic">{getColorFr(formData.color)}</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-h-[140px] overflow-y-auto custom-scrollbar shadow-inner">
                              {COLORS.map((color) => (
                                <button
                                  key={color.name}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, color: color.name })}
                                  className={`aspect-square rounded-lg transition-all relative group flex items-center justify-center ${
                                    formData.color === color.name 
                                      ? 'ring-2 ring-blue-500 scale-105' 
                                      : 'opacity-80 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: color.hex }}
                                >
                                  {formData.color === color.name && (
                                    <Check size={16} className="text-white drop-shadow-sm" strokeWidth={3} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                          >
                            <Check size={18} />
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-6 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold transition-all hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-[0.98]"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Categories List */}
                <div className="space-y-3 pb-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vos catégories ({categories.length})</h3>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-all active:scale-90"
                      title="Ajouter une catégorie"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {categories.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <LayoutGrid size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">Aucune catégorie définie</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                      {categories.map((category) => (
                          <motion.div
                            layout
                            key={category.id}
                            className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none"
                            style={{ 
                              background: `linear-gradient(135deg, ${getColorHex(category.color)}08 0%, transparent 100%)`,
                              borderColor: getColorHex(category.color) + '20'
                            }}
                          >
                          <div className="flex items-center gap-4">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110 duration-300"
                                style={{ 
                                  backgroundColor: getColorHex(category.color) + '30',
                                  color: getColorHex(category.color),
                                  border: `1.5px solid ${getColorHex(category.color)}60`,
                                  boxShadow: `0 4px 12px ${getColorHex(category.color)}20`
                                }}
                              >
                                {category.icon}
                              </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {category.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(category.color) }} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                  {getColorFr(category.color)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(category)}
                              className="p-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm active:scale-90"
                              title="Modifier"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => onDelete(category.id)}
                              className="p-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm active:scale-90"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryManager;
