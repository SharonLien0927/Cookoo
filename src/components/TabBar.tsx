import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Package, BookOpen, MessageCircle } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: '主頁' },
  { path: '/calendar', icon: Calendar, label: '菜單' },
  { path: '/ingredients', icon: Package, label: '食材' },
  { path: '/recipes', icon: BookOpen, label: '食譜' },
  { path: '/bot', icon: MessageCircle, label: 'Bot' },
];

export default function TabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

