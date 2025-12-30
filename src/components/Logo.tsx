import React from 'react';
import { Target } from 'lucide-react';

interface LogoProps {
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ showText = true }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl transition-colors shrink-0" style={{ backgroundColor: 'rgb(var(--nav-item-active-bg))', color: 'rgb(var(--nav-item-active-text))' }}>
        <Target size={20} />
      </div>
        {showText && (
          <div className="overflow-hidden transition-all duration-300 whitespace-nowrap">
            <span className="text-xl font-bold block" style={{ color: 'rgb(var(--color-text-primary))' }}>Cosmo</span>
          </div>
        )}
    </div>
  );
};

export default Logo;
