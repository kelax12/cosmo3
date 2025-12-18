import React, { useState, useEffect } from 'react';
import TaskTable from '../components/TaskTable';
import TaskFilter from '../components/TaskFilter';
import AddTaskForm from '../components/AddTaskForm';
import TasksSummary from '../components/TasksSummary';
import DeadlineCalendar from '../components/DeadlineCalendar';
import ListManager from '../components/ListManager';
import { useTasks } from '../context/TaskContext';
import { CalendarDays, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useLocation } from 'react-router-dom';

const TasksPage: React.FC = () => {
  const { tasks, lists } = useTasks();
  const location = useLocation();
  const [filter, setFilter] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDeadlineCalendar, setShowDeadlineCalendar] = useState(false);
  const [showListManager, setShowListManager] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showQuickListsPopup, setShowQuickListsPopup] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { openTaskId?: string } | null;
    if (state?.openTaskId) {
      setSelectedTaskId(state.openTaskId);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleShowCompletedChange = (show: boolean) => {
    setShowCompleted(show);
  };

  const handleListSelect = (listId: string) => {
    setSelectedListId(selectedListId === listId ? null : listId);
  };

  const clearListFilter = () => {
    setSelectedListId(null);
  };

  // Filter tasks based on completion status and selected list
  let filteredTasks = showCompleted 
    ? tasks.filter(task => task.completed)
    : tasks.filter(task => !task.completed);

  // If a list is selected, filter tasks by that list
  if (selectedListId) {
    const selectedList = lists.find(list => list.id === selectedListId);
    if (selectedList) {
      filteredTasks = filteredTasks.filter(task => selectedList.taskIds.includes(task.id));
    }
  }

  const selectedList = selectedListId ? lists.find(list => list.id === selectedListId) : null;

  const colorOptions = [
    { value: 'blue', color: '#3B82F6', name: 'Bleu' },
    { value: 'red', color: '#EF4444', name: 'Rouge' },
    { value: 'green', color: '#10B981', name: 'Vert' },
    { value: 'purple', color: '#8B5CF6', name: 'Violet' },
    { value: 'orange', color: '#F97316', name: 'Orange' },
    { value: 'yellow', color: '#F59E0B', name: 'Jaune' },
    { value: 'pink', color: '#EC4899', name: 'Rose' },
    { value: 'indigo', color: '#6366F1', name: 'Indigo' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="flex flex-col gap-8">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center"
        >
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2"
            >
              To do list
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-600 dark:text-slate-400"
            >
              Gérez vos tâches efficacement
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowListManager(!showListManager)}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <List size={20} />
              <span>Gérer les listes</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeadlineCalendar(!showDeadlineCalendar)}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <CalendarDays size={20} />
              <span>Calendrier des deadlines</span>
            </motion.button>
          </motion.div>
        </motion.header>

        <AnimatePresence>
          {showListManager && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ListManager />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeadlineCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DeadlineCalendar />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="card p-6">
                {!showCompleted && !showAddTaskForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Accès rapide aux listes</h3>

                      <Dialog open={showQuickListsPopup} onOpenChange={setShowQuickListsPopup}>
                        <DialogTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${!selectedListId ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600'}`}
                          >
                            <List size={16} />
                            <span>{selectedList ? selectedList.name : 'Toutes les tâches'}</span>
                          </motion.button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Accès rapide aux listes</DialogTitle>
                          </DialogHeader>

                          <div className="flex flex-wrap gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                clearListFilter();
                                setShowQuickListsPopup(false);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm border ${
                                !selectedListId
                                  ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600'
                              }`}
                            >
                              Toutes les tâches
                            </motion.button>

                            {lists.map((list, index) => {
                              const colorOption = colorOptions.find(c => c.value === list.color);
                              const isSelected = selectedListId === list.id;

                              return (
                                <button
                                  key={list.id}
                                  onClick={() => {
                                    handleListSelect(list.id);
                                    setShowQuickListsPopup(false);
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${
                                    isSelected
                                      ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-blue-500 dark:text-white dark:border-blue-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-600'
                                  }`}
                                >
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorOption?.color || '#3B82F6' }} />
                                  <span>{list.name}</span>
                                  <span className="text-xs bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 px-2 py-1 rounded border border-gray-300 dark:border-slate-600">
                                    {list.taskIds.filter(taskId => {
                                      const task = tasks.find(t => t.id === taskId);
                                      return task && !task.completed;
                                    }).length}
                                  </span>
                                  {isSelected && (
                                    <div className="text-gray-700 dark:text-slate-300">
                                      <X size={14} className="ml-1 hover:text-red-500 dark:hover:text-red-400" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          <AnimatePresence>
                            {selectedList && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <motion.div 
                                      animate={{ rotate: [0, 360] }}
                                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: colorOptions.find(c => c.value === selectedList.color)?.color || '#3B82F6' }}
                                    />
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                      Liste active : {selectedList.name}
                                    </span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                      ({filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      clearListFilter();
                                      setShowQuickListsPopup(false);
                                    }}
                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1"
                                    title="Afficher toutes les tâches"
                                  >
                                    <X size={16} />
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                )}

              {!showAddTaskForm && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between items-start mb-8 gap-4"
                >
                  <div className="flex-1">
                    <TaskFilter 
                      onFilterChange={handleFilterChange} 
                      currentFilter={filter}
                      showCompleted={showCompleted}
                      onShowCompletedChange={handleShowCompletedChange}
                    />
                  </div>
                  {!showCompleted && (
                    <AddTaskForm 
                      onFormToggle={setShowAddTaskForm}
                    />
                  )}
                </motion.div>
              )}

              <AnimatePresence>
                {showAddTaskForm && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-8"
                  >
                    <AddTaskForm 
                      onFormToggle={setShowAddTaskForm}
                      expanded={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <TaskTable 
                  tasks={filteredTasks}
                  sortField={filter}
                  showCompleted={showCompleted}
                  selectedTaskId={selectedTaskId}
                  onTaskModalClose={() => setSelectedTaskId(null)}
                />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <TasksSummary />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TasksPage;
