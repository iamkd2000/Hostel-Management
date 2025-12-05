
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Mess from './pages/Mess';
import Complaints from './pages/Complaints';
import AdminApplications from './pages/AdminApplications';
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import AiAssistant from './components/AiAssistant';
import { HostelProvider } from './context/HostelContext';
import { PageView } from './types';

// Wrapper component to handle internal auth state while accessing context
const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: 'admin' | 'student'; id?: number } | null>(null);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Dark Mode Effect
  React.useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Login Handler
  const handleLogin = (role: 'admin' | 'student', id?: number) => {
    setCurrentUser({ role, id });
    if (role === 'admin') setCurrentPage('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  // Auth Guard
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Student View
  if (currentUser.role === 'student' && currentUser.id) {
    return <StudentPortal studentId={currentUser.id} onLogout={handleLogout} />;
  }

  // Admin View
  const renderAdminPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'mess': return <Mess />;
      case 'complaints': return <Complaints />;
      case 'applications': return <AdminApplications />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <Sidebar 
          activePage={currentPage} 
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsMobileMenuOpen(false);
          }} 
          isOpen={isMobileMenuOpen}
          onLogout={handleLogout}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-20 sticky top-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center">
                    <span className="material-icons-round text-white text-sm">apartment</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white">SmartHostel Admin</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <span className="material-icons-round">menu</span>
            </button>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {renderAdminPage()}
            </div>
          </div>

          {/* Theme Toggle (Floating) */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 transition-transform hover:scale-105"
            title="Toggle Dark Mode"
          >
            <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* AI Chatbot Widget (Available to Admin) */}
          <AiAssistant />
        </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HostelProvider>
      <AppContent />
    </HostelProvider>
  );
};

export default App;
