import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Employee {
  id: string;
  fullName: string;
}

interface Advance {
  id: string;
  employeeId: string;
  employeeName?: string;
  amount: number;
  advanceDate: string;
  settled: boolean;
}

interface ApiListResponse {
  success?: boolean;
  data?: unknown;
}

interface CreateAdvancePayload {
  employeeId: string;
  amount: number;
  advanceDate: string;
}

const formatLocalDate = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function AdvancesPage() {
  const apiClient = useApiClient();
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', amount: '' });
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Fetch employees
  const { data: empResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      return apiClient.get('/v1/employees');
    },
  });

  // Fetch advances
  const { data: advResponse, refetch: refetchAdvances } = useQuery({
    queryKey: ['advances'],
    queryFn: async () => {
      return apiClient.get('/v1/advances');
    },
  });

  // Update employees list when response changes
  useEffect(() => {
    const response = empResponse as ApiListResponse | undefined;

    if (response?.success && response.data) {
      const data = response.data;
      setEmployees(Array.isArray(data) ? data : []);
    }
  }, [empResponse]);

  // Update advances list when response changes
  useEffect(() => {
    const response = advResponse as ApiListResponse | undefined;

    if (response?.success && response.data) {
      const data = response.data;
      setAdvances(Array.isArray(data) ? data : []);
    }
  }, [advResponse]);

  const handleCreate = useMutation({
    mutationFn: async (data: { employeeId: string; amount: string }) => {
      const payload: CreateAdvancePayload = {
        employeeId: data.employeeId,
        amount: parseFloat(data.amount),
        advanceDate: formatLocalDate(),
      };

      return apiClient.post('/v1/advances', {
        ...payload,
      });
    },
    onSuccess: () => {
      setFormData({ employeeId: '', amount: '' });
      setIsCreating(false);
      refetchAdvances();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.employeeId && formData.amount) {
      handleCreate.mutate(formData);
    }
  };

  const getEmployeeName = (empId: string) => {
    return employees.find((e) => e.id === empId)?.fullName || empId;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="premium-surface flex flex-col gap-4 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            Finance
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Advances</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and review employee advances in a single responsive view.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? '✕ Cancel' : '+ Request Advance'}
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="premium-card space-y-5 p-5 md:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="premium-input bg-white"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
          <Button
            variant="success"
            type="submit"
            className="w-full"
            disabled={handleCreate.isPending}
          >
            {handleCreate.isPending ? 'Requesting...' : 'Request Advance'}
          </Button>
        </form>
      )}

      <div className="premium-table-wrap overflow-x-auto">
        <table className="premium-table min-w-[720px]">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {advances.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No advances.
                </td>
              </tr>
            ) : (
              advances.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-primary-50/50">
                  <td className="font-medium text-slate-900">{getEmployeeName(a.employeeId)}</td>
                  <td className="text-slate-900">₹{a.amount?.toFixed(2)}</td>
                  <td className="text-slate-900">{new Date(a.advanceDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`premium-badge ${
                        a.settled
                          ? 'bg-success-50 text-success-700'
                          : 'bg-warning-50 text-warning-700'
                      }`}
                    >
                      {a.settled ? 'SETTLED' : 'PENDING'}
                    </span>
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
