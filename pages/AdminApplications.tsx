
import React, { useState } from 'react';
import { useHostel } from '../context/HostelContext';

const AdminApplications: React.FC = () => {
  const { applications, students, updateApplicationStatus } = useHostel();
  const [filter, setFilter] = useState<'Pending' | 'History'>('Pending');
  
  // State for rejection workflow
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredApps = applications.filter(app => 
    filter === 'Pending' ? app.status === 'Pending' : app.status !== 'Pending'
  );

  const getStudentName = (id: number) => students.find(s => s.id === id)?.name || 'Unknown';

  const handleRejectSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (rejectingId && rejectReason.trim()) {
          updateApplicationStatus(rejectingId, 'Rejected', rejectReason);
          setRejectingId(null);
          setRejectReason('');
      }
  };

  // Helper to compare old vs new data for profile updates
  const renderProfileDiff = (studentId: number, newData: any) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mt-2 text-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Requested Changes:</p>
            {Object.entries(newData).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 mb-1">
                    <div>
                        <span className="text-xs text-slate-400 block capitalize">{key.replace(/([A-Z])/g, ' $1')} (Old)</span>
                        <span className="text-slate-600 dark:text-slate-400 line-through">{(student as any)[key] || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-blue-500 block capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')} (New)</span>
                        <span className="text-slate-800 dark:text-white font-semibold">{value as string}</span>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Applications & Requests</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Review leave letters and profile update requests.</p>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                <button 
                    onClick={() => setFilter('Pending')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'Pending' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Pending
                </button>
                <button 
                    onClick={() => setFilter('History')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'History' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    History
                </button>
            </div>
        </div>

        <div className="space-y-4">
            {filteredApps.map(app => (
                <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    app.type === 'ProfileUpdate' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {app.type === 'ProfileUpdate' ? 'Profile Update' : app.type}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">• {app.date}</span>
                                {app.status !== 'Pending' && (
                                    <span className={`text-xs font-bold ${app.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                        {app.status}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{app.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Applicant: <span className="font-semibold text-slate-700 dark:text-slate-300">{getStudentName(app.studentId)}</span></p>
                            
                            <div className="mt-4">
                                <p className="text-slate-700 dark:text-slate-300 mb-2">{app.description}</p>
                                {app.type === 'ProfileUpdate' && app.data && renderProfileDiff(app.studentId, app.data)}
                                
                                {app.status === 'Rejected' && app.rejectionReason && (
                                    <div className="mt-3 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Rejection Reason:</p>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{app.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {app.status === 'Pending' && (
                            <div className="w-full md:w-auto">
                                {rejectingId === app.id ? (
                                    <form onSubmit={handleRejectSubmit} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in min-w-[300px]">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reason for Rejection</label>
                                        <textarea 
                                            required
                                            autoFocus
                                            rows={2}
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                            placeholder="Explain why this request is rejected..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                            >
                                                Confirm Reject
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex gap-3 shrink-0">
                                        <button 
                                            onClick={() => setRejectingId(app.id)}
                                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => updateApplicationStatus(app.id, 'Approved')}
                                            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-lg shadow-slate-200 dark:shadow-none transition-colors"
                                        >
                                            Approve Request
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {filteredApps.length === 0 && (
                 <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p>No applications found.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminApplications;
