import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    onClick?: () => void;
    active?: boolean;
  }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-white/70 mb-4">
      <Home className="w-4 h-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`transition-colors duration-200 ${
              item.active 
                ? 'text-white font-medium' 
                : item.onClick 
                  ? 'hover:text-white cursor-pointer' 
                  : 'cursor-default'
            }`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;