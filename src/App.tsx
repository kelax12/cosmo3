import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
import { Toaster } from '@/components/ui/sonner';
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

function AppContent() {
  const { user } = useTasks();

  // Si l'utilisateur n'est pas connecté, afficher la landing page
  if (!user) {
    return <LandingPage />;
  }

  // Si l'utilisateur est connecté, afficher l'application
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

const App = () => (
  <TaskProvider>
    <Toaster />
    <HoverReceiver />
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </TaskProvider>
);

export default App;
