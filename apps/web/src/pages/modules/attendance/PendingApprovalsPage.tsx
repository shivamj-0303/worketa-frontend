import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@worketa/api';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';

interface PendingAttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;
  type: 'PRESENT' | 'ABSENT' | 'WORKED_DOUBLE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Employee {
  id: string;
  fullName: string;
}

export default function PendingApprovalsPage({ doubleOnly = false }: { doubleOnly?: boolean }) {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<ApiResponse<PendingAttendanceRecord[]>>({
    queryKey: ['pending-attendance'],
    queryFn: async () => apiClient.get('/v1/attendance/pending'),
  });

  const { data: employeesResponse } = useQuery<ApiResponse<Employee[]>>({
    queryKey: ['employees'],
    queryFn: async () => apiClient.get('/v1/employees'),
  });

  const employeeNames = useMemo(() => {
    const employees =
      employeesResponse?.success && Array.isArray(employeesResponse.data)
        ? employeesResponse.data
        : [];
    return new Map(employees.map((employee) => [employee.id, employee.fullName]));
  }, [employeesResponse]);

  const pendingRecords = useMemo(() => {
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data.filter(
      (record) =>
        (!doubleOnly || record.type === 'WORKED_DOUBLE') &&
        (record.attendanceDate.toLowerCase().includes(search.toLowerCase()) ||
          record.type.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, doubleOnly, search]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/v1/attendance/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-attendance'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/v1/attendance/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-attendance'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {doubleOnly ? 'Double attendance approvals' : 'Pending attendance approvals'}
          </h1>
          <p className="text-sm text-slate-600">
            Review employee attendance requests before salary calculation.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by date or type"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading pending approvals...
                </td>
              </tr>
            ) : pendingRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No pending attendance requests.
                </td>
              </tr>
            ) : (
              pendingRecords.map((record) => (
                <tr key={record.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {employeeNames.get(record.employeeId) || 'Employee'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{record.attendanceDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.type === 'WORKED_DOUBLE'
                          ? 'bg-blue-100 text-blue-700'
                          : record.type === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {record.type === 'WORKED_DOUBLE' ? 'Double attendance' : record.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {record.type === 'WORKED_DOUBLE' ? '₹500' : '₹0'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveMutation.mutate(record.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rejectMutation.mutate(record.id)}
                        disabled={rejectMutation.isPending}
                        className="border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
