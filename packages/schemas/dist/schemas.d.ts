import { z } from 'zod';
/**
 * User Roles
 */
export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    DRIVER = "DRIVER",
    EMPLOYEE = "EMPLOYEE"
}
/**
 * Employee Types
 */
export declare enum EmployeeType {
    PERMANENT = "PERMANENT",
    CONTRACT = "CONTRACT",
    TEMPORARY = "TEMPORARY"
}
/**
 * Vehicle Types
 */
export declare enum VehicleType {
    TRUCK = "TRUCK",
    VAN = "VAN",
    SEDAN = "SEDAN",
    SUV = "SUV",
    BUS = "BUS"
}
/**
 * Fuel Types
 */
export declare enum FuelType {
    PETROL = "PETROL",
    DIESEL = "DIESEL",
    CNG = "CNG",
    ELECTRIC = "ELECTRIC",
    HYBRID = "HYBRID"
}
/**
 * Trip Status
 */
export declare enum TripStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
/**
 * Attendance Status
 */
export declare enum AttendanceStatus {
    PRESENT = "PRESENT",
    ABSENT = "ABSENT",
    LATE = "LATE",
    HALF_DAY = "HALF_DAY",
    ON_LEAVE = "ON_LEAVE"
}
/**
 * API Base URLs
 */
export declare const API_ENDPOINTS: {
    LOGIN: string;
    LOGOUT: string;
    REFRESH_TOKEN: string;
    EMPLOYEES: string;
    EMPLOYEES_ID: (id: string) => string;
    VEHICLES: string;
    VEHICLES_ID: (id: string) => string;
    TRIPS: string;
    TRIPS_ID: (id: string) => string;
    COMPANIES: string;
    COMPANIES_ID: (id: string) => string;
    ATTENDANCE: string;
    ATTENDANCE_ID: (id: string) => string;
    PAYROLL: string;
    PAYROLL_ID: (id: string) => string;
    ADVANCES: string;
    ADVANCES_ID: (id: string) => string;
};
/**
 * Authentication Schemas
 */
export declare const authSchemas: {
    login: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        password: string;
    }, {
        username: string;
        password: string;
    }>;
    loginResponse: z.ZodObject<{
        token: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            role: z.ZodNativeEnum<typeof UserRole>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
        }, {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
        }>;
    }, "strip", z.ZodTypeAny, {
        token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
        };
    }, {
        token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
        };
    }>;
    refreshToken: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
};
/**
 * Employee Schemas
 */
export declare const employeeSchemas: {
    create: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        designation: z.ZodString;
        dateOfJoining: z.ZodEffects<z.ZodString, string, string>;
        employeeType: z.ZodNativeEnum<typeof EmployeeType>;
        organizationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        designation: string;
        dateOfJoining: string;
        employeeType: EmployeeType;
        organizationId: string;
    }, {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        designation: string;
        dateOfJoining: string;
        employeeType: EmployeeType;
        organizationId: string;
    }>;
    update: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        designation: z.ZodOptional<z.ZodString>;
        dateOfJoining: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        employeeType: z.ZodOptional<z.ZodNativeEnum<typeof EmployeeType>>;
    }, "strip", z.ZodTypeAny, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        designation?: string | undefined;
        dateOfJoining?: string | undefined;
        employeeType?: EmployeeType | undefined;
    }, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        email?: string | undefined;
        phone?: string | undefined;
        designation?: string | undefined;
        dateOfJoining?: string | undefined;
        employeeType?: EmployeeType | undefined;
    }>;
    filter: z.ZodOptional<z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        designation: z.ZodOptional<z.ZodString>;
        employeeType: z.ZodOptional<z.ZodNativeEnum<typeof EmployeeType>>;
        page: z.ZodOptional<z.ZodNumber>;
        pageSize: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        designation?: string | undefined;
        employeeType?: EmployeeType | undefined;
        search?: string | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
    }, {
        designation?: string | undefined;
        employeeType?: EmployeeType | undefined;
        search?: string | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
    }>>;
};
/**
 * Vehicle Schemas
 */
