
import React, { useState } from 'react';
import { useHostel } from '../context/HostelContext';

const Complaints: React.FC = () => {
  const { students, complaints, addComplaint, resolveComplaint } = useHostel();
  const [activeTab, setActiveTab] = useState<'View' | 'Submit'>('View');
  
  // Subcategory Data Mapping
  const subcategories: Record<string, string[]> = {
    'Maintenance': ['Fan', 'Light/Electric', 'Plumbing/Water', 'Furniture', 'AC/Cooler', 'Cleaning'],
    'Food': ['Quality/Taste', 'Hygiene', 'Quantity', 'Timings', 'Menu Issue'],
    'Discipline': ['Noise', 'Fighting', 'Ragging', 'Theft', 'Late Entry', 'Alcohol/Smoking'],
    'Other': ['Wi-Fi/Internet', 'Medical', 'Staff Behavior', 'Water Supply', 'Miscellaneous']
  };

  // Form State
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [subcategory, setSubcategory] = useState(subcategories['Maintenance'][0]);
  const [studentId, setStudentId] = useState('');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setCategory(newCat);
    setSubcategory(subcategories[newCat][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint({
        studentId: parseInt(studentId),
        category: category as any,
        subcategory: subcategory,
        description: desc
    });
    alert("Complaint submitted.");
    setDesc('');
    // Reset to default
    setCategory('Maintenance');
    setSubcategory(subcategories['Maintenance'][0]);
    setActiveTab('View');
  };

  const getStudentName = (id: number) => {
    return students.find(s => s.id === id)?.name || 'Unknown Student';
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Grievance Redressal</h1>
            <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('View')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'View' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    All Complaints
                </button>
                <button 
                    onClick={() => setActiveTab('Submit')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Submit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    New Complaint
                </button>
            </div>
        </div>

        {activeTab === 'Submit' ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Submit a Grievance</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">I am Student (Select Name)</label>
                        <select 
                            required 
                            value={studentId} 
                            onChange={e => setStudentId(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="">-- Select --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select 
                                value={category} 
                                onChange={handleCategoryChange}
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {Object.keys(subcategories).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Subcategory</label>
                            <select 
                                value={subcategory} 
                                onChange={e => setSubcategory(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {subcategories[category].map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                         <textarea 
                            required
                            rows={4}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Describe the issue in detail..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-200">
                        Submit Complaint
                    </button>
                </form>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
                {complaints.map(complaint => (
                    <div key={complaint.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-blue-200 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    complaint.category === 'Maintenance' ? 'bg-orange-100 text-orange-700' :
                                    complaint.category === 'Food' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                    {complaint.category}
                                </span>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                                    {complaint.subcategory}
                                </span>
                                <span className="text-xs text-slate-400">• {complaint.date}</span>
                            </div>
                            <p className="text-slate-800 font-medium text-lg">{complaint.description}</p>
                            <p className="text-slate-500 text-sm mt-1">Reported by: <span className="text-slate-700 font-semibold">{getStudentName(complaint.studentId)}</span></p>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            {complaint.status === 'Resolved' ? (
                                <div className="flex items-center gap-2 text-green-600 font-bold px-4 py-2 bg-green-50 rounded-lg">
                                    <span className="material-icons-round">check_circle</span>
                                    Resolved
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-lg text-sm">Pending Action</span>
                                    <button 
                                        onClick={() => resolveComplaint(complaint.id)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
                                    >
                                        Mark Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {complaints.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <span className="material-icons-round text-4xl mb-2">thumb_up</span>
                        <p>No complaints found!</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Complaints;
