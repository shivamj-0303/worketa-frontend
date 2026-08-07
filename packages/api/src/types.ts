// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR' | 'ACCOUNTANT' | 'SUPER_ADMIN';
  organisationId: string;
  createdAt: string;
}

// Organisation
export interface Organisation {
  id: string;
  name: string;
  email: string;
  description?: string;
  createdAt: string;
}

export interface CreateOrganisationRequest {
  name: string;
  email: string;
  description?: string;
}

// Employee
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeType: 'DRIVER' | 'HELPER' | 'SUPERVISOR';
  baseSalary: number;
  joinDate: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone: string;
  employeeType: 'DRIVER' | 'HELPER' | 'SUPERVISOR';
  baseSalary: number;
  joinDate: string;
}

// Vehicle
export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'TRUCK' | 'VAN' | 'BIKE';
  registrationDate: string;
  isActive: boolean;
}

export interface CreateVehicleRequest {
  vehicleNumber: string;
  type: 'TRUCK' | 'VAN' | 'BIKE';
  registrationDate: string;
}

// Trip
export interface Trip {
  id: string;
  employeeId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  source: string;
  destination: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface CreateTripRequest {
  employeeId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  source: string;
  destination: string;
}

// Attendance
export interface Attendance {
  id: string;
  userId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
}

export interface CreateAttendanceRequest {
  userId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
}

// Payroll
export interface Payroll {
  id: string;
  employeeId: string;
  monthYear: string;
  baseSalary: number;
  advances: number;
  deductions: number;
  netSalary: number;
}

export interface CreatePayrollRequest {
  employeeId: string;
  monthYear: string;
}

// Advance
export interface Advance {
  id: string;
  employeeId: string;
  amount: number;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED';
  settledDate?: string;
}

export interface CreateAdvanceRequest {
  employeeId: string;
  amount: number;
}

// Company
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Dashboard
export interface DashboardStats {
  totalEmployees: number;
  totalVehicles: number;
  activeTrips: number;
  todayAttendance: number;
  pendingAdvances: number;
  monthPayroll: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  timestamp: string;
  userId: string;
}