export declare const vehicleSchemas: {
    create: z.ZodObject<{
        registrationNumber: z.ZodString;
        model: z.ZodString;
        color: z.ZodString;
        capacity: z.ZodNumber;
        fuelType: z.ZodNativeEnum<typeof FuelType>;
        vehicleType: z.ZodNativeEnum<typeof VehicleType>;
        organizationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        registrationNumber: string;
        model: string;
        color: string;
        capacity: number;
        fuelType: FuelType;
        vehicleType: VehicleType;
    }, {
        organizationId: string;
        registrationNumber: string;
        model: string;
        color: string;
        capacity: number;
        fuelType: FuelType;
        vehicleType: VehicleType;
    }>;
    update: z.ZodObject<{
        registrationNumber: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
        capacity: z.ZodOptional<z.ZodNumber>;
        fuelType: z.ZodOptional<z.ZodNativeEnum<typeof FuelType>>;
        vehicleType: z.ZodOptional<z.ZodNativeEnum<typeof VehicleType>>;
    }, "strip", z.ZodTypeAny, {
        registrationNumber?: string | undefined;
        model?: string | undefined;
        color?: string | undefined;
        capacity?: number | undefined;
        fuelType?: FuelType | undefined;
        vehicleType?: VehicleType | undefined;
    }, {
        registrationNumber?: string | undefined;
        model?: string | undefined;
        color?: string | undefined;
        capacity?: number | undefined;
        fuelType?: FuelType | undefined;
        vehicleType?: VehicleType | undefined;
    }>;
    filter: z.ZodOptional<z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        vehicleType: z.ZodOptional<z.ZodNativeEnum<typeof VehicleType>>;
        fuelType: z.ZodOptional<z.ZodNativeEnum<typeof FuelType>>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        fuelType?: FuelType | undefined;
        vehicleType?: VehicleType | undefined;
    }, {
        search?: string | undefined;
        fuelType?: FuelType | undefined;
        vehicleType?: VehicleType | undefined;
    }>>;
};
/**
 * Trip Schemas
 */
