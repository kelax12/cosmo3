import React, { createContext, useContext, useState, useEffect } from 'react';

export type Task = {
  id: string;
  name: string;
  priority: number;
  category: string;
  deadline: string;
  estimatedTime: number;
  createdAt: string;
  bookmarked: boolean;
  completed: boolean;
  completedAt?: string;
  isCollaborative?: boolean;
  collaborators?: string[];
  sharedBy?: string;
  permissions?: 'responsible' | 'editor' | 'observer';
  collaboratorValidations?: { [key: string]: boolean };
};

export type TaskList = {
  id: string;
  name: string;
  taskIds: string[];
  color: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  notes?: string;
  taskId: string;
};

export type ColorSettings = {
  [key: string]: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  premiumTokens: number;
  premiumWinStreak: number;
  lastTokenConsumption: string;
  subscriptionEndDate?: string;
  autoValidation: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
};

export type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
};

export type Habit = {
  id: string;
  name: string;
  estimatedTime: number;
  completions: { [date: string]: boolean };
  streak: number;
  color: string;
  createdAt: string;
};

export type OKRCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type OKR = {
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

export type KeyResult = {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  completed: boolean;
  estimatedTime: number;
  history?: { date: string, increment: number }[];
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

type TaskContextType = {
  tasks: Task[];
  lists: TaskList[];
  events: CalendarEvent[];
  colorSettings: ColorSettings;
  categories: Category[];
  priorityRange: [number, number];
  searchTerm: string;
  selectedCategories: string[];
  user: User | null;
  messages: Message[];
  friendRequests: FriendRequest[];
  habits: Habit[];
  okrs: OKR[];
  okrCategories: OKRCategory[];
  friends: User[];
  favoriteColors: string[];
  setFavoriteColors: (colors: string[]) => void;
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleBookmark: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  addList: (list: TaskList) => void;
  addTaskToList: (taskId: string, listId: string) => void;
  removeTaskFromList: (taskId: string, listId: string) => void;
  deleteList: (listId: string) => void;
  updateList: (listId: string, updates: Partial<TaskList>) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  updateColorSettings: (colors: ColorSettings) => void;
  setPriorityRange: (range: [number, number]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
    watchAd: () => void;
    consumePremiumToken: () => void;
    isPremium: () => boolean;
    sendMessage: (receiverId: string, content: string, taskId?: string) => void;
    sendFriendRequest: (receiverId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  shareTask: (taskId: string, userId: string, permission: 'responsible' | 'editor' | 'observer') => void;
  addHabit: (habit: Habit) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  addOKR: (okr: OKR) => void;
  updateOKR: (id: string, updates: Partial<OKR>) => void;
  updateKeyResult: (okrId: string, keyResultId: string, updates: Partial<KeyResult>) => void;
  deleteOKR: (id: string) => void;
  updateUserSettings: (updates: Partial<User>) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addOKRCategory: (category: OKRCategory) => void;
    updateOKRCategory: (id: string, updates: Partial<OKRCategory>) => void;
    deleteOKRCategory: (id: string) => void;
    markMessagesAsRead: () => void;
  };


const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: '1', name: 'Rédaction rapport SEO', priority: 5, category: 'blue', deadline: '2025-06-13T00:00:00.000Z', estimatedTime: 120, createdAt: '2025-05-29T00:00:00.000Z', bookmarked: true, completed: false },
  { id: '2', name: 'Optimisation base de données', priority: 4, category: 'red', deadline: '2025-06-15T00:00:00.000Z', estimatedTime: 180, createdAt: '2025-05-30T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '3', name: 'Design Système UI', priority: 3, category: 'purple', deadline: '2025-06-20T00:00:00.000Z', estimatedTime: 300, createdAt: '2025-05-31T00:00:00.000Z', bookmarked: true, completed: false },
  { id: 'c1', name: 'Audit Accessibilité Web', priority: 4, category: 'blue', deadline: '2025-06-14T00:00:00.000Z', estimatedTime: 120, createdAt: '2025-06-01T00:00:00.000Z', bookmarked: false, completed: false, isCollaborative: true, sharedBy: 'Marie Dupont', collaborators: ['Utilisateur Demo', 'Thomas Laurent'], permissions: 'editor' },
  { id: 'c2', name: 'Refactoring CSS Modules', priority: 2, category: 'purple', deadline: '2025-06-16T00:00:00.000Z', estimatedTime: 90, createdAt: '2025-06-02T00:00:00.000Z', bookmarked: true, completed: false, isCollaborative: true, sharedBy: 'Sophia Martin', collaborators: ['Utilisateur Demo'], permissions: 'responsible' },
  { id: '4', name: 'Réunion client - Roadmap', priority: 5, category: 'orange', deadline: '2025-06-12T10:00:00.000Z', estimatedTime: 60, createdAt: '2025-06-01T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '5', name: 'Audit sécurité Cloud', priority: 4, category: 'red', deadline: '2025-06-25T00:00:00.000Z', estimatedTime: 240, createdAt: '2025-06-02T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '6', name: 'Formation TypeScript avancée', priority: 2, category: 'green', deadline: '2025-07-01T00:00:00.000Z', estimatedTime: 480, createdAt: '2025-06-03T00:00:00.000Z', bookmarked: true, completed: false },
  { id: '7', name: 'Préparation démo V2', priority: 5, category: 'blue', deadline: '2025-06-14T00:00:00.000Z', estimatedTime: 90, createdAt: '2025-06-04T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '8', name: 'Correction bugs sprint #42', priority: 4, category: 'red', deadline: '2025-06-13T18:00:00.000Z', estimatedTime: 150, createdAt: '2025-06-05T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '9', name: 'Mise à jour documentation API', priority: 2, category: 'purple', deadline: '2025-06-30T00:00:00.000Z', estimatedTime: 120, createdAt: '2025-06-06T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '10', name: 'Planification marketing Q3', priority: 3, category: 'orange', deadline: '2025-06-28T00:00:00.000Z', estimatedTime: 180, createdAt: '2025-06-07T00:00:00.000Z', bookmarked: true, completed: false },
  { id: '11', name: 'Refactoring modules Auth', priority: 4, category: 'red', deadline: '2025-06-18T00:00:00.000Z', estimatedTime: 210, createdAt: '2025-06-08T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '12', name: 'Tests unitaires Core', priority: 3, category: 'blue', deadline: '2025-06-22T00:00:00.000Z', estimatedTime: 150, createdAt: '2025-06-09T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '13', name: 'Déploiement Staging', priority: 5, category: 'orange', deadline: '2025-06-12T16:00:00.000Z', estimatedTime: 45, createdAt: '2025-06-10T00:00:00.000Z', bookmarked: true, completed: false },
  { id: '14', name: 'Recherche UX - Mobile App', priority: 2, category: 'purple', deadline: '2025-07-10T00:00:00.000Z', estimatedTime: 360, createdAt: '2025-06-11T00:00:00.000Z', bookmarked: false, completed: false },
  { id: '15', name: 'Conf call investisseurs', priority: 5, category: 'blue', deadline: '2025-06-15T14:00:00.000Z', estimatedTime: 60, createdAt: '2025-06-12T00:00:00.000Z', bookmarked: false, completed: false },
  ...Array.from({ length: 35 }).map((_, i) => ({
    id: `t-bulk-${i}`,
    name: `Tâche arbitraire #${i + 16} - Demo`,
    priority: Math.floor(Math.random() * 5) + 1,
    category: ['blue', 'red', 'green', 'purple', 'orange'][Math.floor(Math.random() * 5)],
    deadline: new Date(Date.now() + Math.random() * 1000000000).toISOString(),
    estimatedTime: Math.floor(Math.random() * 120) + 15,
    createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    bookmarked: Math.random() > 0.8,
    completed: Math.random() > 0.7,
    completedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined
  }))
];

const initialFriends: User[] = [
  { id: 'marie-dupont', name: 'Marie Dupont', email: 'marie@example.com', avatar: '👩‍💼', premiumTokens: 5, premiumWinStreak: 12, lastTokenConsumption: new Date().toISOString(), autoValidation: true },
  { id: 'thomas-laurent', name: 'Thomas Laurent', email: 'thomas@example.com', avatar: '👨‍💻', premiumTokens: 0, premiumWinStreak: 0, lastTokenConsumption: new Date().toISOString(), autoValidation: false },
  { id: 'sophia-martin', name: 'Sophia Martin', email: 'sophia@example.com', avatar: '👩‍🔬', premiumTokens: 2, premiumWinStreak: 3, lastTokenConsumption: new Date().toISOString(), autoValidation: false },
  { id: 'f1', name: 'Alice Martin', email: 'alice@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', premiumTokens: 0, premiumWinStreak: 0, lastTokenConsumption: new Date().toISOString(), autoValidation: false },
  { id: 'f3', name: 'Sophie Petit', email: 'sophie@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', premiumTokens: 5, premiumWinStreak: 12, lastTokenConsumption: new Date().toISOString(), autoValidation: true },
  { id: 'f4', name: 'Lucas Dubois', email: 'lucas@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas', premiumTokens: 2, premiumWinStreak: 3, lastTokenConsumption: new Date().toISOString(), autoValidation: false },
  { id: 'f5', name: 'Emma Leroy', email: 'emma@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', premiumTokens: 10, premiumWinStreak: 25, lastTokenConsumption: new Date().toISOString(), autoValidation: true }
];

const initialLists: TaskList[] = [
  { id: 'work', name: 'Travail', taskIds: ['1', '2', '4', '5', '8', '11', '13', '15'], color: 'blue' },
  { id: 'personal', name: 'Personnel', taskIds: ['3', '6', '14'], color: 'purple' },
  { id: 'urgent', name: 'Urgent', taskIds: ['4', '13', '15'], color: 'red' },
];

const defaultUser: User = {
  id: 'user1',
  name: 'Utilisateur Demo',
  email: 'demo@cosmo.app',
  premiumTokens: 3,
  premiumWinStreak: 5,
  lastTokenConsumption: new Date().toISOString(),
  autoValidation: false,
};

const generatePastCompletions = (startDaysAgo: number, completionRate: number) => {
  const completions: { [date: string]: boolean } = {};
  const today = new Date();
  for (let i = 0; i < startDaysAgo; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (Math.random() < completionRate) {
      completions[`${year}-${month}-${day}`] = true;
    }
  }
  return completions;
};

const calculateStreak = (completions: { [date: string]: boolean }) => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    if (completions[dateStr]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const initialHabits: Habit[] = (() => {
  const habits = [
    { id: '1', name: 'Lecture 30 min', estimatedTime: 30, completions: generatePastCompletions(90, 0.85), streak: 0, color: '#3B82F6', createdAt: '2025-04-01T00:00:00.000Z' },
    { id: '2', name: 'Méditation', estimatedTime: 15, completions: generatePastCompletions(120, 0.7), streak: 0, color: '#8B5CF6', createdAt: '2025-03-01T00:00:00.000Z' },
    { id: '3', name: 'Sport matinal', estimatedTime: 45, completions: generatePastCompletions(180, 0.6), streak: 0, color: '#10B981', createdAt: '2025-01-15T00:00:00.000Z' },
    { id: '4', name: 'Veille technique', estimatedTime: 20, completions: generatePastCompletions(60, 0.9), streak: 0, color: '#F59E0B', createdAt: '2025-05-01T00:00:00.000Z' },
    { id: '5', name: 'Écriture journal', estimatedTime: 10, completions: generatePastCompletions(200, 0.75), streak: 0, color: '#EC4899', createdAt: '2024-12-01T00:00:00.000Z' },
    { id: '6', name: 'Étirements', estimatedTime: 10, completions: generatePastCompletions(150, 0.65), streak: 0, color: '#6366F1', createdAt: '2025-02-10T00:00:00.000Z' },
    { id: '7', name: 'Boire 2L d\'eau', estimatedTime: 5, completions: generatePastCompletions(300, 0.95), streak: 0, color: '#06B6D4', createdAt: '2024-10-01T00:00:00.000Z' },
    { id: '8', name: 'Apprendre une langue', estimatedTime: 15, completions: generatePastCompletions(45, 0.5), streak: 0, color: '#F97316', createdAt: '2025-05-15T00:00:00.000Z' },
    { id: '9', name: 'Sans réseaux sociaux', estimatedTime: 0, completions: generatePastCompletions(30, 0.4), streak: 0, color: '#EF4444', createdAt: '2025-06-01T00:00:00.000Z' },
    { id: '10', name: 'Cuisine saine', estimatedTime: 40, completions: generatePastCompletions(60, 0.8), streak: 0, color: '#84CC16', createdAt: '2025-05-01T00:00:00.000Z' }
  ];
  return habits.map(h => ({ ...h, streak: calculateStreak(h.completions) }));
})();

const initialOKRs: OKR[] = [
    {
    id: '1',
    title: 'Sport',
    description: 'améliorer ma santé',
    category: 'health',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    completed: false,
    estimatedTime: 1200,
    keyResults: [
        { id: '1-1', title: 'Faire 30 séances haut du corps', currentValue: 12, targetValue: 30, unit: 'séances', completed: false, estimatedTime: 60, history: [{ date: '2026-01-02', increment: 2 }, { date: '2026-01-05', increment: 3 }, { date: '2026-01-08', increment: 4 }, { date: '2026-01-12', increment: 3 }] },
        { id: '1-2', title: '10 séances bas du corps', currentValue: 4, targetValue: 10, unit: 'séances', completed: false, estimatedTime: 60, history: [{ date: '2026-01-03', increment: 2 }, { date: '2026-01-10', increment: 2 }] },
        { id: '1-3', title: '8 séances de cardio', currentValue: 3, targetValue: 8, unit: 'séances', completed: false, estimatedTime: 45, history: [{ date: '2026-01-04', increment: 1 }, { date: '2026-01-11', increment: 2 }] },
        { id: '1-4', title: "5 séances d'étirements", currentValue: 2, targetValue: 5, unit: 'séances', completed: false, estimatedTime: 15, history: [{ date: '2026-01-06', increment: 1 }, { date: '2026-01-13', increment: 1 }] }
      ],
  },
    {
      id: '2',
      title: 'Productivité',
      description: 'Être plus productif au quotidien',
      category: 'professional',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 2400,
      keyResults: [
        { id: '2-1', title: 'Planifier 30 journées de travail', currentValue: 10, targetValue: 30, unit: 'jours', completed: false, estimatedTime: 15 },
        { id: '2-2', title: 'Compléter 50 tâches prioritaires', currentValue: 25, targetValue: 50, unit: 'tâches', completed: false, estimatedTime: 30 },
        { id: '2-3', title: 'Réaliser 20 sessions de deep work', currentValue: 6, targetValue: 20, unit: 'sessions', completed: false, estimatedTime: 90 },
        { id: '2-4', title: 'Faire 12 revues hebdomadaires', currentValue: 3, targetValue: 12, unit: 'revues', completed: false, estimatedTime: 45 }
      ],
    },
    {
      id: '3',
      title: 'Apprentissage de l\'Anglais',
      description: 'Améliorer mon niveau d\'anglais (écoute, lecture, oral, vocabulaire et écriture)',
      category: 'learning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      completed: false,
      estimatedTime: 3000,
      keyResults: [
        { id: '3-1', title: 'Réaliser 40 sessions d’écoute en anglais (≥ 20 min)', currentValue: 15, targetValue: 40, unit: 'sessions', completed: false, estimatedTime: 20 },
        { id: '3-2', title: 'Effectuer 30 sessions de lecture en anglais', currentValue: 8, targetValue: 30, unit: 'sessions', completed: false, estimatedTime: 15 },
        { id: '3-3', title: 'Compléter 25 sessions de pratique orale', currentValue: 5, targetValue: 25, unit: 'sessions', completed: false, estimatedTime: 15 },
        { id: '3-4', title: 'Apprendre 500 mots de vocabulaire', currentValue: 120, targetValue: 500, unit: 'mots', completed: false, estimatedTime: 1 },
        { id: '3-5', title: 'Écrire 20 textes courts en anglais', currentValue: 4, targetValue: 20, unit: 'textes', completed: false, estimatedTime: 15 }
        ],
      },
      {
        id: '4',
        title: 'Habitudes',
        description: 'Mettre en place de bonnes habitudes au quotidien',
        category: 'personal',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        completed: false,
        estimatedTime: 1825,
        keyResults: [
          { id: '4-1', title: 'Se lever à heure régulière 20 jours', currentValue: 12, targetValue: 20, unit: 'jours', completed: false, estimatedTime: 5 },
          { id: '4-2', title: 'Lire 15 sessions', currentValue: 6, targetValue: 15, unit: 'sessions', completed: false, estimatedTime: 30 },
          { id: '4-3', title: 'Marcher au moins 8 000 pas 20 jours', currentValue: 8, targetValue: 20, unit: 'jours', completed: false, estimatedTime: 45 },
          { id: '4-4', title: 'Limiter le temps d’écran 15 jours', currentValue: 5, targetValue: 15, unit: 'jours', completed: false, estimatedTime: 5 },
          { id: '4-5', title: 'Prendre du temps pour soi 20 fois (≥ 15 min)', currentValue: 10, targetValue: 20, unit: 'fois', completed: false, estimatedTime: 15 }
        ],
      }
    ];

const initialEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Sprint Planning', start: '2025-06-12T09:00:00.000Z', end: '2025-06-12T10:30:00.000Z', color: 'blue', taskId: '4' },
  { id: 'e2', title: 'Review Design', start: '2025-06-13T14:00:00.000Z', end: '2025-06-13T15:00:00.000Z', color: 'purple', taskId: '3' },
  { id: 'e3', title: 'Demo Client', start: '2025-06-14T11:00:00.000Z', end: '2025-06-14T12:00:00.000Z', color: 'blue', taskId: '7' },
  { id: 'e4', title: 'Audit Sécurité', start: '2025-06-15T10:00:00.000Z', end: '2025-06-15T12:00:00.000Z', color: 'red', taskId: '5' },
  { id: 'e5', title: 'Lunch Team', start: '2025-06-12T12:00:00.000Z', end: '2025-06-12T13:30:00.000Z', color: 'green', taskId: '' },
  { id: 'e6', title: 'Workshop OKR', start: '2025-06-16T15:00:00.000Z', end: '2025-06-16T17:00:00.000Z', color: 'orange', taskId: '' },
  ...Array.from({ length: 85 }).map((_, i) => {
    const baseDate = new Date('2025-06-01T00:00:00.000Z');
    const randomDay = Math.floor(Math.random() * 60); // Sur Juin et Juillet
    const startHour = 8 + Math.floor(Math.random() * 10);
    const durationMinutes = 30 + Math.floor(Math.random() * 150);
    
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + randomDay);
    startDate.setHours(startHour);
    startDate.setMinutes(Math.random() > 0.5 ? 30 : 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    const eventTitles = [
      'Sync Hebdo', 'Point Projet', 'Focus Deep Work', 'Appel Client', 
      'Review Design', 'Brainstorming Feature', 'Daily Standup', 'Lunch Networking',
      'One-on-One', 'Formation Interne', 'Audit Performance', 'Bug Bash',
      'Planning Sprint', 'Rétrospective', 'Démo Produit', 'Session de Pair Programming',
      'Mise à jour Roadmap', 'Check-in Ventes', 'Café équipe', 'Réflexion Stratégique',
      'Analyse Métriques', 'QA Session', 'Préparation Board', 'Interview Candidat'
    ];
    
    return {
      id: `e-bulk-${i}`,
      title: eventTitles[i % eventTitles.length],
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      color: ['blue', 'red', 'green', 'purple', 'orange', 'okr'][Math.floor(Math.random() * 6)],
      taskId: ''
    };
  })
];

const initialCategories: Category[] = [
  { id: 'red', name: 'Haute Priorité', color: '#EF4444' },
  { id: 'blue', name: 'Travail', color: '#3B82F6' },
  { id: 'green', name: 'Santé', color: '#10B981' },
  { id: 'purple', name: 'Personnel', color: '#8B5CF6' },
  { id: 'orange', name: 'Stratégique', color: '#F59E0B' },
  { id: 'okr', name: 'Objectifs', color: '#6366F1' },
];

const initialOKRCategories: OKRCategory[] = [
  { id: 'personal', name: 'Personnel', color: 'blue', icon: '👤' },
  { id: 'professional', name: 'Professionnel', color: 'green', icon: '💼' },
  { id: 'health', name: 'Santé', color: 'red', icon: '❤️' },
  { id: 'learning', name: 'Apprentissage', color: 'purple', icon: '📚' },
];

const initialMessages: Message[] = [
  { id: 'm1', senderId: 'marie-dupont', receiverId: 'equipe-design', content: 'Salut l\'équipe ! Avez-vous vu les derniers retours sur la maquette ?', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: true },
  { id: 'm2', senderId: 'thomas-laurent', receiverId: 'equipe-design', content: 'Oui, je suis en train de les intégrer. Ça devrait être prêt pour demain.', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), read: true },
  { id: 'm3', senderId: 'user1', receiverId: 'equipe-design', content: 'Super Thomas ! J\'ai aussi ajouté quelques notes sur le Design Système.', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), read: true },
  { id: 'm4', senderId: 'marie-dupont', receiverId: 'equipe-design', content: 'Parfait, on fait un point rapide à 14h ?', timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), read: true },
  { id: 'm5', senderId: 'thomas-laurent', receiverId: 'equipe-design', content: 'Ça me va pour 14h.', timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString(), read: true },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [lists, setLists] = useState<TaskList[]>(initialLists);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [okrs, setOkrs] = useState<OKR[]>(initialOKRs);
  const [okrCategories, setOkrCategories] = useState<OKRCategory[]>(initialOKRCategories);
  const [friends, setFriends] = useState<User[]>(initialFriends);
  const [priorityRange, setPriorityRange] = useState<[number, number]>([1, 5]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>(['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F97316', '#F59E0B', '#EC4899', '#6366F1']);

  const colorSettings: ColorSettings = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as ColorSettings);


  // Helper for formatting date as "YYYY-MM-DD" in local time
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

    useEffect(() => {
      const savedTasks = localStorage.getItem('tasks');
      const savedLists = localStorage.getItem('taskLists');
      const savedEvents = localStorage.getItem('events');
      const savedCategories = localStorage.getItem('categories');
      const savedUser = localStorage.getItem('user');
      const savedHabits = localStorage.getItem('habits');
      const savedOKRs = localStorage.getItem('okrs');
      const savedOKRCategories = localStorage.getItem('okrCategories');
      const savedFavoriteColors = localStorage.getItem('favoriteColors');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLists) setLists(JSON.parse(savedLists));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      
      if (savedOKRs) {
        let parsedOKRs = JSON.parse(savedOKRs);
          // Force update for demo OKRs to ensure they reflect the new initial state
          parsedOKRs = parsedOKRs.map((o: any) => {
            const demoOKR = initialOKRs.find(demo => demo.id === o.id);
            if (demoOKR && ['1', '2', '3', '4'].includes(o.id)) {
              return demoOKR;
            }
            return o;
          });
        setOkrs(parsedOKRs);
      }
      
      if (savedOKRCategories) setOkrCategories(JSON.parse(savedOKRCategories));
      if (savedFavoriteColors) setFavoriteColors(JSON.parse(savedFavoriteColors));
    }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskLists', JSON.stringify(lists));
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('okrs', JSON.stringify(okrs));
    localStorage.setItem('okrCategories', JSON.stringify(okrCategories));
    localStorage.setItem('favoriteColors', JSON.stringify(favoriteColors));
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [tasks, lists, events, categories, user, habits, okrs, favoriteColors]);


  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setLists(prev => prev.map(l => ({ ...l, taskIds: l.taskIds.filter(tid => tid !== id) })));
  };
  const toggleBookmark = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, bookmarked: !t.bookmarked } : t));
  const toggleComplete = (id: string) => setTasks(prev => prev.map(t => {
    if (t.id === id) {
      const isCompleting = !t.completed;
      return { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : undefined };
    }
    return t;
  }));
  const updateTask = (id: string, updates: Partial<Task>) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const addList = (list: TaskList) => setLists(prev => [...prev, list]);
  const updateList = (id: string, updates: Partial<TaskList>) => setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  const addTaskToList = (taskId: string, listId: string) => setLists(prev => prev.map(l => l.id === listId && !l.taskIds.includes(taskId) ? { ...l, taskIds: [...l.taskIds, taskId] } : l));
  const removeTaskFromList = (taskId: string, listId: string) => setLists(prev => prev.map(l => l.id === listId ? { ...l, taskIds: l.taskIds.filter(id => id !== taskId) } : l));
  const deleteList = (id: string) => setLists(prev => prev.filter(l => l.id !== id));
  
  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...eventData, id: `event_${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
  };
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  
  const updateColorSettings = (colors: ColorSettings) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      name: colors[cat.id] || cat.name
    })));
  };

  const addCategory = (category: Category) => setCategories(prev => [...prev, category]);
  const updateCategory = (id: string, updates: Partial<Category>) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));

  const addOKRCategory = (category: OKRCategory) => setOkrCategories(prev => [...prev, category]);
  const updateOKRCategory = (id: string, updates: Partial<OKRCategory>) => setOkrCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const deleteOKRCategory = (id: string) => setOkrCategories(prev => prev.filter(c => c.id !== id));
  
    const markMessagesAsRead = () => {
      setMessages(prev => prev.map(msg => msg.receiverId === user?.id ? { ...msg, read: true } : msg));
    };
  
    const login = async (email: string, password: string) => {
    if (email === 'demo@cosmo.app' && password === 'demo') {
      setUser(defaultUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser: User = { ...defaultUser, id: Date.now().toString(), name, email };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const watchAd = () => {
    setUser(prev => prev ? { ...prev, premiumTokens: prev.premiumTokens + 1 } : null);
  };

  const consumePremiumToken = () => {
    setUser(prev => (prev && prev.premiumTokens > 0) ? { ...prev, premiumTokens: prev.premiumTokens - 1, lastTokenConsumption: new Date().toISOString() } : prev);
  };

  const isPremium = () => {
    if (!user) return false;
    if (user.subscriptionEndDate && new Date() <= new Date(user.subscriptionEndDate)) return true;
    return user.premiumTokens > 0;
  };

  const sendMessage = (receiverId: string, content: string, taskId?: string) => {
    const newMessage: Message = { 
      id: Date.now().toString(), 
      senderId: user?.id || 'user1', 
      receiverId, 
      content, 
      timestamp: new Date().toISOString(), 
      read: false,
      taskId
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendFriendRequest = (receiverId: string) => {
    const newRequest: FriendRequest = { id: Date.now().toString(), senderId: user?.id || 'user1', receiverId, status: 'pending', timestamp: new Date().toISOString() };
    setFriendRequests(prev => [...prev, newRequest]);
  };

  const acceptFriendRequest = (requestId: string) => setFriendRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
  const rejectFriendRequest = (requestId: string) => setFriendRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));

  const shareTask = (taskId: string, userId: string, permission: 'responsible' | 'editor' | 'observer') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isAlreadyCollaborator = t.collaborators?.includes(userId);
        if (!isAlreadyCollaborator) {
          sendMessage(userId, `Je t'ai partagé la tâche : ${t.name}`, taskId);
        }
        return { 
          ...t, 
          isCollaborative: true, 
          collaborators: isAlreadyCollaborator ? t.collaborators : [...(t.collaborators || []), userId], 
          permissions: permission 
        };
      }
      return t;
    }));
  };

  const addHabit = (habit: Habit) => setHabits(prev => [...prev, habit]);
  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions, [date]: !habit.completions[date] };
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dStr = getLocalDateString(d);
          if (newCompletions[dStr]) streak++; else break;
        }
        return { ...habit, completions: newCompletions, streak };
      }
      return habit;
    }));
  };
  const updateHabit = (id: string, updates: Partial<Habit>) => setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  const deleteHabit = (id: string) => setHabits(prev => prev.filter(h => h.id !== id));

  const addOKR = (okr: OKR) => {
    const newOKR = {
      ...okr,
      startDate: okr.startDate || getLocalDateString(new Date())
    };
    setOkrs(prev => [...prev, newOKR]);
  };
  const updateOKR = (id: string, updates: Partial<OKR>) => setOkrs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  const deleteOKR = (id: string) => setOkrs(prev => prev.filter(o => o.id !== id));
  
  const updateKeyResult = (okrId: string, keyResultId: string, updates: Partial<KeyResult>) => {
    setOkrs(prev => prev.map(okr => {
      if (okr.id === okrId) {
        return {
          ...okr,
          keyResults: okr.keyResults.map(kr => {
            if (kr.id === keyResultId) {
              const newHistory = [...(kr.history || [])];
              if (updates.currentValue !== undefined && updates.currentValue !== kr.currentValue) {
                newHistory.push({
                  date: getLocalDateString(new Date()),
                  increment: updates.currentValue - kr.currentValue
                });
              }
              return { ...kr, ...updates, history: newHistory };
            }
            return kr;
          })
        };
      }
      return okr;
    }));
  };

  const updateUserSettings = (updates: Partial<User>) => setUser(prev => prev ? { ...prev, ...updates } : null);

  const contextValue = {
    tasks, lists, events, colorSettings, categories, priorityRange, searchTerm, selectedCategories,
    user, messages, friendRequests, habits, okrs, okrCategories, friends, favoriteColors, setFavoriteColors,
    addTask, deleteTask, toggleBookmark, toggleComplete, updateTask,
    addList, addTaskToList, removeTaskFromList, deleteList, updateList,
    addEvent, deleteEvent, updateEvent, updateColorSettings,
    setPriorityRange, setSearchTerm, setSelectedCategories,
    login, register, logout, watchAd, consumePremiumToken, isPremium,
    sendMessage, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, shareTask,
    addHabit, toggleHabitCompletion, updateHabit, deleteHabit,
    addOKR, updateOKR, updateKeyResult, deleteOKR, updateUserSettings,
    addCategory, updateCategory, deleteCategory,
    addOKRCategory, updateOKRCategory, deleteOKRCategory,
    markMessagesAsRead
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};

