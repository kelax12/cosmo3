import React, { createContext, useContext, useState, useEffect } from 'react';

export type Task = {
  id: string;
  name: string;
  priority: number;
  category: 'red' | 'blue' | 'green' | 'purple' | 'orange';
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
  red: string;
  blue: string;
  green: string;
  purple: string;
  orange: string;
  okr: string;
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
  sendMessage: (receiverId: string, content: string) => void;
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
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'finir onbpaa 1',
    priority: 5,
    category: 'blue',
    deadline: '2025-06-13T00:00:00.000Z',
    estimatedTime: 30,
    createdAt: '2025-05-29T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-25T10:00:00.000Z'
  },
  {
    id: '2',
    name: 'Ficher ONBPAA 2',
    priority: 4,
    category: 'blue',
    deadline: '2025-06-13T00:00:00.000Z',
    estimatedTime: 60,
    createdAt: '2025-05-29T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-24T14:30:00.000Z'
  },
  {
    id: '3',
    name: 'Réviser LM',
    priority: 2,
    category: 'red',
    deadline: '2025-06-13T00:00:00.000Z',
    estimatedTime: 45,
    createdAt: '2025-05-29T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-23T09:15:00.000Z'
  },
  {
    id: 't-past-1',
    name: 'Analyse de texte 1',
    priority: 3,
    category: 'green',
    deadline: '2025-12-20T00:00:00.000Z',
    estimatedTime: 90,
    createdAt: '2025-12-15T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-22T16:00:00.000Z'
  },
  {
    id: 't-past-2',
    name: 'Dissertation entraînement',
    priority: 5,
    category: 'orange',
    deadline: '2025-12-20T00:00:00.000Z',
    estimatedTime: 120,
    createdAt: '2025-12-15T00:00:00.000Z',
    bookmarked: true,
    completed: true,
    completedAt: '2025-12-21T11:00:00.000Z'
  },
  {
    id: 't-past-3',
    name: 'Lecture critique',
    priority: 1,
    category: 'purple',
    deadline: '2025-12-20T00:00:00.000Z',
    estimatedTime: 40,
    createdAt: '2025-12-15T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-20T18:00:00.000Z'
  },
  {
    id: 't-past-4',
    name: 'Vocabulaire soutenu',
    priority: 2,
    category: 'blue',
    deadline: '2025-12-20T00:00:00.000Z',
    estimatedTime: 25,
    createdAt: '2025-12-15T00:00:00.000Z',
    bookmarked: false,
    completed: true,
    completedAt: '2025-12-19T08:30:00.000Z'
  },
  {
    id: 't-demo-1',
    name: 'Préparer la réunion de projet',
    priority: 4,
    category: 'blue',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    estimatedTime: 60,
    createdAt: new Date().toISOString(),
    bookmarked: true,
    completed: false
  },
  {
    id: 't-demo-2',
    name: 'Acheter des fournitures de bureau',
    priority: 2,
    category: 'green',
    deadline: new Date(Date.now() + 172800000).toISOString(),
    estimatedTime: 30,
    createdAt: new Date().toISOString(),
    bookmarked: false,
    completed: false
  },
  {
    id: 't-demo-3',
    name: 'Finaliser le rapport annuel',
    priority: 5,
    category: 'red',
    deadline: new Date(Date.now() + 259200000).toISOString(),
    estimatedTime: 120,
    createdAt: new Date().toISOString(),
    bookmarked: false,
    completed: false
  }
];

const initialFriends: User[] = [
  {
    id: 'f1',
    name: 'Alice Martin',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    premiumTokens: 0,
    premiumWinStreak: 0,
    lastTokenConsumption: new Date().toISOString(),
    autoValidation: false,
  },
  {
    id: 'f2',
    name: 'Thomas Bernard',
    email: 'thomas@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    premiumTokens: 0,
    premiumWinStreak: 0,
    lastTokenConsumption: new Date().toISOString(),
    autoValidation: false,
  }
];

const initialLists: TaskList[] = [
  { id: 'jeudi', name: 'Jeudi', taskIds: [], color: 'blue' },
  { id: 'vendredi', name: 'Vendredi', taskIds: [], color: 'red' },
];

const defaultColorSettings: ColorSettings = {
  red: 'Réviser textes',
  blue: 'Texte à fichées',
  green: 'Apprendre textes',
  purple: 'Autres taches',
  orange: 'Entrainement dissert',
  okr: 'Tâches depuis OKR',
};

const defaultUser: User = {
  id: 'user1',
  name: 'Utilisateur Demo',
  email: 'demo@cosmo.app',
  premiumTokens: 3,
  premiumWinStreak: 5,
  lastTokenConsumption: new Date().toISOString(),
  autoValidation: false,
};

const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Lire 30 minutes',
    estimatedTime: 30,
    completions: {
      '2025-12-25': true,
      '2025-12-24': true,
      '2025-12-23': true,
      '2025-12-22': true,
      '2025-12-21': true,
      '2025-12-19': true,
      '2025-12-18': true,
    },
    streak: 5,
    color: 'blue',
    createdAt: '2025-12-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Méditation',
    estimatedTime: 15,
    completions: {
      '2025-12-25': true,
      '2025-12-24': true,
      '2025-12-22': true,
      '2025-12-20': true,
    },
    streak: 2,
    color: 'purple',
    createdAt: '2025-12-01T00:00:00.000Z',
  }
];

