import { Student, Room, MessPayment, Complaint, Application } from '../types';

// GCOEN Policy Context for AI
export const HOSTEL_POLICY_CONTEXT = `
  Institution: Government College of Engineering, Nagpur (GCOEN).
  Location: New Khapri, Nagpur.
  
  Hostel Structure:
  - Boys' Hostel: G+6 Floors, Capacity 184.
  - Girls' Hostel: G+3 Floors, Capacity 98.
  - Occupancy: Double occupancy (2 students per room).
  
  Rules & Regulations:
  - Silence Hours: 9:00 PM to 6:00 AM daily.
  - Curfew (In-Time): 
    - Boys: 10:30 PM (Biometric at 10:00 PM).
    - Girls: 7:30 PM (Biometric at 7:30 PM).
  - Visitors: 8:00 AM - 8:00 PM (Designated areas only, no room entry).
  - Prohibited: Electrical appliances (heaters, irons), pets, ragging (Zero Tolerance).
  
  Governance (HAC):
  - Chairperson: Principal
  - Members: Rector, Wardens, Student Council (21 members).
`;

// Generate Rooms dynamically based on GCOEN Policy
const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const standardFacilities = ["2 Beds", "2 Tables", "2 Chairs", "2 Almirahs", "1 Fan"];
  
  // Boys Hostel (G+6 = 7 Floors: 0 to 6)
  // Capacity 184 -> 92 Rooms.
  // 92 / 7 floors ≈ 13 rooms per floor (some 14)
  let boysRoomCount = 0;
  const boysTarget = 92;

  for (let f = 0; f <= 6; f++) {
    const roomsOnThisFloor = f === 0 ? 14 : 13; // Slight variation to hit exact target if needed
    for (let r = 1; r <= roomsOnThisFloor; r++) {
      if (boysRoomCount >= boysTarget) break;
      const floorPrefix = f === 0 ? 'G' : f.toString();
      const numberStr = `${floorPrefix}${r.toString().padStart(2, '0')}`;
      const roomNum = `B-${numberStr}`;
      rooms.push({
        roomNumber: roomNum,
        building: 'Boys Hostel',
        capacity: 2, 
        occupied: 0, 
        type: r % 5 === 0 ? 'AC' : 'Non-AC', // Hypothetical AC distribution
        facilities: standardFacilities
      });
      boysRoomCount++;
    }
  }

  // Girls Hostel (G+3 = 4 Floors: 0 to 3)
  // Capacity 98 -> 49 Rooms.
  // 49 / 4 floors ≈ 12 rooms per floor
  let girlsRoomCount = 0;
  const girlsTarget = 49;

  for (let f = 0; f <= 3; f++) {
    const roomsOnThisFloor = f === 0 ? 13 : 12;
    for (let r = 1; r <= roomsOnThisFloor; r++) {
      if (girlsRoomCount >= girlsTarget) break;
      const floorPrefix = f === 0 ? 'G' : f.toString();
      const numberStr = `${floorPrefix}${r.toString().padStart(2, '0')}`;
      const roomNum = `G-${numberStr}`;
      rooms.push({
        roomNumber: roomNum,
        building: 'Girls Hostel',
        capacity: 2,
        occupied: 0,
        type: r % 5 === 0 ? 'AC' : 'Non-AC',
        facilities: standardFacilities
      });
      girlsRoomCount++;
    }
  }
  return rooms;
};

export const INITIAL_ROOMS: Room[] = generateRooms();

