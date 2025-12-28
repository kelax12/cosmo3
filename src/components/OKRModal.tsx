import React, { useState, useEffect } from 'react';
import { X, Target, TrendingUp, Save, AlertCircle, Plus, Minus, Clock, Edit2, Trash2 } from 'lucide-react';
import { OKR, KeyResult, useTasks } from '../context/TaskContext';

interface OKRModalProps {
  okr: OKR;
  isOpen: boolean;
  onClose: () => void;
}

const OKRModal: React.FC<OKRModalProps> = ({ okr, isOpen, onClose }) => {
  const { updateOKR, updateKeyResult } = useTasks();
  
  // Form state with validation
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    estimatedTime: 60
  });
  
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [editingKeyResult, setEditingKeyResult] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Categories for OKR
  const categories = [
    { id: 'personal', name: 'Personnel', color: 'blue', icon: '👤' },
    { id: 'professional', name: 'Professionnel', color: 'green', icon: '💼' },
    { id: 'health', name: 'Santé', color: 'red', icon: '❤️' },
    { id: 'learning', name: 'Apprentissage', color: 'purple', icon: '📚' },
  ];

  // Initialize form data when OKR changes
  useEffect(() => {
    if (isOpen && okr) {
      setFormData({
        title: okr.title,
        description: okr.description,
        category: okr.category,
        startDate: okr.startDate,
        endDate: okr.endDate,
        estimatedTime: okr.estimatedTime
      });
      setKeyResults([...okr.keyResults]);
      setHasChanges(false);
      setErrors({});
    }
  }, [isOpen, okr]);

  // Track changes
  useEffect(() => {
    if (!okr) return;
    
    const hasFormChanges = 
      formData.title !== okr.title ||
      formData.description !== okr.description ||
      formData.category !== okr.category ||
      formData.startDate !== okr.startDate ||
      formData.endDate !== okr.endDate ||
      formData.estimatedTime !== okr.estimatedTime ||
      JSON.stringify(keyResults) !== JSON.stringify(okr.keyResults);
    
    setHasChanges(hasFormChanges);
  }, [formData, keyResults, okr]);

  if (!isOpen) return null;

  // Validation rules
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Rule 1: Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre de l\'objectif est obligatoire';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Le titre doit contenir au moins 5 caractères';
    }
    
    // Rule 2: Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }
    
    // Rule 3: Key results validation
    const validKeyResults = keyResults.filter(kr => kr.title.trim() && kr.targetValue > 0);
    if (validKeyResults.length === 0) {
      newErrors.keyResults = 'Au moins un résultat clé valide est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyResultChange = (index: number, field: string, value: any) => {
    setKeyResults(prev => prev.map((kr, i) => 
      i === index ? { ...kr, [field]: value } : kr
    ));
    
    // Clear key results error
    if (errors.keyResults) {
      setErrors(prev => ({ ...prev, keyResults: '' }));
    }
  };

  const addKeyResult = () => {
    if (keyResults.length < 10) {
      const newKeyResult: KeyResult = {
        id: `kr-${Date.now()}`,
        title: '',
        currentValue: 0,
        targetValue: 100,
        unit: '',
        completed: false,
        estimatedTime: 30
      };
      setKeyResults(prev => [...prev, newKeyResult]);
    }
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedOKR: Partial<OKR> = {
        ...formData,
        keyResults: keyResults.filter(kr => kr.title.trim() && kr.targetValue > 0)
      };
      
      updateOKR(okr.id, updatedOKR);
      onClose();
    } catch (error) {
      setErrors({ general: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const getProgress = () => {
    if (keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => {
      return sum + Math.min((kr.currentValue / kr.targetValue) * 100, 100);
    }, 0);
    return Math.round(totalProgress / keyResults.length);
  };

  const progress = getProgress();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="okr-modal-title">
      <div className="rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto transition-colors" style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-green-50 dark:from-green-900/20 to-blue-50 dark:to-blue-900/20 transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Target size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="okr-modal-title" className="text-xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                Modifier l'objectif
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Progression : {progress}%
                </span>
                {hasChanges && (
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm">
                    <AlertCircle size={16} />
                    <span>Non sauvegardé</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleClose}
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
            aria-label="Fermer la modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Error display */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle size={16} />
                <span className="font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                   Titre de l'objectif *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title ? 'border-red-300 dark:border-red-600' : ''
                  }`}
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: errors.title ? 'rgb(var(--color-error))' : 'rgb(var(--color-border))'
                  }}
                  placeholder="Ex: Améliorer mes compétences en français"
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {errors.title && (
                  <div id="title-error" className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                   Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
                  }}
                  placeholder="Décrivez votre objectif en détail..."
                />
              </div>

              {/* Category and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                     Catégorie
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      color: 'rgb(var(--color-text-primary))',
                      borderColor: 'rgb(var(--color-border))'
                    }}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ${category.name}` : category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                     Date début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      color: 'rgb(var(--color-text-primary))',
                      borderColor: 'rgb(var(--color-border))'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                     Date fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.endDate ? 'border-red-300 dark:border-red-600' : ''
                    }`}
                    style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      color: 'rgb(var(--color-text-primary))',
                      borderColor: errors.endDate ? 'rgb(var(--color-error))' : 'rgb(var(--color-border))'
                    }}
                    aria-describedby={errors.endDate ? 'enddate-error' : undefined}
                  />
                  {errors.endDate && (
                    <div id="enddate-error" className="flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle size={14} />
                      {errors.endDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Temps estimé total (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange('estimatedTime', Number(e.target.value))}
                  min="1"
                  max="1440"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'rgb(var(--color-surface))',
                    color: 'rgb(var(--color-text-primary))',
                    borderColor: 'rgb(var(--color-border))'
                  }}
                  placeholder="60"
                />
              </div>
            </div>

            {/* Right Column - Key Results */}
            <div className="space-y-6">
              
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-gray-50 dark:from-slate-700 to-blue-50 dark:to-blue-900/20 p-6 rounded-lg border transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}> Progression globale</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500 dark:text-green-400" />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{progress}%</span>
                  </div>
                </div>
                <div className="w-full rounded-full h-3" style={{ backgroundColor: 'rgb(var(--color-border-muted))' }}>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Key Results Management */}
              <div className="bg-gradient-to-r from-gray-50 dark:from-slate-700 to-purple-50 dark:to-purple-900/20 p-6 rounded-lg border transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'rgb(var(--color-text-primary))' }}>
                     Résultats Clés
                    <span className="text-sm font-normal" style={{ color: 'rgb(var(--color-text-muted))' }}>({keyResults.length}/10)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addKeyResult}
                    disabled={keyResults.length >= 10}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} />
                    <span>Ajouter</span>
                  </button>
                </div>
                
                {errors.keyResults && (
                  <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {errors.keyResults}
                  </div>
                )}
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {keyResults.map((keyResult, index) => (
                    <div key={keyResult.id} className="rounded-lg p-4 border transition-colors" style={{
                      backgroundColor: 'rgb(var(--color-surface))',
                      borderColor: 'rgb(var(--color-border))'
                    }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>Résultat clé {index + 1}</span>
                        {keyResults.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeKeyResult(index)}
                            className="ml-auto p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Supprimer ce résultat clé"
                          >
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={keyResult.title}
                          onChange={(e) => handleKeyResultChange(index, 'title', e.target.value)}
                          placeholder="Description du résultat clé"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          style={{
                            backgroundColor: 'rgb(var(--color-surface))',
                            color: 'rgb(var(--color-text-primary))',
                            borderColor: 'rgb(var(--color-border))'
                          }}
                        />
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
                              Valeur actuelle
                            </label>
                            <input
                              type="number"
                              value={keyResult.currentValue}
                              onChange={(e) => handleKeyResultChange(index, 'currentValue', Number(e.target.value))}
                              min="0"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              style={{
                                backgroundColor: 'rgb(var(--color-surface))',
                                color: 'rgb(var(--color-text-primary))',
                                borderColor: 'rgb(var(--color-border))'
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
                              Objectif
                            </label>
                            <input
                              type="number"
                              value={keyResult.targetValue}
                              onChange={(e) => handleKeyResultChange(index, 'targetValue', Number(e.target.value))}
                              min="1"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              style={{
                                backgroundColor: 'rgb(var(--color-surface))',
                                color: 'rgb(var(--color-text-primary))',
                                borderColor: 'rgb(var(--color-border))'
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
                              Temps (min)
                            </label>
                            <input
                              type="number"
                              value={keyResult.estimatedTime}
                              onChange={(e) => handleKeyResultChange(index, 'estimatedTime', Number(e.target.value))}
                              min="1"
                              max="480"
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              style={{
                                backgroundColor: 'rgb(var(--color-surface))',
                                color: 'rgb(var(--color-text-primary))',
                                borderColor: 'rgb(var(--color-border))'
                              }}
                            />
                          </div>
                        </div>

                        {/* Progress bar for this key result */}
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>Progression</span>
                            <span className="text-xs font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                              {Math.min(Math.round((keyResult.currentValue / keyResult.targetValue) * 100), 100)}%
                            </span>
                          </div>
                          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(var(--color-border-muted))' }}>
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                keyResult.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-600 dark:bg-blue-500'
                              }`}
                              style={{ width: `${Math.min((keyResult.currentValue / keyResult.targetValue) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-8 border-t mt-8 transition-colors" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
              {keyResults.length} résultat{keyResults.length !== 1 ? 's' : ''} clé{keyResults.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-3">
              <button
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
                onClick={handleSave}
                disabled={isLoading || !hasChanges || Object.keys(errors).length > 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e2235] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700/50">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">Modifications non sauvegardées</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border border-slate-600 hover:bg-slate-800 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKRModal;
