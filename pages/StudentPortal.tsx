
import React, { useState, useEffect } from 'react';
import { useHostel } from '../context/HostelContext';
import { Student, Application } from '../types';

interface StudentPortalProps {
  studentId: number;
  onLogout: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ studentId, onLogout }) => {
  const { students, rooms, payments, complaints, applications, addComplaint, submitApplication, recordPayment } = useHostel();
  const [activeView, setActiveView] = useState<'home' | 'fees' | 'complaint' | 'applications' | 'profile'>('home');

  const student = students.find(s => s.id === studentId);
  
  // Redirect or handle logout if student not found (deleted/invalid)
  if (!student) return <div className="p-10 text-center text-red-500">Student not found. Please log out.</div>;

  const room = rooms.find(r => r.roomNumber === student.roomNumber);
  const myComplaints = complaints.filter(c => c.studentId === studentId);
  const myApplications = applications.filter(a => a.studentId === studentId);
  
  // Payment Records
  const messPaymentRecord = payments.find(p => p.studentId === studentId && p.month === '2024-03' && p.feeType === 'Mess');
  const hostelPaymentRecord = payments.find(p => p.studentId === studentId && p.feeType === 'Hostel' && p.month === '2024');
  
  const messStatus = messPaymentRecord?.status || 'Pending';
  const hostelStatus = hostelPaymentRecord?.status || 'Pending';

  // Fee Logic
  const hostelFeeTotal = 5050;
  const messFeeMonthly = 2500;
  const isHostelPaid = hostelStatus === 'Paid';
  const isMessPaid = messStatus === 'Paid';

  // --- Forms State ---
  // Complaint
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [subcategory, setSubcategory] = useState('Fan');

  // Application (Letters)
  const [appType, setAppType] = useState('Leave');
  const [appTitle, setAppTitle] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appProof, setAppProof] = useState<File | null>(null);

  // Profile Edit
  const [editData, setEditData] = useState({
      contact: student.contact,
      email: student.email,
      permanentAddress: student.permanentAddress,
      temporaryAddress: student.temporaryAddress
  });

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payType, setPayType] = useState<'Mess' | 'Hostel'>('Mess');
  const [payAmount, setPayAmount] = useState(0);
  const [payMode, setPayMode] = useState<'Online' | 'Cash'>('Online');
  
  // Payment Details State
  const [txnId, setTxnId] = useState('');
  const [payerName, setPayerName] = useState(student.name);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Sync local state with student data when student data updates
  useEffect(() => {
    if (student) {
        setEditData({
            contact: student.contact,
            email: student.email,
            permanentAddress: student.permanentAddress,
            temporaryAddress: student.temporaryAddress
        });
    }
  }, [student]);

  const subcategories: Record<string, string[]> = {
    'Maintenance': ['Fan', 'Light/Electric', 'Plumbing/Water', 'Furniture', 'AC/Cooler', 'Cleaning'],
    'Food': ['Quality/Taste', 'Hygiene', 'Quantity', 'Timings', 'Menu Issue'],
    'Discipline': ['Noise', 'Fighting', 'Ragging', 'Theft', 'Late Entry', 'Alcohol/Smoking'],
    'Other': ['Wi-Fi/Internet', 'Medical', 'Staff Behavior', 'Water Supply', 'Miscellaneous']
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint({
        studentId: student.id,
        category: category as any,
        subcategory: subcategory,
        description: desc
    });
    alert("Complaint submitted successfully!");
    setDesc('');
    setActiveView('home');
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication({
        studentId: student.id,
        type: appType as any,
        title: appTitle,
        description: appDesc,
        proofUrl: appProof ? appProof.name : undefined
    });
    alert("Application submitted to Admin.");
    setAppTitle('');
    setAppDesc('');
    setAppProof(null);
    setActiveView('applications');
  };

  const handleSubmitProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (JSON.stringify(editData) === JSON.stringify({
        contact: student.contact,
        email: student.email,
        permanentAddress: student.permanentAddress,
        temporaryAddress: student.temporaryAddress
    })) {
        alert("No changes detected.");
        return;
    }

    submitApplication({
        studentId: student.id,
        type: 'ProfileUpdate',
        title: 'Profile Update Request',
        description: 'Requesting update for personal details.',
        data: editData
    });
    alert("Profile update request sent for verification.");
    setActiveView('home');
  };

  const openPaymentModal = (type: 'Mess' | 'Hostel', amount: number) => {
      setPayType(type);
      setPayAmount(amount);
      setTxnId(`TXN${Math.floor(Math.random() * 10000000)}`); // Pre-fill for demo convenience
      setShowPayModal(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 1. Check for Duplicate Transaction ID
      if (payMode === 'Online' && txnId) {
          const isDuplicate = payments.some(p => p.transactionId === txnId);
          if (isDuplicate) {
              alert("Error: This Transaction ID has already been used! Please check your details.");
              return;
          }
      }

      const processPayment = (proofBase64?: string) => {
        recordPayment({
            studentId: student.id,
            amount: payAmount,
            feeType: payType,
            month: payType === 'Mess' ? '2024-03' : '2024',
            status: 'Pending', // Always pending verification
            paymentMethod: payMode,
            date: payDate,
            transactionId: payMode === 'Online' ? txnId : undefined,
            payerName: payerName,
            proofUrl: proofBase64
        });

        alert("Payment verification request sent to Admin!");
        setShowPayModal(false);
        // Reset form
        setProofFile(null);
        setTxnId('');
      };

      // 2. Convert File to Base64 if exists
      if (proofFile) {
          const reader = new FileReader();
          reader.onloadend = () => {
              processPayment(reader.result as string);
          };
          reader.readAsDataURL(proofFile);
      } else {
          processPayment(undefined);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
         <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <span className="material-icons-round text-lg">school</span>
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 dark:text-white leading-tight">Student Portal</h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">GCOEN Hostel</p>
                </div>
            </div>
            <button onClick={onLogout} className="text-slate-500 dark:text-slate-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium transition-colors">
                <span className="material-icons-round text-lg">logout</span>
                Logout
            </button>
         </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 md:hidden z-30">
        {['home', 'fees', 'applications', 'profile'].map((view) => (
            <button 
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`flex flex-col items-center ${activeView === view ? 'text-blue-600' : 'text-slate-400'}`}
            >
                <span className="material-icons-round">{
                    view === 'home' ? 'dashboard' : 
                    view === 'fees' ? 'payments' :
                    view === 'applications' ? 'assignment' : 'person'
                }</span>
                <span className="text-[10px] capitalize mt-1">{view}</span>
            </button>
        ))}
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Desktop Nav Tabs */}
        <div className="hidden md:flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
            {['home', 'fees', 'applications', 'profile'].map((view) => (
                <button
                    key={view}
                    onClick={() => setActiveView(view as any)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeView === view 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
            ))}
        </div>

        {/* --- VIEW: HOME --- */}
        {activeView === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Profile Summary Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center text-4xl">
                             {student.profilePhoto ? (
                                 <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                             ) : (
                                 <span className="material-icons-round opacity-50">person</span>
                             )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{student.name}</h2>
                            <p className="text-slate-300 flex items-center gap-2 mt-1 text-sm">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{student.branch}</span>
                                <span>{student.year} Year</span>
                                <span className="text-blue-300">#{student.id}</span>
                            </p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Room</p>
                                    <p className="font-mono text-lg">{student.roomNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Building</p>
                                    <p className="text-sm">{room?.building || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                                    <p className="text-sm">{student.contact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setActiveView('complaint')} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex flex-col items-center gap-1">
                                <span className="material-icons-round">report_problem</span>
                                <span className="text-xs font-bold">Complaint</span>
                            </button>
                            <button onClick={() => setActiveView('applications')} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center gap-1">
                                <span className="material-icons-round">edit_note</span>
                                <span className="text-xs font-bold">Apply Leave</span>
                            </button>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Mess Status</p>
                            <p className={`text-lg font-bold ${messStatus === 'Paid' ? 'text-emerald-600' : messStatus === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                {messStatus}
                            </p>
                        </div>
                        {messStatus !== 'Paid' && (
                             <button onClick={() => setActiveView('fees')} className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg font-bold">Pay Now</button>
                        )}
                     </div>
                </div>
            </div>
        )}

        {/* --- VIEW: FEES --- */}
        {activeView === 'fees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {/* Mess Fee Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -mr-10 -mt-10 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-lg">
                                <span className="material-icons-round">restaurant</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Mess Fees</h3>
                        </div>
                        <div className="space-y-4">
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                 <span className="text-slate-500 dark:text-slate-400">Monthly Amount</span>
                                 <span className="font-bold text-slate-800 dark:text-white">₹{messFeeMonthly}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                 <span className="text-slate-500 dark:text-slate-400">Status (March)</span>
                                 <span className={`font-bold ${messStatus === 'Paid' ? 'text-emerald-500' : messStatus === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                     {messStatus}
                                 </span>
                             </div>
                             {messStatus === 'Rejected' && messPaymentRecord?.rejectionReason && (
                                 <div className="text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100">
                                     Reason: {messPaymentRecord.rejectionReason}
                                 </div>
                             )}
                             <button 
                                disabled={isMessPaid || messStatus === 'Pending'} 
                                onClick={() => openPaymentModal('Mess', messFeeMonthly)}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${isMessPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : messStatus === 'Pending' ? 'bg-amber-100 text-amber-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none'}`}
                             >
                                {isMessPaid ? 'Paid' : messStatus === 'Pending' ? 'Verification Pending' : `Pay ₹${messFeeMonthly}`}
                             </button>
                        </div>
                    </div>
                </div>

                {/* Hostel Fee Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 dark:bg-violet-900/20 rounded-full -mr-10 -mt-10 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900 text-violet-600 rounded-lg">
                                <span className="material-icons-round">bed</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Hostel Fees</h3>
                        </div>
                         <div className="space-y-4">
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                 <span className="text-slate-500 dark:text-slate-400">Annual Amount</span>
                                 <span className="font-bold text-slate-800 dark:text-white">₹{hostelFeeTotal}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                 <span className="text-slate-500 dark:text-slate-400">Status (2024)</span>
                                 <span className={`font-bold ${hostelStatus === 'Paid' ? 'text-emerald-500' : hostelStatus === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                     {hostelStatus}
                                 </span>
                             </div>
                             {hostelStatus === 'Rejected' && hostelPaymentRecord?.rejectionReason && (
                                 <div className="text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100">
                                     Reason: {hostelPaymentRecord.rejectionReason}
                                 </div>
                             )}
                             <button 
                                disabled={isHostelPaid || hostelStatus === 'Pending'}
                                onClick={() => openPaymentModal('Hostel', hostelFeeTotal)}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${isHostelPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : hostelStatus === 'Pending' ? 'bg-amber-100 text-amber-600 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-none'}`}
                             >
                                {isHostelPaid ? 'Paid' : hostelStatus === 'Pending' ? 'Verification Pending' : `Pay ₹${hostelFeeTotal}`}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW: APPLICATIONS --- */}
        {activeView === 'applications' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">New Application / Letter</h3>
                    <form onSubmit={handleSubmitApplication} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Type</label>
                                <select 
                                    value={appType} 
                                    onChange={e => setAppType(e.target.value)}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                                >
                                    <option value="Leave">Leave Application</option>
                                    <option value="Bonafide">Bonafide Request</option>
                                    <option value="Other">Other Request</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Sick Leave for 2 days"
                                    value={appTitle}
                                    onChange={e => setAppTitle(e.target.value)}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Content</label>
                            <textarea 
                                required
                                rows={4}
                                placeholder="Write your application here..."
                                value={appDesc}
                                onChange={e => setAppDesc(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Attach Proof (Optional)</label>
                            <input 
                                type="file" 
                                onChange={e => setProofFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
                            Submit Application
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Application History</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {myApplications.length > 0 ? myApplications.map(app => (
                            <div key={app.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{app.title} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({app.type})</span></h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{app.date}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{app.description}</p>
                                        {app.proofUrl && (
                                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">attach_file</span> 
                                                {app.proofUrl}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                                {app.status === 'Rejected' && app.rejectionReason && (
                                    <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-1">
                                            <span className="material-icons-round text-sm">info</span> Admin Feedback:
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1 ml-5">{app.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-400 text-sm">No applications found.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW: PROFILE --- */}
        {activeView === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in">
                <div className="mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit Profile Details</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Changes will be sent to the Admin for verification before updating.</p>
                </div>
                <form onSubmit={handleSubmitProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="opacity-50 pointer-events-none">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name (Locked)</label>
                            <input type="text" value={student.name} readOnly className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500" />
                        </div>
                        <div className="opacity-50 pointer-events-none">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Branch & Year (Locked)</label>
                            <input type="text" value={`${student.branch} - ${student.year}`} readOnly className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mobile Number</label>
                            <input required type="tel" value={editData.contact} onChange={e => setEditData({...editData, contact: e.target.value})} 
                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address</label>
                            <input required type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} 
                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Permanent Address</label>
                            <textarea required rows={2} value={editData.permanentAddress} onChange={e => setEditData({...editData, permanentAddress: e.target.value})} 
                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Temporary Address</label>
                            <textarea required rows={2} value={editData.temporaryAddress} onChange={e => setEditData({...editData, temporaryAddress: e.target.value})} 
                            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-purple-200 dark:shadow-none">
                            Request Profile Update
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* --- VIEW: COMPLAINT FORM --- */}
        {activeView === 'complaint' && (
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <div>
                         <h3 className="font-bold text-lg text-slate-800 dark:text-white">New Complaint</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Report an issue with facilities, food, or discipline.</p>
                    </div>
                    <button onClick={() => setActiveView('home')} className="text-slate-400 hover:text-slate-600">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                <div className="p-6 md:p-8 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmitComplaint} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Category</label>
                                <select 
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setSubcategory(subcategories[e.target.value][0]);
                                    }}
                                >
                                    {Object.keys(subcategories).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Issue Type</label>
                                <select 
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                    value={subcategory}
                                    onChange={(e) => setSubcategory(e.target.value)}
                                >
                                    {subcategories[category].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                            <textarea 
                                required
                                rows={5}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Please describe the problem in detail..."
                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition-transform active:scale-95">
                            Submit Report
                        </button>
                    </form>
                </div>
            </div>
        )}

      </main>

      {/* Payment Gateway Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up relative">
                 <button onClick={() => setShowPayModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <span className="material-icons-round">close</span>
                 </button>
                 
                 <div className="bg-slate-900 p-6 text-white">
                     <h3 className="text-lg font-bold">Secure Payment Gateway</h3>
                     <p className="text-sm text-slate-400">Complete your transaction</p>
                     <div className="mt-4 flex justify-between items-center bg-white/10 p-3 rounded-lg">
                         <span className="text-sm">Total Amount</span>
                         <span className="text-xl font-bold">₹{payAmount}</span>
                     </div>
                 </div>

                 <div className="p-6">
                     <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-1">
                         <button onClick={() => setPayMode('Online')} className={`flex-1 pb-2 text-sm font-bold transition-colors ${payMode === 'Online' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Online (UPI/Card)</button>
                         <button onClick={() => setPayMode('Cash')} className={`flex-1 pb-2 text-sm font-bold transition-colors ${payMode === 'Cash' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Cash / Receipt</button>
                     </div>

                     <form onSubmit={handlePaymentSubmit} className="space-y-4">
                         {payMode === 'Online' ? (
                             <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Payer Name</label>
                                    <input required type="text" value={payerName} onChange={e => setPayerName(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Transaction ID</label>
                                    <input required type="text" value={txnId} onChange={e => setTxnId(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Transaction Date</label>
                                    <input required type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none" />
                                </div>
                             </>
                         ) : (
                             <div className="text-center py-4 space-y-4">
                                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm">
                                     Please pay <strong>₹{payAmount}</strong> at the Hostel Office.
                                     <br/>Upload the receipt below once paid.
                                 </div>
                             </div>
                         )}

                         <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Upload Screenshot / Receipt</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => setProofFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                            />
                         </div>

                         <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none mt-4">
                             Confirm Payment & Submit
                         </button>
                     </form>
                 </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default StudentPortal;
