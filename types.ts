
export interface Student {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  branch: string;
  year: string;
  bloodGroup: string;
  caste: string;
  contact: string;
  email: string;
  permanentAddress: string;
  temporaryAddress: string;
  parentName: string;
  parentContact: string;
  roomNumber: string | null;
  admissionDate: string;
  profilePhoto?: string; // URL or Base64 string
}

export interface Room {
  roomNumber: string;
  building: 'Boys Hostel' | 'Girls Hostel';
  capacity: number;
  occupied: number;
  type: 'AC' | 'Non-AC';
  facilities: string[];
}

export interface MessPayment {
  id: number;
  studentId: number;
  amount: number;
  month: string; // YYYY-MM or YYYY for Hostel
  feeType: 'Mess' | 'Hostel';
  status: 'Paid' | 'Pending' | 'Rejected';
  paymentMethod?: 'Online' | 'Cash';
  date?: string;
  // New verification fields
  transactionId?: string;
  payerName?: string;
  proofUrl?: string; // Mock URL/Filename
  rejectionReason?: string;
}

export interface Complaint {
  id: number;
  studentId: number;
  category: 'Maintenance' | 'Food' | 'Discipline' | 'Other';
  subcategory: string;
  description: string;
  status: 'Pending' | 'Resolved';
  date: string;
}

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export type ApplicationType = 'ProfileUpdate' | 'Leave' | 'Bonafide' | 'Other';

export interface Application {
  id: number;
  studentId: number;
  type: ApplicationType;
  title: string;
  description: string;
  data?: Partial<Student>; // Contains the proposed changes for ProfileUpdate
  status: ApplicationStatus;
  rejectionReason?: string;
  proofUrl?: string; // Attachment for leave/medical proof
  date: string;
}

export type PageView = 'dashboard' | 'students' | 'mess' | 'complaints' | 'applications' | 'settings';

export interface HostelContextType {
  students: Student[];
  rooms: Room[];
  payments: MessPayment[];
  complaints: Complaint[];
  applications: Application[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (id: number) => void;
  allocateRoom: (studentId: number, roomNumber: string) => void;
  recordPayment: (payment: Omit<MessPayment, 'id'>) => void;
  updatePayment: (id: number, updates: Partial<MessPayment>) => void;
  verifyPayment: (id: number) => void;
  rejectPayment: (id: number, reason: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'date'>) => void;
  resolveComplaint: (id: number) => void;
  submitApplication: (app: Omit<Application, 'id' | 'status' | 'date'>) => void;
  updateApplicationStatus: (id: number, status: ApplicationStatus, reason?: string) => void;
}