import React from 'react';
import { useHostel } from '../context/HostelContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { students, rooms, payments, complaints } = useHostel();

  // --- Stats Calculation ---
  const totalStudents = students.length;
  
  // Boys Hostel Stats
  const boysRooms = rooms.filter(r => r.building === 'Boys Hostel');
  const boysCapacity = boysRooms.reduce((acc, r) => acc + r.capacity, 0);
  const boysOccupied = boysRooms.reduce((acc, r) => acc + r.occupied, 0);
  const boysAvailable = boysCapacity - boysOccupied;
  
  // Girls Hostel Stats
  const girlsRooms = rooms.filter(r => r.building === 'Girls Hostel');
  const girlsCapacity = girlsRooms.reduce((acc, r) => acc + r.capacity, 0);
  const girlsOccupied = girlsRooms.reduce((acc, r) => acc + r.occupied, 0);
  const girlsAvailable = girlsCapacity - girlsOccupied;

  // Total Stats
  const totalCapacity = boysCapacity + girlsCapacity;
  const totalOccupied = boysOccupied + girlsOccupied;
  const totalAvailable = totalCapacity - totalOccupied;
  
  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;

  // Mess Stats
  const paidPayments = payments.filter(p => p.status === 'Paid');
  const totalCollection = paidPayments.reduce((acc, p) => acc + p.amount, 0);
  const pendingFeeStudents = students.length - paidPayments.length; 

  // --- Chart Data Preparation ---
  const messChartData = [
    { name: 'Paid', value: paidPayments.length },
    { name: 'Pending', value: pendingFeeStudents > 0 ? pendingFeeStudents : 0 },
  ];
  const MESS_COLORS = ['#10b981', '#ef4444'];
  
  const occupancyData = [
      { name: 'Boys Hostel', Allotted: boysOccupied, Available: boysAvailable, Capacity: boysCapacity },
      { name: 'Girls Hostel', Allotted: girlsOccupied, Available: girlsAvailable, Capacity: girlsCapacity },
  ];

  const complaintCounts = complaints.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complaintChartData = Object.keys(complaintCounts).map(category => ({
    name: category,
    count: complaintCounts[category]
  }));
  
  ['Maintenance', 'Food', 'Discipline', 'Other'].forEach(cat => {
    if (!complaintCounts[cat]) complaintChartData.push({ name: cat, count: 0 });
  });

  const subcategoryCounts = complaints.reduce((acc, curr) => {
    const key = curr.subcategory || 'Unspecified';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subcategoryChartData = Object.entries(subcategoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 6);

  // --- Authority Details (GCOEN HAC Structure) ---
  const authorities = [
    { role: 'Chairperson (Principal)', name: 'Dr. R.P. Borkar', contact: 'principal@gcoen.ac.in', bg: 'bg-indigo-50 text-indigo-700', icon: 'account_balance' },
    { role: 'Warden (Boys)', name: 'Prof. S.K. Deshpande', contact: '+91 98765 11223', bg: 'bg-blue-50 text-blue-700', icon: 'admin_panel_settings' },
    { role: 'Warden (Girls)', name: 'Prof. A.M. Sharma', contact: '+91 98765 44556', bg: 'bg-pink-50 text-pink-700', icon: 'admin_panel_settings' },
    { role: 'Rector', name: 'Dr. N.D. Ghawghawe', contact: '+91 98765 77889', bg: 'bg-orange-50 text-orange-700', icon: 'supervisor_account' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">GCOEN Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Hostel Administration Committee (HAC) Overview.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-icons-round text-sm">calendar_today</span>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Authority Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {authorities.map((auth, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className={`p-3 rounded-full ${auth.bg}`}>
                    <span className="material-icons-round">{auth.icon}</span>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{auth.role}</p>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{auth.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className="material-icons-round text-[10px]">call</span> {auth.contact}
                    </p>
                </div>
            </div>
        ))}
        {/* Fee Structure Summary */}
        <div className="bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-700 flex flex-col justify-center">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                <span className="text-xs text-slate-400 uppercase">Mess Fee</span>
                <span className="text-sm font-bold text-emerald-400">₹2,500/mo</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase">Hostel Fee</span>
                <span className="text-sm font-bold text-violet-400">₹5,050/yr</span>
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-blue-100 text-sm font-medium">Total Capacity</p>
                    <h3 className="text-3xl font-bold mt-1">{totalCapacity}</h3>
                </div>
                <span className="material-icons-round bg-white/20 p-2 rounded-lg">apartment</span>
            </div>
            <div className="mt-4 text-xs text-blue-100 bg-blue-800/30 inline-block px-2 py-1 rounded">
                Boys (184) + Girls (98)
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Rooms Available</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{totalAvailable}</h3>
                </div>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg">
                     <span className="material-icons-round">meeting_room</span>
                </div>
            </div>
            <div className="mt-4 flex gap-2 text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Boys: {boysAvailable}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-pink-600 dark:text-pink-400 font-medium">Girls: {girlsAvailable}</span>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mess Collection</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">₹{(totalCollection / 1000).toFixed(1)}k</h3>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg">
                     <span className="material-icons-round">payments</span>
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
                {pendingFeeStudents} students pending
            </div>
        </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Open Complaints</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{pendingComplaints}</h3>
                </div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-lg">
                     <span className="material-icons-round">report_problem</span>
                </div>
            </div>
            <div className="mt-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
                Needs Attention
            </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Room Occupancy</h3>
                    <p className="text-xs text-slate-400">Allotted vs Available by Building</p>
                </div>
            </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#1e293b' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Allotted" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Allotted" />
                <Bar dataKey="Available" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Mess Fee Status</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly Collection Progress</p>
          <div className="flex-1 min-h-[200px] relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={messChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {messChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MESS_COLORS[index % MESS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalStudents > 0 ? Math.round((paidPayments.length / totalStudents) * 100) : 0}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Collected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Complaint Categories</h3>
                <p className="text-xs text-slate-400">Frequency by Type</p>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complaintChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 500}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} name="Total Complaints" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Top Reported Issues</h3>
                <p className="text-xs text-slate-400">Subcategory Breakdown</p>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={subcategoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} name="Issue Count" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;