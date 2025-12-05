
import React, { useState } from 'react';
import { useHostel } from '../context/HostelContext';
import { Student, Room } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Students: React.FC = () => {
  const { students, rooms, addStudent, deleteStudent, allocateRoom } = useHostel();
  const [showModal, setShowModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Allocation State
  const [allocStudentId, setAllocStudentId] = useState('');
  const [allocRoom, setAllocRoom] = useState('');

  // Room Details Modal State
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    branch: '',
    year: '',
    bloodGroup: '',
    caste: '',
    contact: '',
    email: '',
    permanentAddress: '',
    temporaryAddress: '',
    parentName: '',
    parentContact: '',
    roomNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    profilePhoto: ''
  });

  // Filter rooms logic
  const availableRoomsForReg = rooms.filter(r => {
    const hasSpace = r.occupied < r.capacity;
    const matchesGender = formData.gender === 'Male' 
        ? r.building === 'Boys Hostel' 
        : r.building === 'Girls Hostel';
    return hasSpace && matchesGender;
  });

  // Logic for Allocation Modal filtering
  const selectedAllocStudent = students.find(s => s.id === parseInt(allocStudentId));
  const availableRoomsForAllocation = rooms.filter(r => {
      if (!selectedAllocStudent) return false;
      const matchesGender = selectedAllocStudent.gender === 'Male' ? r.building === 'Boys Hostel' : r.building === 'Girls Hostel';
      return matchesGender && r.occupied < r.capacity;
  });

  const unallocatedStudents = students.filter(s => !s.roomNumber);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, profilePhoto: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(formData);
    setShowModal(false);
    // Reset form
    setFormData({
      name: '',
      gender: 'Male',
      branch: '',
      year: '',
      bloodGroup: '',
      caste: '',
      contact: '',
      email: '',
      permanentAddress: '',
      temporaryAddress: '',
      parentName: '',
      parentContact: '',
      roomNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      profilePhoto: ''
    });
  };

  const handleDelete = (id: number) => {
      if (confirm("Are you sure you want to delete this student profile? This action cannot be undone.")) {
          deleteStudent(id);
      }
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(allocStudentId && allocRoom) {
          allocateRoom(parseInt(allocStudentId), allocRoom);
          setShowAllocateModal(false);
          setAllocStudentId('');
          setAllocRoom('');
      }
  };

  const handleGenerateId = (student: Student) => {
    setSelectedStudent(student);
    setShowIdModal(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent) return;
    setIsDownloading(true);
    const element = document.getElementById('print-area');
    if (element) {
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Better resolution
                useCORS: true, // Ensure images load
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            
            // ID Card standard size approx 85.6mm x 54mm
            // But our design is vertical. Let's use standard A4 or just fit image
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Center on A4
            const x = (210 - 100) / 2; // 100mm wide card on A4
            
            pdf.addImage(imgData, 'PNG', x, 20, 100, (imgProps.height * 100) / imgProps.width);
            pdf.save(`GCOEN_ID_${selectedStudent.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF Generation failed", err);
            alert("Failed to generate PDF. Please try again.");
        }
    }
    setIsDownloading(false);
  };

  const getValidTill = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDisplayRoom = (roomNum: string | null) => {
      if (!roomNum) return 'N/A';
      return roomNum.replace('B-', '').replace('G-', '');
  };

  // Helper to get occupants for detail modal
  const getRoomOccupants = (roomNumber: string) => {
      return students.filter(s => s.roomNumber === roomNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Management</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Admissions, room allocation & ID cards for GCOEN.</p>
        </div>
        <div className="flex gap-3">
            <button 
            onClick={() => setShowAllocateModal(true)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
            <span className="material-icons-round text-sm">meeting_room</span>
            Allocate Room
            </button>
            <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
            <span className="material-icons-round text-sm">add</span>
            Register Student
            </button>
        </div>
      </div>

      {/* GCOEN Rules Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-1">Important Rules (Policy 2025-26)</h3>
          <div className="flex flex-wrap gap-6 text-sm text-amber-700 dark:text-amber-300">
             <div className="flex items-center gap-1">
                <span className="material-icons-round text-sm">access_time_filled</span>
                <span><strong>Curfew:</strong> Boys 10:30 PM | Girls 7:30 PM</span>
             </div>
             <div className="flex items-center gap-1">
                <span className="material-icons-round text-sm">volume_off</span>
                <span><strong>Silence Hours:</strong> 9:00 PM - 6:00 AM</span>
             </div>
              <div className="flex items-center gap-1">
                <span className="material-icons-round text-sm">groups</span>
                <span><strong>Visitors:</strong> 8 AM - 8 PM (Common Areas)</span>
             </div>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name / Details</th>
                <th className="p-4 font-semibold">Gender</th>
                <th className="p-4 font-semibold">Room / Building</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student) => {
                const room = rooms.find(r => r.roomNumber === student.roomNumber);
                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300 text-sm">
                    <td className="p-4">#{student.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                          {student.profilePhoto ? (
                              <img src={student.profilePhoto} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                  <span className="material-icons-round">person</span>
                              </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 mt-0.5">
                                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{student.branch}</span>
                                <span>•</span>
                                <span>{student.year} Year</span>
                                {student.bloodGroup && (
                                    <>
                                    <span>•</span>
                                    <span className="text-red-500 font-medium">{student.bloodGroup}</span>
                                    </>
                                )}
                            </div>
                          </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.gender === 'Male' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'}`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="p-4">
                      {student.roomNumber ? (
                          <div className="flex flex-col">
                              <span className="font-medium text-slate-900 dark:text-white">Room {getDisplayRoom(student.roomNumber)}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{room?.building || 'Unknown'}</span>
                          </div>
                      ) : (
                          <span className="text-red-500 italic">Unallocated</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span>{student.contact}</span>
                        <span className="text-xs text-slate-400">{student.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleGenerateId(student)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                title="Generate ID Card"
                            >
                                <span className="material-icons-round">badge</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(student.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Delete Student"
                            >
                                <span className="material-icons-round">delete</span>
                            </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Allocate Room</h2>
                    <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-600">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                <form onSubmit={handleAllocateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Student (Unallocated)</label>
                        <select 
                            required 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                            value={allocStudentId}
                            onChange={e => {
                                setAllocStudentId(e.target.value);
                                setAllocRoom(''); // Reset room if student changes (gender might change)
                            }}
                        >
                            <option value="">-- Select Student --</option>
                            {unallocatedStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>
                            ))}
                        </select>
                    </div>
                    
                    {allocStudentId && (
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Select Available Room</label>
                            {availableRoomsForAllocation.length === 0 ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                                    No available rooms for {selectedAllocStudent?.gender}s.
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                    {availableRoomsForAllocation.map(r => (
                                        <div 
                                            key={r.roomNumber} 
                                            className={`flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${allocRoom === r.roomNumber ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                            onClick={() => setAllocRoom(r.roomNumber)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="radio" 
                                                    name="room" 
                                                    value={r.roomNumber} 
                                                    checked={allocRoom === r.roomNumber}
                                                    onChange={() => setAllocRoom(r.roomNumber)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white text-sm">Room {getDisplayRoom(r.roomNumber)}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.type} • {r.capacity - r.occupied} Spot{r.capacity - r.occupied > 1 ? 's' : ''} Left</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setViewingRoom(r);
                                                }}
                                                className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                title="View Room Occupants"
                                            >
                                                <span className="material-icons-round text-lg">visibility</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={!allocStudentId || !allocRoom}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Allocation
                    </button>
                </form>
             </div>
        </div>
      )}

      {/* Room Occupants Details Modal */}
      {viewingRoom && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingRoom(null)}>
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Room {getDisplayRoom(viewingRoom.roomNumber)}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{viewingRoom.building} • {viewingRoom.type}</p>
                      </div>
                      <button onClick={() => setViewingRoom(null)} className="text-slate-400 hover:text-slate-600">
                          <span className="material-icons-round">close</span>
                      </button>
                  </div>
                  
                  <div className="mb-4">
                       <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                           <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(viewingRoom.occupied / viewingRoom.capacity) * 100}%` }}
                           ></div>
                       </div>
                       <p className="text-xs text-right text-slate-500 dark:text-slate-400">
                           {viewingRoom.occupied} / {viewingRoom.capacity} Occupied
                       </p>
                  </div>

                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Occupants</h4>
                  <div className="space-y-2">
                      {getRoomOccupants(viewingRoom.roomNumber).length > 0 ? (
                          getRoomOccupants(viewingRoom.roomNumber).map(s => (
                              <div key={s.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                  {s.profilePhoto ? (
                                      <img src={s.profilePhoto} className="w-8 h-8 rounded-full object-cover" alt={s.name} />
                                  ) : (
                                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                          <span className="material-icons-round text-xs text-slate-400">person</span>
                                      </div>
                                  )}
                                  <div>
                                      <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.branch} - {s.year}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-4 text-slate-400 text-sm italic">
                              Room is currently empty.
                          </div>
                      )}
                  </div>
                  
                  {viewingRoom.facilities && viewingRoom.facilities.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-1">
                              {viewingRoom.facilities.map((f, i) => (
                                  <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
                                      {f}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* ID Card Modal - GCOEN Specific */}
      {showIdModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full relative animate-fade-in-up my-auto">
                <button 
                    onClick={() => setShowIdModal(false)}
                    className="absolute top-2 right-2 z-10 bg-black/20 text-white hover:bg-black/40 rounded-full p-1 transition-colors no-print"
                >
                    <span className="material-icons-round">close</span>
                </button>
                
                {/* Printable ID Card Area */}
                <div id="print-area" className="w-[350px] mx-auto bg-white border border-slate-200 shadow-lg overflow-hidden m-8 relative rounded-xl">
                    {/* Header */}
                    <div className={`${selectedStudent.gender === 'Male' ? 'bg-[#0f172a]' : 'bg-[#be123c]'} text-white text-center p-4`}>
                        <h2 className="font-bold text-lg leading-tight uppercase tracking-wide">Government College of Engineering</h2>
                        <p className="text-xs font-medium opacity-90 mt-1">NAGPUR</p>
                        <div className="mt-2 pt-2 border-t border-white/20">
                             <p className="text-sm font-bold">{selectedStudent.gender === 'Male' ? 'BOYS' : 'GIRLS'} HOSTEL</p>
                             <p className="text-[10px] tracking-widest opacity-75">NEW KHAPRI CAMPUS</p>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 bg-white relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                             <span className="material-icons-round text-9xl">account_balance</span>
                        </div>

                        <div className="flex gap-4 items-start relative z-10">
                            <div className="w-24 h-28 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {selectedStudent.profilePhoto ? (
                                    <img src={selectedStudent.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <span className="material-icons-round text-4xl text-slate-300">person</span>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-1">
                                <h3 className="font-bold text-lg text-slate-900 leading-tight uppercase">{selectedStudent.name}</h3>
                                <p className="text-xs font-semibold text-slate-500 uppercase">{selectedStudent.branch} • {selectedStudent.year} Year</p>
                                <div className="pt-2">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                                    <span className="text-sm font-bold text-red-600">{selectedStudent.bloodGroup || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-2 relative z-10">
                            <div className="border-b border-slate-100 pb-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Room No</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {getDisplayRoom(selectedStudent.roomNumber)}
                                </span>
                            </div>
                             <div className="border-b border-slate-100 pb-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Valid Till</span>
                                <span className="text-sm font-bold text-slate-800">{getValidTill(selectedStudent.admissionDate)}</span>
                            </div>
                             <div className="border-b border-slate-100 pb-1 col-span-2">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile No</span>
                                <span className="text-sm font-medium text-slate-800">{selectedStudent.contact}</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-end">
                             <div>
                                 <p className="text-[8px] text-slate-400 font-bold">Emergency Contact</p>
                                 <p className="text-[10px] font-medium text-slate-600">{selectedStudent.parentContact}</p>
                             </div>
                             <div className="text-center">
                                 {/* Signature Placeholder */}
                                 <div className="h-8 w-16 mb-1 flex items-end justify-center">
                                     <span className="font-cursive text-xs text-blue-800 italic">Warden</span>
                                 </div>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase">Warden Signature</p>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-4 flex justify-center gap-4 border-t border-slate-100 no-print">
                     <button 
                        onClick={() => setShowIdModal(false)}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons-round text-sm">arrow_back</span>
                        Back
                    </button>
                     <button 
                        onClick={handleDownloadPDF} 
                        disabled={isDownloading}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <span className="material-icons-round text-sm animate-spin">refresh</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round text-sm">download</span>
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Admission Registration</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                    <span className="material-icons-round">close</span>
                </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 0: Photo Upload */}
                <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                             {formData.profilePhoto ? (
                                 <img src={formData.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                 <span className="material-icons-round text-slate-400 text-3xl">add_a_photo</span>
                             )}
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Upload Profile Photo</span>
                    </div>
                </div>

                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Name</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="gender" checked={formData.gender === 'Male'} onChange={() => {
                                setFormData({...formData, gender: 'Male', roomNumber: ''}); 
                            }} className="text-blue-600 focus:ring-blue-500"/>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="gender" checked={formData.gender === 'Female'} onChange={() => {
                                setFormData({...formData, gender: 'Female', roomNumber: ''});
                            }} className="text-pink-600 focus:ring-pink-500"/>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Female</span>
                        </label>
                      </div>
                   </div>
                </div>

                {/* Row 2: Academic Info */}
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                      <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})}>
                         <option value="">-- Select --</option>
                         <option value="CSE">Computer Science (CSE)</option>
                         <option value="ECE">Electronics (ECE)</option>
                         <option value="ME">Mechanical (ME)</option>
                         <option value="CE">Civil (CE)</option>
                         <option value="EE">Electrical (EE)</option>
                         <option value="Other">Other</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                      <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                         <option value="">-- Select --</option>
                         <option value="1st">1st Year</option>
                         <option value="2nd">2nd Year</option>
                         <option value="3rd">3rd Year</option>
                         <option value="4th">4th Year</option>
                         <option value="M.Tech">M.Tech</option>
                      </select>
                   </div>
                </div>

                {/* Row 3: Personal Info */}
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                      <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                         <option value="">-- Select --</option>
                         <option value="A+">A+</option>
                         <option value="A-">A-</option>
                         <option value="B+">B+</option>
                         <option value="B-">B-</option>
                         <option value="O+">O+</option>
                         <option value="O-">O-</option>
                         <option value="AB+">AB+</option>
                         <option value="AB-">AB-</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Caste / Category</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} placeholder="e.g., General, OBC, SC/ST" />
                   </div>
                </div>

                {/* Row 4: Contact & Date */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Mobile No.</label>
                      <input required type="tel" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Email ID</label>
                      <input required type="email" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@gcoen.ac.in" />
                  </div>
                </div>

                {/* Row 5: Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Permanent Address</label>
                        <textarea required rows={3} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} placeholder="Enter permanent home address"></textarea>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Address</label>
                        <textarea required rows={3} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        value={formData.temporaryAddress} onChange={e => setFormData({...formData, temporaryAddress: e.target.value})} placeholder="Enter local guardian or temp address"></textarea>
                    </div>
                </div>
                
                {/* Row 6: Parent Details */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Parent Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Name</label>
                            <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none" 
                            value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Mobile Number</label>
                            <input required type="tel" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none" 
                            value={formData.parentContact} onChange={e => setFormData({...formData, parentContact: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Row 7: Admission Date & Room Allocation */}
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Admission Date</label>
                        <input required type="date" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Room (Optional)</label>
                      <select 
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                          value={formData.roomNumber}
                          onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                      >
                          <option value="">Select a room later</option>
                          {availableRoomsForReg.map(room => (
                              <option key={room.roomNumber} value={room.roomNumber}>
                                  {getDisplayRoom(room.roomNumber)} - {room.type} ({room.capacity - room.occupied} slots left)
                              </option>
                          ))}
                      </select>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                  Complete Registration
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;