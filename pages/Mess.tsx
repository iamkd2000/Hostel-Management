
import React, { useState } from 'react';
import { useHostel } from '../context/HostelContext';

const Mess: React.FC = () => {
  const { students, payments, recordPayment, verifyPayment, rejectPayment } = useHostel();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [amount, setAmount] = useState('2500');
  const [method, setMethod] = useState<'Online' | 'Cash'>('Online');
  const [activeTab, setActiveTab] = useState<'Manage' | 'Verify'>('Manage');
  const [viewProof, setViewProof] = useState<string | null>(null);

  // Filter payments that need verification: Status Pending AND (has TransactionID OR ProofURL)
  const pendingVerifications = payments.filter(p => p.status === 'Pending' && (p.transactionId || p.proofUrl));

  // Helpers
  const getPaymentStatus = (studentId: number) => {
    const payment = payments.find(p => p.studentId === studentId && p.month === '2024-03' && p.feeType === 'Mess');
    return payment ? payment.status : 'Pending';
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const studentId = parseInt(selectedStudent);
    // Check if already paid to avoid dupes in mock
    const exists = payments.find(p => p.studentId === studentId && p.month === '2024-03' && p.feeType === 'Mess' && p.status === 'Paid');
    if(exists) {
        alert("Already paid for this month");
        return;
    }

    recordPayment({
        studentId,
        amount: parseFloat(amount),
        feeType: 'Mess',
        month: '2024-03',
        status: 'Paid',
        paymentMethod: method,
        date: new Date().toISOString().split('T')[0]
    });
    
    alert("Payment recorded successfully!");
    setSelectedStudent('');
    setAmount('2500');
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mess & Fee Management</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage fee collection and verify student payments.</p>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('Manage')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Manage' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    Record & View
                </button>
                <button 
                    onClick={() => setActiveTab('Verify')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Verify' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'} flex items-center gap-2`}
                >
                    Verify Requests
                    {pendingVerifications.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingVerifications.length}</span>
                    )}
                </button>
            </div>
        </div>

        {/* Fee Info Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    <span className="material-icons-round text-emerald-600 dark:text-emerald-400">restaurant</span>
                </div>
                <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Monthly Mess Fee</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹2,500 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ student</span></p>
                </div>
            </div>
            <div className="hidden md:block text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Billing Cycle</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">March 2024</p>
            </div>
        </div>

        {activeTab === 'Verify' ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Pending Payment Approvals</h3>
                {pendingVerifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                        <span className="material-icons-round text-4xl mb-2">check_circle</span>
                        <p>No pending payments to verify.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingVerifications.map(p => {
                            const student = students.find(s => s.id === p.studentId);
                            return (
                                <div key={p.id} className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800 dark:text-white">{student?.name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                {p.feeType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Amount: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{p.amount}</span> • Date: {p.date}</p>
                                        <div className="mt-2 text-xs space-y-1">
                                            {p.transactionId && <p className="text-blue-600 dark:text-blue-400 font-mono">TXN: {p.transactionId}</p>}
                                            {p.payerName && <p className="text-slate-500 dark:text-slate-400">Payer: {p.payerName}</p>}
                                            {p.proofUrl && (
                                                <button onClick={() => setViewProof(p.proofUrl!)} className="text-blue-500 hover:underline flex items-center gap-1">
                                                    <span className="material-icons-round text-[14px]">visibility</span> View Proof
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => {
                                                if(confirm('Reject this payment?')) rejectPayment(p.id, "Invalid Proof or Transaction ID");
                                            }}
                                            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => verifyPayment(p.id)}
                                            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Form */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-blue-600">payments</span>
                        Manual Fee Entry
                    </h2>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                value={selectedStudent}
                                onChange={e => setSelectedStudent(e.target.value)}
                                required
                            >
                                <option value="">-- Select --</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (Room {s.roomNumber || 'N/A'})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="method" checked={method === 'Online'} onChange={() => setMethod('Online')} className="text-blue-600 focus:ring-blue-500"/>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Online</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="method" checked={method === 'Cash'} onChange={() => setMethod('Cash')} className="text-blue-600 focus:ring-blue-500"/>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Cash</span>
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors">
                            Mark as Paid
                        </button>
                    </form>
                </div>

                {/* Status Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Fee Status (March 2024)</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white dark:bg-slate-900 shadow-sm">
                                <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase">
                                    <th className="p-4 font-medium">Student</th>
                                    <th className="p-4 font-medium">Room</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {students.map(student => {
                                    const status = getPaymentStatus(student.id);
                                    const isPaid = status === 'Paid';
                                    const isRejected = status === 'Rejected';

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm text-slate-700 dark:text-slate-300">
                                            <td className="p-4 font-medium">{student.name}</td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400">{student.roomNumber || '-'}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                                    isRejected ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {!isPaid && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedStudent(student.id.toString());
                                                            setAmount('2500');
                                                        }}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                                                    >
                                                        Quick Pay
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        
        {/* Proof Viewer Modal */}
        {viewProof && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewProof(null)}>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl max-w-3xl max-h-[90vh] overflow-auto relative shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full p-2 transition-colors" onClick={() => setViewProof(null)}>
                        <span className="material-icons-round">close</span>
                    </button>
                    {viewProof.startsWith('data:') ? (
                        <img src={viewProof} alt="Payment Proof" className="max-w-full h-auto rounded-lg" />
                    ) : (
                        <div className="p-12 text-center">
                            <span className="material-icons-round text-6xl text-slate-300 dark:text-slate-600 mb-4">description</span>
                            <p className="font-mono text-lg text-slate-700 dark:text-slate-200 mb-2">{viewProof}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Preview not available for this file type in mock mode.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Mess;
