import { z } from 'zod';
/**
 * User Roles
 */
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["DRIVER"] = "DRIVER";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole || (UserRole = {}));
/**
 * Employee Types
 */
export var EmployeeType;
(function (EmployeeType) {
    EmployeeType["PERMANENT"] = "PERMANENT";
    EmployeeType["CONTRACT"] = "CONTRACT";
    EmployeeType["TEMPORARY"] = "TEMPORARY";
})(EmployeeType || (EmployeeType = {}));
/**
 * Vehicle Types
 */
export var VehicleType;
(function (VehicleType) {
    VehicleType["TRUCK"] = "TRUCK";
    VehicleType["VAN"] = "VAN";
    VehicleType["SEDAN"] = "SEDAN";
    VehicleType["SUV"] = "SUV";
    VehicleType["BUS"] = "BUS";
})(VehicleType || (VehicleType = {}));
/**
 * Fuel Types
 */
export var FuelType;
(function (FuelType) {
    FuelType["PETROL"] = "PETROL";
    FuelType["DIESEL"] = "DIESEL";
    FuelType["CNG"] = "CNG";
    FuelType["ELECTRIC"] = "ELECTRIC";
    FuelType["HYBRID"] = "HYBRID";
})(FuelType || (FuelType = {}));
/**
 * Trip Status
 */
export var TripStatus;
(function (TripStatus) {
    TripStatus["PENDING"] = "PENDING";
    TripStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TripStatus["COMPLETED"] = "COMPLETED";
    TripStatus["CANCELLED"] = "CANCELLED";
})(TripStatus || (TripStatus = {}));
/**
 * Attendance Status
 */
export var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["HALF_DAY"] = "HALF_DAY";
    AttendanceStatus["ON_LEAVE"] = "ON_LEAVE";
})(AttendanceStatus || (AttendanceStatus = {}));
/**
 * API Base URLs
 */
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
    // Employees
    EMPLOYEES: '/api/v1/employees',
    EMPLOYEES_ID: (id) => `/api/v1/employees/${id}`,
    // Vehicles
    VEHICLES: '/api/v1/vehicles',
    VEHICLES_ID: (id) => `/api/v1/vehicles/${id}`,
    // Trips
    TRIPS: '/api/v1/trips',
    TRIPS_ID: (id) => `/api/v1/trips/${id}`,
    // Companies
    COMPANIES: '/api/v1/companies',
    COMPANIES_ID: (id) => `/api/v1/companies/${id}`,
    // Attendance
    ATTENDANCE: '/api/v1/attendance',
    ATTENDANCE_ID: (id) => `/api/v1/attendance/${id}`,
    // Payroll
    PAYROLL: '/api/v1/payroll',
    PAYROLL_ID: (id) => `/api/v1/payroll/${id}`,
    // Advances
    ADVANCES: '/api/v1/advances',
    ADVANCES_ID: (id) => `/api/v1/advances/${id}`,
};
/**
 * Authentication Schemas
 */
export const authSchemas = {
    login: z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
    loginResponse: z.object({
        token: z.string(),
        user: z.object({
            id: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            email: z.string().email(),
            role: z.nativeEnum(UserRole),
        }),
    }),
    refreshToken: z.object({
        refreshToken: z.string(),
    }),
};
/**
 * Employee Schemas
 */
export const employeeSchemas = {
    create: z.object({
        firstName: z.string().min(1, 'First name is required').max(50),
        lastName: z.string().min(1, 'Last name is required').max(50),
        email: z.string().email('Invalid email address'),
        phone: z.string().regex(/^\+?[0-9]{10,}$/, 'Invalid phone number'),
        designation: z.string().min(1, 'Designation is required'),
        dateOfJoining: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
        employeeType: z.nativeEnum(EmployeeType),
        organizationId: z.string().min(1, 'Organization is required'),
    }),
    update: z.object({
        firstName: z.string().min(1).max(50).optional(),
        lastName: z.string().min(1).max(50).optional(),
        email: z.string().email().optional(),
        phone: z.string().regex(/^\+?[0-9]{10,}$/).optional(),
        designation: z.string().min(1).optional(),
        dateOfJoining: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
        employeeType: z.nativeEnum(EmployeeType).optional(),
    }),
    filter: z.object({
        search: z.string().optional(),
        designation: z.string().optional(),
        employeeType: z.nativeEnum(EmployeeType).optional(),
        page: z.number().min(0).optional(),
        pageSize: z.number().min(1).max(100).optional(),
    }).optional(),
};
/**
 * Vehicle Schemas
 */
