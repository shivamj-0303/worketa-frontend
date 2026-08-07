/**
 * @worketa/schemas - Validation schemas and constants
 *
 * This package provides:
 * - Zod validation schemas for all forms
 * - Enums for types, statuses, roles
 * - API endpoint constants
 * - Utility functions for formatting, validation
 */

export {
  // Enums
  UserRole,
  EmployeeType,
  VehicleType,
  FuelType,
  TripStatus,
  AttendanceStatus,
  // Constants
  API_ENDPOINTS,
  // Schemas
  authSchemas,
  employeeSchemas,
  vehicleSchemas,
  tripSchemas,
  attendanceSchemas,
  payrollSchemas,
  advancesSchemas,
  // Direct schema exports
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  // Aggregates
  schemas,
  constants,
  // Utils
  utils,
} from './schemas';
