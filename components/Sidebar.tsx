import React from 'react';
import { PageView } from '../types';

interface SidebarProps {
  activePage: PageView;
  onNavigate: (page: PageView) => void;
  isOpen: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, onLogout }) => {
  const navItems: { id: PageView; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'students', label: 'Students & Rooms', icon: 'school' },
    { id: 'mess', label: 'Mess & Fees', icon: 'restaurant_menu' },
    { id: 'complaints', label: 'Complaints', icon: 'report_problem' },
    { id: 'applications', label: 'Applications', icon: 'assignment' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 dark:bg-slate-950 text-white transition-transform duration-300 ease-in-out shadow-2xl
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative flex flex-col
    `}>
      <div className="p-6 border-b border-slate-800 dark:border-slate-900 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <span className="material-icons-round text-white">account_balance</span>
        </div>
        <div>
             <h1 className="font-bold text-lg tracking-tight">GCOEN Hostel</h1>
             <p className="text-xs text-slate-400 uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${activePage === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'}
            `}
          >
            <span className={`material-icons-round transition-colors ${activePage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 mb-4">
          {/* Toggle handled in App.tsx via wrapper props but simplified here for layout */}
      </div>

      <div className="p-4 border-t border-slate-800 dark:border-slate-900 shrink-0">
         <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-colors"
         >
            <span className="material-icons-round">logout</span>
            <span className="font-medium text-sm">Logout</span>
         </button>
      </div>

      <div className="p-6 pt-2">
        <div className="flex items-center gap-3 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                 <span className="material-icons-round text-xs">person</span>
            </div>
            <div className="text-xs">
                <p className="text-white font-medium">Warden Admin</p>
                <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;