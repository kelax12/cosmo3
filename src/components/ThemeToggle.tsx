import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useDarkMode();

  const getThemeIcon = (currentTheme: Theme) => {
    if (currentTheme === 'dark') {
      return <Moon size={20} className="text-blue-400" />;
    }
    return <Sun size={20} className="text-yellow-500" />;
  };

  const getThemeLabel = (currentTheme: Theme) => {
    return currentTheme === 'dark' ? 'Mode sombre' : 'Mode clair';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${className}`}
      aria-label={`Changer le thème (actuellement ${getThemeLabel(theme)})`}
      title={`Changer le thème (actuellement ${getThemeLabel(theme)})`}
    >
      <div className="flex items-center gap-2">
        {getThemeIcon(theme)}
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getThemeLabel(theme)}
          </span>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