// Helper to generate 500 dummy students
const generateMockStudents = (count: number, rooms: Room[]): Student[] => {
  const students: Student[] = [];
  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'O-', 'B-'];
  const castes = ['General', 'OBC', 'SC', 'ST', 'NT', 'VJ', 'SBC'];
  
  const firstNamesMale = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Rohan', 'Mohan', 'Suresh', 'Pranav', 'Kabir', 'Dhruv', 'Rudra'];
  const firstNamesFemale = ['Adbhut', 'Saanvi', 'Anya', 'Aadhya', 'Pari', 'Diya', 'Ananya', 'Myra', 'Riya', 'Meera', 'Ishita', 'Kavya', 'Aditi', 'Priya', 'Sneha', 'Tanvi', 'Shruti', 'Pooja', 'Neha'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patil', 'Deshmukh', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Das', 'Chopra', 'Wagh', 'Kale', 'Raut', 'Thakre', 'Bose', 'Iyer', 'Reddy'];

  // Separate rooms
  const boysRooms = rooms.filter(r => r.building === 'Boys Hostel');
  const girlsRooms = rooms.filter(r => r.building === 'Girls Hostel');
  
  let bRoomIdx = 0;
  let gRoomIdx = 0;

  for (let i = 1; i <= count; i++) {
    // Approx 65% Male to match capacity ratio (184 vs 98) roughly
    const isMale = Math.random() > 0.35; 
    const gender = isMale ? 'Male' : 'Female';
    const firstName = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)] 
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    let roomNum: string | null = null;

    // Try to allocate room sequentially until full
    if (isMale) {
        // Find next available room
        while (bRoomIdx < boysRooms.length && boysRooms[bRoomIdx].occupied >= boysRooms[bRoomIdx].capacity) {
            bRoomIdx++;
        }
        if (bRoomIdx < boysRooms.length) {
            const r = boysRooms[bRoomIdx];
            roomNum = r.roomNumber;
            r.occupied++;
        }
    } else {
        while (gRoomIdx < girlsRooms.length && girlsRooms[gRoomIdx].occupied >= girlsRooms[gRoomIdx].capacity) {
            gRoomIdx++;
        }
        if (gRoomIdx < girlsRooms.length) {
            const r = girlsRooms[gRoomIdx];
            roomNum = r.roomNumber;
            r.occupied++;
        }
    }

    students.push({
        id: i,
        name: fullName,
        gender,
        branch: branches[Math.floor(Math.random() * branches.length)],
        year: ['1st', '2nd', '3rd', '4th'][Math.floor(Math.random() * 4)],
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        caste: castes[Math.floor(Math.random() * castes.length)],
        contact: `9${Math.floor(Math.random() * 1000000000 + 100000000).toString().substring(0,9)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gcoen.ac.in`,
        permanentAddress: `${Math.floor(Math.random() * 100) + 1}, ${['Civil Lines', 'Sadar', 'Manish Nagar', 'Sitabuldi', 'Dharampeth'][Math.floor(Math.random() * 5)]}, Nagpur`,
        temporaryAddress: roomNum ? `Room ${roomNum}, ${isMale ? 'Boys' : 'Girls'} Hostel` : 'Unallocated',
        parentName: `Mr. ${lastName}`,
        parentContact: `8${Math.floor(Math.random() * 1000000000 + 100000000).toString().substring(0,9)}`,
        roomNumber: roomNum,
        admissionDate: `2024-06-${Math.floor(Math.random() * 28) + 1}`,
        profilePhoto: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=128`
    });
  }
  return students;
}

export const INITIAL_STUDENTS: Student[] = generateMockStudents(500, INITIAL_ROOMS);

export const INITIAL_PAYMENTS: MessPayment[] = [
  { id: 1, studentId: 1, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Paid', paymentMethod: 'Online', date: '2024-03-05', transactionId: 'TXN123456' },
  { id: 2, studentId: 2, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Paid', paymentMethod: 'Cash', date: '2024-03-06' },
  { id: 3, studentId: 3, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Pending' },
  { id: 4, studentId: 4, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Paid', paymentMethod: 'Online', date: '2024-03-02', transactionId: 'TXN998877' },
  { id: 5, studentId: 5, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Pending' },
  { id: 6, studentId: 6, amount: 2500, feeType: 'Mess', month: '2024-03', status: 'Paid', paymentMethod: 'Online', date: '2024-03-12', transactionId: 'TXN554433' },
  // Generate some random payments for other students
  ...Array.from({ length: 50 }).map((_, i) => ({
    id: 100 + i,
    studentId: Math.floor(Math.random() * 400) + 7,
    amount: 2500,
    feeType: 'Mess' as const,
    month: '2024-03',
    status: Math.random() > 0.5 ? 'Paid' as const : 'Pending' as const,
    paymentMethod: 'Online' as const,
    date: '2024-03-15',
    transactionId: `TXN${Math.floor(Math.random() * 100000)}`
  }))
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 1, studentId: 1, category: 'Maintenance', subcategory: 'Fan', description: 'Ceiling fan making loud noise in Room G01.', status: 'Resolved', date: '2024-02-20' },
  { id: 2, studentId: 4, category: 'Food', subcategory: 'Quality/Taste', description: 'Dinner was served cold yesterday.', status: 'Pending', date: '2024-03-10' },
  { id: 3, studentId: 6, category: 'Discipline', subcategory: 'Noise', description: 'Loud music during silence hours (after 9 PM).', status: 'Pending', date: '2024-03-11' },
  { id: 4, studentId: 2, category: 'Food', subcategory: 'Oil/Hygiene', description: 'Too much oil in dal', status: 'Resolved', date: '2024-03-12' },
  { id: 5, studentId: 7, category: 'Maintenance', subcategory: 'Plumbing/Water', description: 'Tap leaking in bathroom', status: 'Pending', date: '2024-03-14' },
  { id: 6, studentId: 8, category: 'Discipline', subcategory: 'Fighting', description: 'Fighting in corridor', status: 'Resolved', date: '2024-03-01' },
  // Add a few more
  ...Array.from({ length: 20 }).map((_, i) => ({
      id: 10 + i,
      studentId: Math.floor(Math.random() * 200) + 1,
      category: ['Maintenance', 'Food', 'Discipline', 'Other'][Math.floor(Math.random() * 4)] as any,
      subcategory: 'General',
      description: 'Random complaint generated for testing stats.',
      status: Math.random() > 0.7 ? 'Pending' as const : 'Resolved' as const,
      date: `2024-03-${Math.floor(Math.random() * 20) + 1}`
  }))
];

export const INITIAL_APPLICATIONS: Application[] = [
    { id: 1, studentId: 2, type: 'Leave', title: 'Sick Leave', description: 'Going home to Wardha for medical treatment for 3 days.', status: 'Approved', date: '2024-02-01', proofUrl: 'doctor_cert.pdf' },
    { id: 2, studentId: 3, type: 'ProfileUpdate', title: 'Update Phone Number', description: 'Lost my old SIM, updating new number.', data: { contact: '9999900000' }, status: 'Pending', date: '2024-03-18' }
];