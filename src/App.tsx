import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import AgendaPage from './pages/AgendaPage';
import OKRPage from './pages/OKRPage';
import HabitsPage from './pages/HabitsPage';
import StatisticsPage from './pages/StatisticsPage';
import MessagingPage from './pages/MessagingPage';
import PremiumPage from './pages/PremiumPage';
import SettingsPage from './pages/SettingsPage';
import { TaskProvider, useTasks } from './context/TaskContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

function AppContent() {
  const { user } = useTasks();

  // Si l'utilisateur n'est pas connecté, afficher la landing page
  if (!user) {
    return <LandingPage />;
  }

  // Si l'utilisateur est connecté, afficher l'application avec redirection automatique vers le dashboard
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="okr" element={<OKRPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="messaging" element={<MessagingPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TaskProvider>
      <TooltipProvider>
        <Toaster />
        <HoverReceiver />
        <AppContent />
      </TooltipProvider>
    </TaskProvider>
  </QueryClientProvider>
);

export default App;