export declare const tripSchemas: {
    create: z.ZodObject<{
        startLocation: z.ZodString;
        endLocation: z.ZodString;
        startTime: z.ZodEffects<z.ZodString, string, string>;
        endTime: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        distance: z.ZodOptional<z.ZodNumber>;
        vehicleId: z.ZodString;
        driverId: z.ZodString;
        organizationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        startLocation: string;
        endLocation: string;
        startTime: string;
        vehicleId: string;
        driverId: string;
        endTime?: string | undefined;
        distance?: number | undefined;
    }, {
        organizationId: string;
        startLocation: string;
        endLocation: string;
        startTime: string;
        vehicleId: string;
        driverId: string;
        endTime?: string | undefined;
        distance?: number | undefined;
    }>;
    update: z.ZodObject<{
        startLocation: z.ZodOptional<z.ZodString>;
        endLocation: z.ZodOptional<z.ZodString>;
        endTime: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        distance: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodNativeEnum<typeof TripStatus>>;
    }, "strip", z.ZodTypeAny, {
        status?: TripStatus | undefined;
        startLocation?: string | undefined;
        endLocation?: string | undefined;
        endTime?: string | undefined;
        distance?: number | undefined;
    }, {
        status?: TripStatus | undefined;
        startLocation?: string | undefined;
        endLocation?: string | undefined;
        endTime?: string | undefined;
        distance?: number | undefined;
    }>;
    filter: z.ZodOptional<z.ZodObject<{
        status: z.ZodOptional<z.ZodNativeEnum<typeof TripStatus>>;
        vehicleId: z.ZodOptional<z.ZodString>;
        driverId: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: TripStatus | undefined;
        vehicleId?: string | undefined;
        driverId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        status?: TripStatus | undefined;
        vehicleId?: string | undefined;
        driverId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>>;
};
/**
 * Attendance Schemas
 */
export declare const attendanceSchemas: {
    mark: z.ZodObject<{
        employeeId: z.ZodString;
        date: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodNativeEnum<typeof AttendanceStatus>;
        remarks: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: AttendanceStatus;
        date: string;
        employeeId: string;
        remarks?: string | undefined;
    }, {
        status: AttendanceStatus;
        date: string;
        employeeId: string;
        remarks?: string | undefined;
    }>;
    filter: z.ZodOptional<z.ZodObject<{
        employeeId: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodNativeEnum<typeof AttendanceStatus>>;
    }, "strip", z.ZodTypeAny, {
        status?: AttendanceStatus | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        employeeId?: string | undefined;
    }, {
        status?: AttendanceStatus | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        employeeId?: string | undefined;
    }>>;
};
/**
 * Payroll Schemas
 */
export declare const payrollSchemas: {
    create: z.ZodObject<{
        employeeId: z.ZodString;
        month: z.ZodNumber;
        year: z.ZodNumber;
        basicSalary: z.ZodNumber;
        allowances: z.ZodDefault<z.ZodNumber>;
        deductions: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        employeeId: string;
        month: number;
        year: number;
        basicSalary: number;
        allowances: number;
        deductions: number;
        notes?: string | undefined;
    }, {
        employeeId: string;
        month: number;
        year: number;
        basicSalary: number;
        allowances?: number | undefined;
        deductions?: number | undefined;
        notes?: string | undefined;
    }>;
    filter: z.ZodOptional<z.ZodObject<{
        employeeId: z.ZodOptional<z.ZodString>;
        month: z.ZodOptional<z.ZodNumber>;
        year: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        employeeId?: string | undefined;
        month?: number | undefined;
        year?: number | undefined;
    }, {
        employeeId?: string | undefined;
        month?: number | undefined;
        year?: number | undefined;
    }>>;
};
/**
 * Advances Schemas
 */
export declare const advancesSchemas: {
    create: z.ZodObject<{
        employeeId: z.ZodString;
        amount: z.ZodNumber;
        reason: z.ZodString;
        requestDate: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        employeeId: string;
        amount: number;
        reason: string;
        requestDate: string;
    }, {
        employeeId: string;
        amount: number;
        reason: string;
        requestDate: string;
    }>;
    approve: z.ZodObject<{
        advanceId: z.ZodString;
        approvalDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        advanceId: string;
        approvalDate?: string | undefined;
    }, {
        advanceId: string;
        approvalDate?: string | undefined;
    }>;
    settle: z.ZodObject<{
        advanceId: z.ZodString;
        settlementAmount: z.ZodNumber;
        settlementDate: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        advanceId: string;
        settlementAmount: number;
        settlementDate: string;
    }, {
        advanceId: string;
        settlementAmount: number;
        settlementDate: string;
    }>;
};
/**
 * Utility functions
 */
export declare const utils: {
    /**
     * Format date to YYYY-MM-DD
     */
    formatDate: (date: Date | string) => string;
    /**
     * Format currency
     */
    formatCurrency: (amount: number, currency?: string) => string;
    /**
     * Format phone number
     */
    formatPhone: (phone: string) => string;
    /**
     * Calculate duration between two dates
     */
    calculateDuration: (startDate: Date | string, endDate: Date | string) => {
        days: number;
        hours: number;
        minutes: number;
    };
    /**
     * Validate email
     */
    isValidEmail: (email: string) => boolean;
    /**
     * Validate phone number
     */
    isValidPhone: (phone: string) => boolean;
    /**
     * Capitalize first letter
     */
    capitalize: (str: string) => string;
    /**
     * Get enum values
     */
    getEnumValues: <T extends Record<string, string>>(enumObj: T) => string[];
};
/**
 * Direct schema exports for convenience
 */
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmPassword: string;
}, {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmPassword: string;
}>, {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmPassword: string;
}, {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmPassword: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
/**
 * Export all schemas as a single object
 */
export declare const schemas: {
    auth: {
        login: z.ZodObject<{
            username: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            username: string;
            password: string;
        }, {
            username: string;
            password: string;
        }>;
        loginResponse: z.ZodObject<{
            token: z.ZodString;
            user: z.ZodObject<{
                id: z.ZodString;
                firstName: z.ZodString;
                lastName: z.ZodString;
                email: z.ZodString;
                role: z.ZodNativeEnum<typeof UserRole>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                role: UserRole;
            }, {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                role: UserRole;
            }>;
        }, "strip", z.ZodTypeAny, {
            token: string;
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                role: UserRole;
            };
        }, {
            token: string;
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                role: UserRole;
            };
        }>;
        refreshToken: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
    };
    employee: {
        create: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            phone: z.ZodString;
            designation: z.ZodString;
            dateOfJoining: z.ZodEffects<z.ZodString, string, string>;
            employeeType: z.ZodNativeEnum<typeof EmployeeType>;
            organizationId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            designation: string;
            dateOfJoining: string;
            employeeType: EmployeeType;
            organizationId: string;
        }, {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            designation: string;
            dateOfJoining: string;
            employeeType: EmployeeType;
            organizationId: string;
        }>;
        update: z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            designation: z.ZodOptional<z.ZodString>;
            dateOfJoining: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            employeeType: z.ZodOptional<z.ZodNativeEnum<typeof EmployeeType>>;
        }, "strip", z.ZodTypeAny, {
            firstName?: string | undefined;
            lastName?: string | undefined;
            email?: string | undefined;
            phone?: string | undefined;
            designation?: string | undefined;
            dateOfJoining?: string | undefined;
            employeeType?: EmployeeType | undefined;
        }, {
            firstName?: string | undefined;
            lastName?: string | undefined;
            email?: string | undefined;
            phone?: string | undefined;
            designation?: string | undefined;
            dateOfJoining?: string | undefined;
            employeeType?: EmployeeType | undefined;
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            search: z.ZodOptional<z.ZodString>;
            designation: z.ZodOptional<z.ZodString>;
            employeeType: z.ZodOptional<z.ZodNativeEnum<typeof EmployeeType>>;
            page: z.ZodOptional<z.ZodNumber>;
            pageSize: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            designation?: string | undefined;
            employeeType?: EmployeeType | undefined;
            search?: string | undefined;
            page?: number | undefined;
            pageSize?: number | undefined;
        }, {
            designation?: string | undefined;
            employeeType?: EmployeeType | undefined;
            search?: string | undefined;
            page?: number | undefined;
            pageSize?: number | undefined;
        }>>;
    };
    vehicle: {
        create: z.ZodObject<{
            registrationNumber: z.ZodString;
            model: z.ZodString;
            color: z.ZodString;
            capacity: z.ZodNumber;
            fuelType: z.ZodNativeEnum<typeof FuelType>;
            vehicleType: z.ZodNativeEnum<typeof VehicleType>;
            organizationId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            organizationId: string;
            registrationNumber: string;
            model: string;
            color: string;
            capacity: number;
            fuelType: FuelType;
            vehicleType: VehicleType;
        }, {
            organizationId: string;
            registrationNumber: string;
            model: string;
            color: string;
            capacity: number;
            fuelType: FuelType;
            vehicleType: VehicleType;
        }>;
        update: z.ZodObject<{
            registrationNumber: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            capacity: z.ZodOptional<z.ZodNumber>;
            fuelType: z.ZodOptional<z.ZodNativeEnum<typeof FuelType>>;
            vehicleType: z.ZodOptional<z.ZodNativeEnum<typeof VehicleType>>;
        }, "strip", z.ZodTypeAny, {
            registrationNumber?: string | undefined;
            model?: string | undefined;
            color?: string | undefined;
            capacity?: number | undefined;
            fuelType?: FuelType | undefined;
            vehicleType?: VehicleType | undefined;
        }, {
            registrationNumber?: string | undefined;
            model?: string | undefined;
            color?: string | undefined;
            capacity?: number | undefined;
            fuelType?: FuelType | undefined;
            vehicleType?: VehicleType | undefined;
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            search: z.ZodOptional<z.ZodString>;
            vehicleType: z.ZodOptional<z.ZodNativeEnum<typeof VehicleType>>;
            fuelType: z.ZodOptional<z.ZodNativeEnum<typeof FuelType>>;
        }, "strip", z.ZodTypeAny, {
            search?: string | undefined;
            fuelType?: FuelType | undefined;
            vehicleType?: VehicleType | undefined;
        }, {
            search?: string | undefined;
            fuelType?: FuelType | undefined;
            vehicleType?: VehicleType | undefined;
        }>>;
    };
    trip: {
        create: z.ZodObject<{
            startLocation: z.ZodString;
            endLocation: z.ZodString;
            startTime: z.ZodEffects<z.ZodString, string, string>;
            endTime: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            distance: z.ZodOptional<z.ZodNumber>;
            vehicleId: z.ZodString;
            driverId: z.ZodString;
            organizationId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            organizationId: string;
            startLocation: string;
            endLocation: string;
            startTime: string;
            vehicleId: string;
            driverId: string;
            endTime?: string | undefined;
            distance?: number | undefined;
        }, {
            organizationId: string;
            startLocation: string;
            endLocation: string;
            startTime: string;
            vehicleId: string;
            driverId: string;
            endTime?: string | undefined;
            distance?: number | undefined;
        }>;
        update: z.ZodObject<{
            startLocation: z.ZodOptional<z.ZodString>;
            endLocation: z.ZodOptional<z.ZodString>;
            endTime: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
            distance: z.ZodOptional<z.ZodNumber>;
            status: z.ZodOptional<z.ZodNativeEnum<typeof TripStatus>>;
        }, "strip", z.ZodTypeAny, {
            status?: TripStatus | undefined;
            startLocation?: string | undefined;
            endLocation?: string | undefined;
            endTime?: string | undefined;
            distance?: number | undefined;
        }, {
            status?: TripStatus | undefined;
            startLocation?: string | undefined;
            endLocation?: string | undefined;
            endTime?: string | undefined;
            distance?: number | undefined;
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            status: z.ZodOptional<z.ZodNativeEnum<typeof TripStatus>>;
            vehicleId: z.ZodOptional<z.ZodString>;
            driverId: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: TripStatus | undefined;
            vehicleId?: string | undefined;
            driverId?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
        }, {
            status?: TripStatus | undefined;
            vehicleId?: string | undefined;
            driverId?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
        }>>;
    };
    attendance: {
        mark: z.ZodObject<{
            employeeId: z.ZodString;
            date: z.ZodEffects<z.ZodString, string, string>;
            status: z.ZodNativeEnum<typeof AttendanceStatus>;
            remarks: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: AttendanceStatus;
            date: string;
            employeeId: string;
            remarks?: string | undefined;
        }, {
            status: AttendanceStatus;
            date: string;
            employeeId: string;
            remarks?: string | undefined;
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            employeeId: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodNativeEnum<typeof AttendanceStatus>>;
        }, "strip", z.ZodTypeAny, {
            status?: AttendanceStatus | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            employeeId?: string | undefined;
        }, {
            status?: AttendanceStatus | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            employeeId?: string | undefined;
        }>>;
    };
    payroll: {
        create: z.ZodObject<{
            employeeId: z.ZodString;
            month: z.ZodNumber;
            year: z.ZodNumber;
            basicSalary: z.ZodNumber;
            allowances: z.ZodDefault<z.ZodNumber>;
            deductions: z.ZodDefault<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            employeeId: string;
            month: number;
            year: number;
            basicSalary: number;
            allowances: number;
            deductions: number;
            notes?: string | undefined;
        }, {
            employeeId: string;
            month: number;
            year: number;
            basicSalary: number;
            allowances?: number | undefined;
            deductions?: number | undefined;
            notes?: string | undefined;
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            employeeId: z.ZodOptional<z.ZodString>;
            month: z.ZodOptional<z.ZodNumber>;
            year: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            employeeId?: string | undefined;
            month?: number | undefined;
            year?: number | undefined;
        }, {
            employeeId?: string | undefined;
            month?: number | undefined;
            year?: number | undefined;
        }>>;
    };
    advances: {
        create: z.ZodObject<{
            employeeId: z.ZodString;
            amount: z.ZodNumber;
            reason: z.ZodString;
            requestDate: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            employeeId: string;
            amount: number;
            reason: string;
            requestDate: string;
        }, {
            employeeId: string;
            amount: number;
            reason: string;
            requestDate: string;
        }>;
        approve: z.ZodObject<{
            advanceId: z.ZodString;
            approvalDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        }, "strip", z.ZodTypeAny, {
            advanceId: string;
            approvalDate?: string | undefined;
        }, {
            advanceId: string;
            approvalDate?: string | undefined;
        }>;
        settle: z.ZodObject<{
            advanceId: z.ZodString;
            settlementAmount: z.ZodNumber;
            settlementDate: z.ZodEffects<z.ZodString, string, string>;
        }, "strip", z.ZodTypeAny, {
            advanceId: string;
            settlementAmount: number;
            settlementDate: string;
        }, {
            advanceId: string;
            settlementAmount: number;
            settlementDate: string;
        }>;
    };
};
/**
 * Export all constants
 */
export declare const constants: {
    roles: UserRole[];
    employeeTypes: EmployeeType[];
    vehicleTypes: VehicleType[];
    fuelTypes: FuelType[];
    tripStatuses: TripStatus[];
    attendanceStatuses: AttendanceStatus[];
    endpoints: {
        LOGIN: string;
        LOGOUT: string;
        REFRESH_TOKEN: string;
        EMPLOYEES: string;
        EMPLOYEES_ID: (id: string) => string;
        VEHICLES: string;
        VEHICLES_ID: (id: string) => string;
        TRIPS: string;
        TRIPS_ID: (id: string) => string;
        COMPANIES: string;
        COMPANIES_ID: (id: string) => string;
        ATTENDANCE: string;
        ATTENDANCE_ID: (id: string) => string;
        PAYROLL: string;
        PAYROLL_ID: (id: string) => string;
        ADVANCES: string;
        ADVANCES_ID: (id: string) => string;
    };
};
//# sourceMappingURL=schemas.d.ts.map