const initialOKRs: OKR[] = [
  {
    id: '1',
    title: 'Améliorer mes compétences en français',
    description: 'Développer une maîtrise approfondie de la littérature française',
    category: 'learning',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    completed: false,
    estimatedTime: 180,
    keyResults: [
      {
        id: '1-1',
        title: 'Ficher 20 textes littéraires',
        currentValue: 12,
        targetValue: 20,
        unit: 'textes',
        completed: false,
        estimatedTime: 60,
        history: [
          { date: '2025-12-10', increment: 8 },
          { date: '2025-12-18', increment: 2 },
          { date: '2025-12-22', increment: 1 },
          { date: '2025-12-25', increment: 1 }
        ]
      }
    ],
  },
];

const initialEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Révision Français',
    start: '2025-12-25T09:00:00.000Z',
    end: '2025-12-25T11:00:00.000Z',
    color: 'red',
    taskId: '3'
  },
  {
    id: 'e2',
    title: 'Cours de littérature',
    start: '2025-12-23T14:00:00.000Z',
    end: '2025-12-23T16:00:00.000Z',
    color: 'blue',
    taskId: '1'
  },
  {
    id: 'e3',
    title: 'Atelier écriture',
    start: '2025-12-21T10:00:00.000Z',
    end: '2025-12-21T12:00:00.000Z',
    color: 'orange',
    taskId: 't-past-2'
  }
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [lists, setLists] = useState<TaskList[]>(initialLists);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [colorSettings, setColorSettings] = useState<ColorSettings>(defaultColorSettings);
  const [user, setUser] = useState<User | null>(defaultUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [okrs, setOkrs] = useState<OKR[]>(initialOKRs);
  const [friends, setFriends] = useState<User[]>(initialFriends);
  const [priorityRange, setPriorityRange] = useState<[number, number]>([1, 5]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>(['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F97316', '#F59E0B', '#EC4899', '#6366F1']);

  const categories: Category[] = Object.entries(colorSettings).map(([id, name]) => ({
    id,
    name,
    color: id === 'red' ? '#EF4444' : 
           id === 'blue' ? '#3B82F6' : 
           id === 'green' ? '#10B981' : 
           id === 'purple' ? '#8B5CF6' : 
           id === 'orange' ? '#F59E0B' :
           id === 'okr' ? '#6366F1' : '#9CA3AF'
  }));

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
    const savedColorSettings = localStorage.getItem('colorSettings');
    const savedUser = localStorage.getItem('user');
    const savedHabits = localStorage.getItem('habits');
      const savedOKRs = localStorage.getItem('okrs');
      const savedFavoriteColors = localStorage.getItem('favoriteColors');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLists) setLists(JSON.parse(savedLists));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedColorSettings) setColorSettings(JSON.parse(savedColorSettings));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedOKRs) setOkrs(JSON.parse(savedOKRs));
      if (savedFavoriteColors) setFavoriteColors(JSON.parse(savedFavoriteColors));
    }, []);

    useEffect(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('taskLists', JSON.stringify(lists));
      localStorage.setItem('events', JSON.stringify(events));
      localStorage.setItem('colorSettings', JSON.stringify(colorSettings));
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('okrs', JSON.stringify(okrs));
      localStorage.setItem('favoriteColors', JSON.stringify(favoriteColors));
      if (user) localStorage.setItem('user', JSON.stringify(user));
    }, [tasks, lists, events, colorSettings, user, habits, okrs, favoriteColors]);


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
  const updateColorSettings = (colors: ColorSettings) => setColorSettings(colors);

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

  const sendMessage = (receiverId: string, content: string) => {
    const newMessage: Message = { id: Date.now().toString(), senderId: user?.id || '', receiverId, content, timestamp: new Date().toISOString(), read: false };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendFriendRequest = (receiverId: string) => {
    const newRequest: FriendRequest = { id: Date.now().toString(), senderId: user?.id || '', receiverId, status: 'pending', timestamp: new Date().toISOString() };
    setFriendRequests(prev => [...prev, newRequest]);
  };

  const acceptFriendRequest = (requestId: string) => setFriendRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
  const rejectFriendRequest = (requestId: string) => setFriendRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));

  const shareTask = (taskId: string, userId: string, permission: 'responsible' | 'editor' | 'observer') => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCollaborative: true, collaborators: [...(t.collaborators || []), userId], permissions: permission } : t));
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

  const addOKR = (okr: OKR) => setOkrs(prev => [...prev, okr]);
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
              if (updates.currentValue !== undefined && updates.currentValue > kr.currentValue) {
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
    user, messages, friendRequests, habits, okrs, friends, favoriteColors, setFavoriteColors,
    addTask, deleteTask, toggleBookmark, toggleComplete, updateTask,
    addList, addTaskToList, removeTaskFromList, deleteList, updateList,
    addEvent, deleteEvent, updateEvent, updateColorSettings,
    setPriorityRange, setSearchTerm, setSelectedCategories,
    login, register, logout, watchAd, consumePremiumToken, isPremium,
    sendMessage, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, shareTask,
    addHabit, toggleHabitCompletion, updateHabit, deleteHabit,
    addOKR, updateOKR, updateKeyResult, deleteOKR, updateUserSettings
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
