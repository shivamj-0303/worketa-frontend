import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  CreateAdvanceRequest,
  CreateAttendanceRequest,
  CreateCompanyRequest,
  CreateEmployeeRequest,
  CreatePayrollRequest,
  CreateTripRequest,
  CreateVehicleRequest,
  LoginRequest,
} from './types';

/**

* Minimal API client contract used by React Query hooks.
*
* Your actual client can be Axios, a custom fetch wrapper,
* or another implementation, as long as it provides these methods.
  */
export interface ApiClient {
  get<TResponse = unknown>(url: string): Promise<TResponse>;

  post<TResponse = unknown, TRequest = unknown>(url: string, data?: TRequest): Promise<TResponse>;

  put<TResponse = unknown, TRequest = unknown>(url: string, data?: TRequest): Promise<TResponse>;

  delete<TResponse = unknown>(url: string): Promise<TResponse>;
}

let apiClient: ApiClient | null = null;

/**

* Initialize the API client for use in hooks.
  */
export function setApiClient(client: ApiClient): void {
  apiClient = client;
}

/**

* Returns the initialized API client.
  */
function getApiClient(): ApiClient {
  if (apiClient === null) {
    throw new Error(
      'API client has not been initialized. Call setApiClient() before using API hooks.'
    );
  }

  return apiClient;
}

/**

* Auth Hooks
  */
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => getApiClient().post('/api/v1/auth/login', data),
  });
}

/**

* Employee Hooks
  */
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => getApiClient().get('/api/v1/employees'),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getApiClient().get(`/api/v1/employees/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => getApiClient().post('/api/v1/employees', data),
  });
}

export function useUpdateEmployee(id: string) {
  return useMutation({
    mutationFn: (data: Partial<CreateEmployeeRequest>) =>
      getApiClient().put(`/api/v1/employees/${id}`, data),
  });
}

export function useDeleteEmployee(id: string) {
  return useMutation({
    mutationFn: () => getApiClient().delete(`/api/v1/employees/${id}`),
  });
}

/**

* Vehicle Hooks
  */
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getApiClient().get('/api/v1/vehicles'),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getApiClient().get(`/api/v1/vehicles/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateVehicle() {
  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => getApiClient().post('/api/v1/vehicles', data),
  });
}

export function useUpdateVehicle(id: string) {
  return useMutation({
    mutationFn: (data: Partial<CreateVehicleRequest>) =>
      getApiClient().put(`/api/v1/vehicles/${id}`, data),
  });
}

/**

* Trip Hooks
  */
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: () => getApiClient().get('/api/v1/trips'),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => getApiClient().get(`/api/v1/trips/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTrip() {
  return useMutation({
    mutationFn: (data: CreateTripRequest) => getApiClient().post('/api/v1/trips', data),
  });
}

export function useUpdateTrip(id: string) {
  return useMutation({
    mutationFn: (data: Partial<CreateTripRequest>) =>
      getApiClient().put(`/api/v1/trips/${id}`, data),
  });
}

/**

* Company Hooks
  */
export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => getApiClient().get('/api/v1/companies'),
  });
}

export function useCreateCompany() {
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => getApiClient().post('/api/v1/companies', data),
  });
}

/**

* Attendance Hooks
  */
export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: () => getApiClient().get('/api/v1/attendance'),
  });
}

export function useMarkAttendance() {
  return useMutation({
    mutationFn: (data: CreateAttendanceRequest) => getApiClient().post('/api/v1/attendance', data),
  });
}

/**

* Payroll Hooks
  */
export function usePayroll() {
  return useQuery({
    queryKey: ['payroll'],
    queryFn: () => getApiClient().get('/api/v1/payroll'),
  });
}

export function useCreatePayroll() {
  return useMutation({
    mutationFn: (data: CreatePayrollRequest) => getApiClient().post('/api/v1/payroll', data),
  });
}

/**

* Advance Hooks
  */
export function useAdvances() {
  return useQuery({
    queryKey: ['advances'],
    queryFn: () => getApiClient().get('/api/v1/advances'),
  });
}

export function useCreateAdvance() {
  return useMutation({
    mutationFn: (data: CreateAdvanceRequest) => getApiClient().post('/api/v1/advances', data),
  });
}
