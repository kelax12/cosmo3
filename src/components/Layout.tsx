import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  CheckSquare, 
  Calendar, 
  Target, 
  BarChart2, 
  MessageCircle,
  Crown,
  Settings,
  Repeat,
  LogOut
} from 'lucide-react';
import Logo from './Logo';
import { useTasks } from '../context/TaskContext';
import ThemeToggle from './ThemeToggle';

const Layout: React.FC = () => {
  const { logout, user, messages } = useTasks();
  
  // Compter les messages non lus
  const unreadMessages = messages.filter(msg => !msg.read && msg.receiverId === user?.id).length;

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'rgb(var(--color-background))' }}>
      {/* Sidebar moderne et sobre */}
      <aside className="w-64 nav-container border-r flex flex-col">
        <div className="p-6 border-b" style={{ borderColor: 'rgb(var(--nav-border))' }}>
          <Logo />
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink 
            to="/" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            end
            aria-label="Accéder au tableau de bord"
          >
            <LayoutDashboard size={20} aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/tasks" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder à la liste des tâches"
          >
            <CheckSquare size={20} aria-hidden="true" />
            <span>To do list</span>
          </NavLink>
          
          <NavLink 
            to="/agenda" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder à l'agenda"
          >
            <Calendar size={20} aria-hidden="true" />
            <span>Agenda</span>
          </NavLink>
          
          <NavLink 
            to="/okr" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder aux objectifs OKR"
          >
            <Target size={20} aria-hidden="true" />
            <span>OKR</span>
          </NavLink>
          
          <NavLink 
            to="/habits" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder au suivi des habitudes"
          >
            <Repeat size={20} aria-hidden="true" />
            <span>Habitudes</span>
          </NavLink>
          
          <NavLink 
            to="/statistics" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder aux statistiques"
          >
            <BarChart2 size={20} aria-hidden="true" />
            <span>Statistiques</span>
          </NavLink>
        </nav>
        
        {/* Section Company */}
        <div className="border-t p-4" style={{ borderColor: 'rgb(var(--nav-border))' }}>
          <div className="text-xs font-semibold uppercase mb-4 px-2" style={{ color: 'rgb(var(--color-text-muted))' }}>COMPANY</div>
          
          <NavLink 
            to="/messaging" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label={`Accéder à la messagerie${unreadMessages > 0 ? ` - ${unreadMessages} messages non lus` : ''}`}
          >
            <div className="relative">
              <MessageCircle size={20} aria-hidden="true" />
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${unreadMessages} messages non lus`}>
                  {unreadMessages}
                </span>
              )}
            </div>
            <span>Messagerie</span>
          </NavLink>
          
          <NavLink 
            to="/premium" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder à Premium"
          >
            <Crown size={20} aria-hidden="true" />
            <span>Premium</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
            aria-label="Accéder aux paramètres"
          >
            <Settings size={20} aria-hidden="true" />
            <span>Paramètres</span>
          </NavLink>
          
          <button 
            onClick={logout}
            className="sidebar-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Se déconnecter"
          >
            <LogOut size={20} aria-hidden="true" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content moderne */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: 'rgb(var(--color-background))' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
