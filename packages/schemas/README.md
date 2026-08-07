# @worketa/schemas

Zod validation schemas, TypeScript types, enums, and utility functions for WORKETA applications. Provides a single source of truth for data validation across frontend and backend.

## Features

✅ **Zod Validation Schemas**

- Login/registration forms
- Employee CRUD operations
- Vehicle management
- Trip tracking
- Attendance marking
- Payroll management
- Advance requests
- Real-time validation feedback

✅ **TypeScript Enums**

- User roles (ADMIN, MANAGER, DRIVER, EMPLOYEE)
- Employee types (PERMANENT, CONTRACT, TEMPORARY)
- Vehicle types (TRUCK, VAN, SEDAN, SUV, BUS)
- Fuel types (PETROL, DIESEL, CNG, ELECTRIC, HYBRID)
- Trip statuses (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- Attendance statuses (PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE)

✅ **API Endpoints**

- Centralized endpoint definitions
- Type-safe endpoint URLs
- Path parameter helpers

✅ **Utility Functions**

- Date formatting
- Currency formatting
- Phone number validation & formatting
- Duration calculation
- Email validation
- String utilities (capitalize, enum values)

## Installation

```bash
# Via pnpm (from root)
pnpm install

# The package is already configured in the monorepo
```

## Quick Start

### Using Schemas with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@worketa/schemas';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemas.auth.login),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Using Enums

```typescript
import { UserRole, EmployeeType, VehicleType } from '@worketa/schemas';

// Get all values
const roles = Object.values(UserRole);  // ['ADMIN', 'MANAGER', ...]

// Type-safe usage
const user: { role: UserRole } = { role: UserRole.ADMIN };

// In select dropdowns
<select>
  {Object.values(EmployeeType).map(type => (
    <option key={type} value={type}>{type}</option>
  ))}
</select>
```

### Using Utility Functions

```typescript
import { utils } from '@worketa/schemas';

const formatted = utils.formatDate(new Date()); // "2024-01-15"
const currency = utils.formatCurrency(10000); // "₹10,000.00"
const phone = utils.formatPhone('+919876543210'); // "+91 98765 43210"

const isValid = utils.isValidEmail('john@example.com'); // true
const hasPhone = utils.isValidPhone('9876543210'); // true

const duration = utils.calculateDuration(start, end); // { days, hours, minutes }
const capitalized = utils.capitalize('john doe'); // "John doe"
```

## API Reference

### Auth Schemas

```typescript
schemas.auth.login;
// {
//   username: string (required, min 1 char)
//   password: string (required, min 1 char)
// }

schemas.auth.loginResponse;
// {
//   token: string
//   user: {
//     id: string
//     firstName: string
//     lastName: string
//     email: string
//     role: UserRole
//   }
// }

schemas.auth.refreshToken;
// {
//   refreshToken: string
// }
```

### Employee Schemas

```typescript
schemas.employee.create;
// Required fields:
// - firstName: string (1-50 chars)
// - lastName: string (1-50 chars)
// - email: valid email
// - phone: 10+ digits
// - designation: string (required)
// - dateOfJoining: valid date
// - employeeType: EmployeeType enum
// - organizationId: string (required)

schemas.employee.update;
// All fields optional:
// - firstName, lastName, email, phone, designation, dateOfJoining, employeeType

schemas.employee.filter;
// Optional filters:
// - search: string
// - designation: string
// - employeeType: EmployeeType
// - page: number (>= 0)
// - pageSize: number (1-100)
```

### Vehicle Schemas

```typescript
schemas.vehicle.create;
// Required:
// - registrationNumber: string
// - model: string
// - color: string
// - capacity: number (>= 1)
// - fuelType: FuelType enum
// - vehicleType: VehicleType enum
// - organizationId: string

schemas.vehicle.update;
// All optional

schemas.vehicle.filter;
// - search: string
// - vehicleType: VehicleType
// - fuelType: FuelType
```

### Trip Schemas

```typescript
schemas.trip.create;
// Required:
// - startLocation: string
// - endLocation: string
// - startTime: valid date
// - vehicleId: string
// - driverId: string
// - organizationId: string
//
// Optional:
// - endTime: valid date
// - distance: number (>= 0)

schemas.trip.filter;
// - status: TripStatus
// - vehicleId: string
// - driverId: string
// - startDate: string
// - endDate: string
```

### Attendance Schemas

```typescript
schemas.attendance.mark;
// Required:
// - employeeId: string
// - date: valid date
// - status: AttendanceStatus
//
// Optional:
// - remarks: string

schemas.attendance.filter;
// - employeeId: string
// - startDate: string
// - endDate: string
// - status: AttendanceStatus
```

### Payroll Schemas

```typescript
schemas.payroll.create;
// Required:
// - employeeId: string
// - month: 1-12
// - year: >= 2000
// - basicSalary: number (>= 0)
//
// Optional:
// - allowances: number (default 0)
// - deductions: number (default 0)
// - notes: string

schemas.payroll.filter;
// - employeeId: string
// - month: 1-12
// - year: number
```

### Advances Schemas

```typescript
schemas.advances.create;
// Required:
// - employeeId: string
// - amount: number (> 0.01)
// - reason: string (1-500 chars)
// - requestDate: valid date

schemas.advances.approve;
// Required:
// - advanceId: string
//
// Optional:
// - approvalDate: valid date

schemas.advances.settle;
// Required:
// - advanceId: string
// - settlementAmount: number (>= 0)
// - settlementDate: valid date
```

## Enums Reference

```typescript
// UserRole
UserRole.ADMIN; // Full system access
UserRole.MANAGER; // Management functions
UserRole.DRIVER; // Can create/view trips
UserRole.EMPLOYEE; // Limited access

// EmployeeType
EmployeeType.PERMANENT; // Permanent staff
EmployeeType.CONTRACT; // Contract basis
EmployeeType.TEMPORARY; // Temporary hire

// VehicleType
VehicleType.TRUCK; // Large cargo vehicle
VehicleType.VAN; // Medium vehicle
VehicleType.SEDAN; // Car
VehicleType.SUV; // Sports utility vehicle
VehicleType.BUS; // Passenger transport

// FuelType
FuelType.PETROL; // Gasoline
FuelType.DIESEL; // Diesel engine
FuelType.CNG; // Compressed natural gas
FuelType.ELECTRIC; // Electric
FuelType.HYBRID; // Hybrid engine

// TripStatus
TripStatus.PENDING; // Not started
TripStatus.IN_PROGRESS; // Currently active
TripStatus.COMPLETED; // Finished
TripStatus.CANCELLED; // Cancelled

// AttendanceStatus
AttendanceStatus.PRESENT; // Marked present
AttendanceStatus.ABSENT; // Marked absent
AttendanceStatus.LATE; // Came late
AttendanceStatus.HALF_DAY; // Half day leave
AttendanceStatus.ON_LEAVE; // Full day leave
```

## Common Patterns

### Form Validation with Error Display

```typescript
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@worketa/schemas';

export function CreateEmployeeForm() {
  const form = useForm({
    resolver: zodResolver(schemas.employee.create),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          label="First Name"
          {...form.register('firstName')}
          error={form.formState.errors.firstName?.message}
        />

        <SelectField
          label="Employee Type"
          options={Object.values(EmployeeType)}
          {...form.register('employeeType')}
          error={form.formState.errors.employeeType?.message}
        />

        <button type="submit" disabled={form.formState.isSubmitting}>
          Create Employee
        </button>
      </form>
    </FormProvider>
  );
}
```

### Type-Safe API Requests

```typescript
import { z } from 'zod';
import { schemas } from '@worketa/schemas';

async function createEmployee(data: z.infer<typeof schemas.employee.create>) {
  // Data is fully typed and validated by Zod
  const response = await apiClient.post('/api/v1/employees', data);
  return response.data;
}

// TypeScript ensures correct structure
createEmployee({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '9876543210',
  designation: 'Driver',
  dateOfJoining: '2024-01-15',
  employeeType: EmployeeType.PERMANENT, // ✅ Autocomplete
  organizationId: 'org-123',
});

// TypeScript error
createEmployee({
  firstName: 'John',
  employeeType: 'INVALID', // ❌ Type error
});
```

### Enum-Based Selects and Filters

```typescript
import { constants, EmployeeType, utils } from '@worketa/schemas';

export function EmployeeFilter() {
  return (
    <div>
      <select name="employeeType">
        <option value="">All Types</option>
        {constants.employeeTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <select name="role">
        <option value="">All Roles</option>
        {constants.roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
    </div>
  );
}
```

### Date Formatting

```typescript
import { utils } from '@worketa/schemas';

export function AttendanceRecord({ date, status }) {
  return (
    <div>
      <span>{utils.formatDate(date)}</span>
      <span>{status}</span>
    </div>
  );
}
```

### Currency Display

```typescript
import { utils } from '@worketa/schemas';

export function PayrollDetails({ salary, allowances, deductions }) {
  const total = salary + allowances - deductions;

  return (
    <table>
      <tr>
        <td>Basic Salary</td>
        <td>{utils.formatCurrency(salary)}</td>
      </tr>
      <tr>
        <td>Allowances</td>
        <td>{utils.formatCurrency(allowances)}</td>
      </tr>
      <tr>
        <td>Deductions</td>
        <td>{utils.formatCurrency(deductions)}</td>
      </tr>
      <tr className="font-bold">
        <td>Total</td>
        <td>{utils.formatCurrency(total)}</td>
      </tr>
    </table>
  );
}
```

### Email & Phone Validation

```typescript
import { utils } from '@worketa/schemas';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isEmailValid = utils.isValidEmail(email);
  const isPhoneValid = utils.isValidPhone(phone);

  return (
    <>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!isEmailValid}
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        aria-invalid={!isPhoneValid}
      />

      <button disabled={!isEmailValid || !isPhoneValid}>
        Submit
      </button>
    </>
  );
}
```

## Advanced Usage

### Custom Validation

```typescript
import { z } from 'zod';
import { schemas } from '@worketa/schemas';

// Extend existing schema
const extendedEmployeeSchema = schemas.employee.create.extend({
  aadharNumber: z.string().regex(/^\d{12}$/, 'Invalid Aadhar'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN'),
});

// Conditional validation
const tripSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date().optional(),
  })
  .refine((data) => !data.endTime || data.endTime > data.startTime, {
    message: 'End time must be after start time',
  });
```

### Type Inference

```typescript
import { z } from 'zod';
import { schemas } from '@worketa/schemas';

// Get TypeScript types from schemas
type LoginRequest = z.infer<typeof schemas.auth.login>;
type Employee = z.infer<typeof schemas.employee.create>;

// Now use as regular types
const login: LoginRequest = {
  username: 'admin',
  password: 'password',
};
```

### Runtime Validation

```typescript
import { schemas } from '@worketa/schemas';

async function handleEmployeeSubmit(data: unknown) {
  try {
    // Validate at runtime
    const validated = schemas.employee.create.parse(data);

    // Safe to use now
    await createEmployee(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error.errors); // Show field errors
    }
  }
}

// Or with safe parsing (doesn't throw)
const result = schemas.employee.create.safeParse(data);
if (result.success) {
  await createEmployee(result.data);
} else {
  console.error(result.error.flatten());
}
```

## Testing

```typescript
import { z } from 'zod';
import { schemas, EmployeeType } from '@worketa/schemas';

describe('Employee Schema', () => {
  it('validates correct employee data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      designation: 'Driver',
      dateOfJoining: '2024-01-15',
      employeeType: EmployeeType.PERMANENT,
      organizationId: 'org-123',
    };

    expect(() => schemas.employee.create.parse(validData)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalidData = { ...validData, email: 'not-an-email' };

    expect(() => schemas.employee.create.parse(invalidData)).toThrow();
  });

  it('rejects short password', () => {
    const invalidData = { ...loginData, password: 'hi' };

    const result = schemas.auth.login.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

## Best Practices

1. **Always use schemas for forms**
   - Prevents invalid data submission
   - Provides clear error messages
   - Type-safe integration with React Hook Form

2. **Use enums for dropdowns**
   - Single source of truth
   - No typos or inconsistencies
   - Easy to maintain

3. **Validate early**
   - Client-side for UX
   - Server-side for security
   - Never trust client-side validation alone

4. **Use utility functions**
   - Consistent formatting across app
   - Single point to update behavior
   - Easier testing and maintenance

5. **Type inference for APIs**
   - Get types directly from schemas
   - No separate interface definitions
   - DRY principle

## License

WORKETA © 2024 All Rights Reserved
