
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Student, Room, MessPayment, Complaint, Application, HostelContextType, ApplicationStatus } from '../types';
import { INITIAL_STUDENTS, INITIAL_ROOMS, INITIAL_PAYMENTS, INITIAL_COMPLAINTS, INITIAL_APPLICATIONS } from '../services/mockDatabase';

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [payments, setPayments] = useState<MessPayment[]>(INITIAL_PAYMENTS);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: Date.now() };
    setStudents(prev => [...prev, newStudent]);
    
    // If room allocated immediately
    if (studentData.roomNumber) {
        allocateRoom(newStudent.id, studentData.roomNumber);
    }
  };

  const deleteStudent = (id: number) => {
      const student = students.find(s => s.id === id);
      
      // If student has a room, decrease occupancy
      if (student && student.roomNumber) {
          setRooms(prev => prev.map(r => {
              if (r.roomNumber === student.roomNumber) {
                  return { ...r, occupied: Math.max(0, r.occupied - 1) };
              }
              return r;
          }));
      }

      setStudents(prev => prev.filter(s => s.id !== id));
      // Optionally remove related complaints/payments, but keeping them for history is usually better
  };

  const allocateRoom = (studentId: number, roomNumber: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, roomNumber } : s));
    
    // Update room occupancy
    setRooms(prev => prev.map(r => {
        if (r.roomNumber === roomNumber) return { ...r, occupied: r.occupied + 1 };
        return r;
    }));
  };

  const recordPayment = (paymentData: Omit<MessPayment, 'id'>) => {
    // Check if payment exists for this month/type to avoid duplicates
    const exists = payments.find(p => 
        p.studentId === paymentData.studentId && 
        p.feeType === paymentData.feeType && 
        p.month === paymentData.month
    );
    
    if (exists) {
        updatePayment(exists.id, paymentData);
    } else {
        const newPayment: MessPayment = { ...paymentData, id: Date.now() };
        setPayments(prev => [...prev, newPayment]);
    }
  };

  const updatePayment = (id: number, updates: Partial<MessPayment>) => {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const verifyPayment = (id: number) => {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid' } : p));
  };

  const rejectPayment = (id: number, reason: string) => {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected', rejectionReason: reason } : p));
  };

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'status' | 'date'>) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: Date.now(),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const resolveComplaint = (id: number) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
  };

  const submitApplication = (appData: Omit<Application, 'id' | 'status' | 'date'>) => {
      const newApp: Application = {
          ...appData,
          id: Date.now(),
          status: 'Pending',
          date: new Date().toISOString().split('T')[0]
      };
      setApplications(prev => [newApp, ...prev]);
  };

  const updateApplicationStatus = (id: number, status: ApplicationStatus, reason?: string) => {
      // If approving a Profile Update, apply changes to student
      if (status === 'Approved') {
          const app = applications.find(a => a.id === id);
          if (app && app.type === 'ProfileUpdate' && app.data) {
              setStudents(prev => prev.map(s => {
                  if (s.id === app.studentId) {
                      // Merge the new data into the student object
                      return { ...s, ...app.data };
                  }
                  return s;
              }));
          }
      }

      setApplications(prev => prev.map(a => {
          if (a.id === id) {
              return { 
                  ...a, 
                  status, 
                  rejectionReason: status === 'Rejected' ? reason : undefined 
              };
          }
          return a;
      }));
  };

  return (
    <HostelContext.Provider value={{ 
        students, rooms, payments, complaints, applications,
        addStudent, deleteStudent, allocateRoom, recordPayment, updatePayment, verifyPayment, rejectPayment, 
        addComplaint, resolveComplaint, 
        submitApplication, updateApplicationStatus 
    }}>
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};