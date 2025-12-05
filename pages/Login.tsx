
import React, { useState } from 'react';
import { useHostel } from '../context/HostelContext';

interface LoginProps {
  onLogin: (role: 'admin' | 'student', id?: number) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { students } = useHostel();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  
  // Student Form State
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');

  // Admin Form State (Simulated)
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const id = parseInt(studentId);
    const student = students.find(s => s.id === id);

    if (student) {
      onLogin('student', id);
    } else {
      setError('Invalid Student ID. Please try again (e.g., 1, 2).');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Simple hardcoded check for prototype
    if (adminUser === 'admin' && adminPass === 'admin') {
      onLogin('admin');
    } else {
      setError('Invalid Admin Credentials (Try admin/admin)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center">
           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <span className="material-icons-round text-white text-3xl">apartment</span>
           </div>
           <h1 className="text-2xl font-bold text-white">SmartHostel</h1>
           <p className="text-slate-400 text-sm">Unified Management System</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => { setActiveTab('student'); setError(''); }}
             className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'student' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Student Login
           </button>
           <button 
             onClick={() => { setActiveTab('admin'); setError(''); }}
             className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Admin Login
           </button>
        </div>

        {/* Forms */}
        <div className="p-8">
            {error && (
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2 animate-pulse">
                  <span className="material-icons-round text-sm">error</span>
                  {error}
               </div>
            )}

            {activeTab === 'student' ? (
                <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student ID / Registration No.</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-3 top-3 text-slate-400">badge</span>
                            <input 
                                type="number" 
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Enter ID (e.g. 1)"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-1">Tip: Use '1' or '2' for demo.</p>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-200">
                        Login to Portal
                    </button>
                </form>
            ) : (
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-3 top-3 text-slate-400">person</span>
                            <input 
                                type="text" 
                                value={adminUser}
                                onChange={(e) => setAdminUser(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="admin"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-3 top-3 text-slate-400">lock</span>
                            <input 
                                type="password" 
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="admin"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-slate-200">
                        Access Dashboard
                    </button>
                </form>
            )}
        </div>
      </div>
      <div className="fixed bottom-4 text-center text-slate-400 text-xs">
         &copy; 2025 SmartHostel Systems. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
