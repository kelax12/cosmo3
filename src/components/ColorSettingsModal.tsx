import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';

type ColorSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ColorSettingsModal: React.FC<ColorSettingsModalProps> = ({ isOpen, onClose }) => {
  const { categories, updateCategory, addCategory, deleteCategory } = useTasks();
  const [localCategories, setLocalCategories] = useState(categories);

  if (!isOpen) return null;

  const handleAddCategory = () => {
    const newId = Date.now().toString();
    const newCat = {
      id: newId,
      name: '',
      color: '#3B82F6'
    };
    setLocalCategories([...localCategories, newCat]);
  };

  const handleUpdateLocal = (id: string, updates: Partial<{ name: string; color: string }>) => {
    setLocalCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const handleDeleteLocal = (id: string) => {
    setLocalCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    // Synchronize with context
    // First delete categories that are no longer in local
    categories.forEach(cat => {
      if (!localCategories.find(lc => lc.id === cat.id)) {
        deleteCategory(cat.id);
      }
    });

    // Then update or add
    localCategories.forEach(lc => {
      const existing = categories.find(cat => cat.id === lc.id);
      if (existing) {
        if (existing.name !== lc.name || existing.color !== lc.color) {
          updateCategory(lc.id, { name: lc.name, color: lc.color });
        }
      } else {
        addCategory(lc);
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-md overflow-hidden rounded-[20px] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white">Modifier les catégories</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              <X size={28} strokeWidth={3} />
            </button>
          </div>

          <div className="px-6 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {/* Add Button */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={handleAddCategory}
                className="text-slate-600 dark:text-white hover:text-blue-600 transition-colors"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>

            {/* List Categories */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {localCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3"
                  >
                    {/* Color Picker Box */}
                    <div className="relative group">
                      <div 
                        className="h-10 w-10 rounded-lg flex-shrink-0 cursor-pointer shadow-sm hover:brightness-110 transition-all"
                        style={{ backgroundColor: category.color }}
                      />
                      <input
                        type="color"
                        value={category.color}
                        onChange={(e) => handleUpdateLocal(category.id, { color: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    
                    {/* Name Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => handleUpdateLocal(category.id, { name: e.target.value })}
                        className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-slate-500 transition-all"
                        placeholder="Nom de la catégorie"
                      />
                    </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteLocal(category.id)}
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-8 pt-2 flex justify-center">
            <button
              onClick={handleSave}
              className="w-48 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Enregistrer
            </button>
          </div>
        </motion.div>
    </div>
  );
};

export default ColorSettingsModal;