export const vehicleSchemas = {
    create: z.object({
        registrationNumber: z.string().min(1, 'Registration number is required'),
        model: z.string().min(1, 'Model is required'),
        color: z.string().min(1, 'Color is required'),
        capacity: z.number().min(1, 'Capacity must be at least 1'),
        fuelType: z.nativeEnum(FuelType),
        vehicleType: z.nativeEnum(VehicleType),
        organizationId: z.string().min(1, 'Organization is required'),
    }),
    update: z.object({
        registrationNumber: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        color: z.string().min(1).optional(),
        capacity: z.number().min(1).optional(),
        fuelType: z.nativeEnum(FuelType).optional(),
        vehicleType: z.nativeEnum(VehicleType).optional(),
    }),
    filter: z.object({
        search: z.string().optional(),
        vehicleType: z.nativeEnum(VehicleType).optional(),
        fuelType: z.nativeEnum(FuelType).optional(),
    }).optional(),
};
/**
 * Trip Schemas
 */
export const tripSchemas = {
    create: z.object({
        startLocation: z.string().min(1, 'Start location is required'),
        endLocation: z.string().min(1, 'End location is required'),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start time'),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end time').optional(),
        distance: z.number().min(0, 'Distance must be non-negative').optional(),
        vehicleId: z.string().min(1, 'Vehicle is required'),
        driverId: z.string().min(1, 'Driver is required'),
        organizationId: z.string().min(1, 'Organization is required'),
    }),
    update: z.object({
        startLocation: z.string().min(1).optional(),
        endLocation: z.string().min(1).optional(),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end time').optional(),
        distance: z.number().min(0).optional(),
        status: z.nativeEnum(TripStatus).optional(),
    }),
    filter: z.object({
        status: z.nativeEnum(TripStatus).optional(),
        vehicleId: z.string().optional(),
        driverId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }).optional(),
};
/**
 * Attendance Schemas
 */
export const attendanceSchemas = {
    mark: z.object({
        employeeId: z.string().min(1, 'Employee is required'),
        date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
        status: z.nativeEnum(AttendanceStatus),
        remarks: z.string().optional(),
    }),
    filter: z.object({
        employeeId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.nativeEnum(AttendanceStatus).optional(),
    }).optional(),
};
/**
 * Payroll Schemas
 */
export const payrollSchemas = {
    create: z.object({
        employeeId: z.string().min(1, 'Employee is required'),
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
        basicSalary: z.number().min(0, 'Salary must be non-negative'),
        allowances: z.number().min(0).default(0),
        deductions: z.number().min(0).default(0),
        notes: z.string().optional(),
    }),
    filter: z.object({
        employeeId: z.string().optional(),
        month: z.number().min(1).max(12).optional(),
        year: z.number().optional(),
    }).optional(),
};
/**
 * Advances Schemas
 */
export const advancesSchemas = {
    create: z.object({
        employeeId: z.string().min(1, 'Employee is required'),
        amount: z.number().min(0.01, 'Amount must be greater than 0'),
        reason: z.string().min(1, 'Reason is required').max(500),
        requestDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    }),
    approve: z.object({
        advanceId: z.string(),
        approvalDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
    }),
    settle: z.object({
        advanceId: z.string(),
        settlementAmount: z.number().min(0),
        settlementDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
    }),
};
/**
 * Utility functions
 */
export const utils = {
    /**
     * Format date to YYYY-MM-DD
     */
    formatDate: (date) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    },
    /**
     * Format currency
     */
    formatCurrency: (amount, currency = 'INR') => {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(amount);
    },
    /**
     * Format phone number
     */
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
        }
        return phone;
    },
    /**
     * Calculate duration between two dates
     */
    calculateDuration: (startDate, endDate) => {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        const diff = end.getTime() - start.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        return { days, hours, minutes };
    },
    /**
     * Validate email
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    /**
     * Validate phone number
     */
    isValidPhone: (phone) => {
        const phoneRegex = /^\+?[0-9]{10,}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    },
    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    /**
     * Get enum values
     */
    getEnumValues: (enumObj) => {
        return Object.values(enumObj);
    },
};
/**
 * Direct schema exports for convenience
 */
export const loginSchema = authSchemas.login;
export const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});
/**
 * Export all schemas as a single object
 */
export const schemas = {
    auth: authSchemas,
    employee: employeeSchemas,
    vehicle: vehicleSchemas,
    trip: tripSchemas,
    attendance: attendanceSchemas,
    payroll: payrollSchemas,
    advances: advancesSchemas,
};
/**
 * Export all constants
 */
export const constants = {
    roles: Object.values(UserRole),
    employeeTypes: Object.values(EmployeeType),
    vehicleTypes: Object.values(VehicleType),
    fuelTypes: Object.values(FuelType),
    tripStatuses: Object.values(TripStatus),
    attendanceStatuses: Object.values(AttendanceStatus),
    endpoints: API_ENDPOINTS,
};
//# sourceMappingURL=schemas.js.map