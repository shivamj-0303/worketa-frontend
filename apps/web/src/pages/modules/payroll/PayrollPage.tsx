'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';

interface Employee {
  id: string;
  fullName: string;
  dailyWage: number;
  type: string;
}

interface PayrollSummary {
  employeeId: string;
  employeeName: string;

  periodStart: string;
  periodEnd: string;

  dailyWage: number;

  presentDays: number;
  doubledDays: number;
  absentDays: number;

  grossAmount: number;
  advanceDeduction: number;
  netAmount: number;
}

interface ApiListResponse {
  success?: boolean;
  data?: unknown;
  message?: string;
}

export default function PayrollPage() {
  const apiClient = useApiClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<PayrollSummary | null>(null);

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      return apiClient.get('/v1/employees');
    },
  });

  const employees = useMemo<Employee[]>(() => {
    const apiResponse = response as ApiListResponse | undefined;

    if (apiResponse?.success && apiResponse.data) {
      const data = apiResponse.data;
      return Array.isArray(data) ? data : [];
    }

    return [];
  }, [response]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (!searchQuery) return true;

      return employee.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [employees, searchQuery]);

  const settlePayrollMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return apiClient.post('/v1/payroll/settle', {
        employeeId,
      });
    },

    onSuccess: () => {
      setShowDetail(null);
      setDetailData(null);
      refetch();
    },
  });

  const handleViewDetail = async (employee: Employee) => {
    try {
      setShowDetail(employee.id);

      const response = await apiClient.get(`/v1/payroll/summary/${employee.id}`);

      const data =
        response && typeof response === 'object' && 'data' in response
          ? (response as ApiListResponse).data
          : response;

      setDetailData(data);
    } catch (error) {
      console.error(error);
      setShowDetail(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="premium-surface rounded-[2rem] p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            Finance
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Payroll</h1>
        </div>

        <div className="premium-card flex items-center justify-center py-10">
          <div className="text-lg text-slate-600">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="premium-surface flex flex-col gap-4 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            Finance
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Payroll</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review employee payrolls and settle them with a responsive detail view.
          </p>
        </div>
      </div>

      <div className="premium-card p-4 md:p-5">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input"
          />
        </div>
      </div>

      <div className="premium-table-wrap overflow-x-auto">
        <table className="premium-table min-w-[760px]">
          <thead>
            <tr>
              <th>Employee Name</th>

              <th>Employee Type</th>

              <th>Daily Wage</th>

              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="border-b border-slate-100 hover:bg-primary-50/50">
                <td className="font-medium text-slate-900">{employee.fullName}</td>

                <td>{employee.type}</td>

                <td>₹{employee.dailyWage}</td>

                <td className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(employee)}
                    className="text-blue-600"
                  >
                    View Payroll
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">No employees found</div>
        )}
      </div>

      {showDetail && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="premium-surface max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Payroll Summary</h2>

              <button
                onClick={() => {
                  setShowDetail(null);
                  setDetailData(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Employee Name</p>
                  <p className="font-semibold text-slate-900">{detailData.employeeName}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Daily Wage</p>
                  <p className="font-semibold text-slate-900">₹{detailData.dailyWage}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Settlement Period</p>
                  <p className="font-semibold text-slate-900">
                    {detailData.periodStart} - {detailData.periodEnd}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Present Days</p>
                  <p className="font-semibold text-slate-900">{detailData.presentDays}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Double Days</p>
                  <p className="font-semibold text-slate-900">{detailData.doubledDays}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Absent Days</p>
                  <p className="font-semibold text-slate-900">{detailData.absentDays}</p>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gross Amount</span>

                  <span className="font-semibold">₹{detailData.grossAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Advance Deduction</span>

                  <span className="text-orange-600 font-semibold">
                    -₹{detailData.advanceDeduction}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
                  <span className="text-slate-900">Net Amount</span>

                  <span className="text-green-600">₹{detailData.netAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetail(null);
                  setDetailData(null);
                }}
              >
                Close
              </Button>

              <Button
                variant="primary"
                disabled={settlePayrollMutation.isPending}
                onClick={() => settlePayrollMutation.mutate(detailData.employeeId)}
              >
                {settlePayrollMutation.isPending ? 'Settling...' : 'Settle Payroll'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
