import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';

interface PayrollBill {
  id: string;
  employeeId: string;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  dailyWage: number;
  presentDays: number;
  doubledDays: number;
  absentDays: number;
  grossAmount: number;
  advanceDeduction: number;
  netAmount: number;
  settledAt?: string;
  advancesSnapshot?: string;
}

interface PayrollBillForm {
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  dailyWage: string;
  presentDays: string;
  doubledDays: string;
  absentDays: string;
  grossAmount: string;
  advanceDeduction: string;
  netAmount: string;
  settledAt: string;
  advancesSnapshot: string;
}

const emptyForm = (): PayrollBillForm => ({
  employeeName: '',
  periodStart: '',
  periodEnd: '',
  dailyWage: '',
  presentDays: '',
  doubledDays: '',
  absentDays: '',
  grossAmount: '',
  advanceDeduction: '',
  netAmount: '',
  settledAt: '',
  advancesSnapshot: '[]',
});

const toDateTimeLocalValue = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const prettySnapshot = (value?: string) => {
  if (!value) return '[]';

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

export default function HistoryPage() {
  const apiClient = useApiClient();
  const [editingBill, setEditingBill] = useState<PayrollBill | null>(null);
  const [formData, setFormData] = useState<PayrollBillForm>(emptyForm());

  const {
    data: response,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['payroll-history'],
    queryFn: async () => {
      const result = await apiClient.get<PayrollBill[]>('/v1/payroll/history');

      if ('success' in result && result.success && 'data' in result) {
        return result.data;
      }

      throw new Error(result.message);
    },
  });

  const bills = useMemo(() => response ?? [], [response]);

  useEffect(() => {
    if (!editingBill) {
      setFormData(emptyForm());
      return;
    }

    setFormData({
      employeeName: editingBill.employeeName || '',
      periodStart: editingBill.periodStart || '',
      periodEnd: editingBill.periodEnd || '',
      dailyWage: String(editingBill.dailyWage ?? ''),
      presentDays: String(editingBill.presentDays ?? ''),
      doubledDays: String(editingBill.doubledDays ?? ''),
      absentDays: String(editingBill.absentDays ?? ''),
      grossAmount: String(editingBill.grossAmount ?? ''),
      advanceDeduction: String(editingBill.advanceDeduction ?? ''),
      netAmount: String(editingBill.netAmount ?? ''),
      settledAt: toDateTimeLocalValue(editingBill.settledAt),
      advancesSnapshot: prettySnapshot(editingBill.advancesSnapshot),
    });
  }, [editingBill]);

  const updateMutation = useMutation({
    mutationFn: async (billId: string) => {
      return apiClient.put(`/v1/payroll/history/${billId}`, {
        employeeName: formData.employeeName,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        dailyWage: Number(formData.dailyWage),
        presentDays: Number(formData.presentDays),
        doubledDays: Number(formData.doubledDays),
        absentDays: Number(formData.absentDays),
        grossAmount: Number(formData.grossAmount),
        advanceDeduction: Number(formData.advanceDeduction),
        netAmount: Number(formData.netAmount),
        settledAt: formData.settledAt || null,
        advancesSnapshot: formData.advancesSnapshot,
      });
    },
    onSuccess: async () => {
      setEditingBill(null);
      setFormData(emptyForm());
      await refetch();
    },
  });

  const openEdit = (bill: PayrollBill) => {
    setEditingBill(bill);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (editingBill) {
      updateMutation.mutate(editingBill.id);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="premium-surface flex flex-col gap-3 rounded-[2rem] p-5 md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            Archive
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">History</h1>
          <p className="mt-1 text-sm text-slate-600">
            Settled payroll bills are stored here and can be edited.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Bills update automatically after payroll settlement.
        </div>
      </div>

      {isLoading && (
        <div className="premium-card p-6 text-slate-600">Loading payroll history...</div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load payroll history. {error instanceof Error ? error.message : ''}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="premium-card p-4">
            <div className="text-sm text-gray-500">Bills</div>
            <div className="text-2xl font-bold text-gray-900">{bills.length}</div>
          </div>
          <div className="premium-card p-4">
            <div className="text-sm text-gray-500">Total Advances Deducted</div>
            <div className="text-2xl font-bold text-gray-900">
              ₹
              {bills
                .reduce((sum, bill) => sum + (Number(bill.advanceDeduction) || 0), 0)
                .toFixed(2)}
            </div>
          </div>
          <div className="premium-card p-4">
            <div className="text-sm text-gray-500">Total Net Payout</div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{bills.reduce((sum, bill) => sum + (Number(bill.netAmount) || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="premium-table-wrap overflow-x-auto">
          <table className="premium-table min-w-[900px]">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Days</th>
                <th>Advances</th>
                <th>Net</th>
                <th>Settled At</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No payroll history found.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-primary-50/50">
                    <td className="font-medium text-slate-900">
                      {bill.employeeName || bill.employeeId}
                    </td>
                    <td>
                      {bill.periodStart} to {bill.periodEnd}
                    </td>
                    <td>
                      P {bill.presentDays}, D {bill.doubledDays}, A {bill.absentDays}
                    </td>
                    <td>₹{bill.advanceDeduction?.toFixed?.(2) ?? bill.advanceDeduction}</td>
                    <td className="font-semibold text-slate-900">
                      ₹{bill.netAmount?.toFixed?.(2) ?? bill.netAmount}
                    </td>
                    <td className="text-slate-700">
                      {bill.settledAt ? new Date(bill.settledAt).toLocaleString() : '-'}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        onClick={() => openEdit(bill)}
                      >
                        Edit Bill
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Payroll Bill</h2>
              <button
                onClick={() => setEditingBill(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Employee Name</span>
                  <input
                    value={formData.employeeName}
                    onChange={(event) =>
                      setFormData({ ...formData, employeeName: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Settled At</span>
                  <input
                    type="datetime-local"
                    value={formData.settledAt}
                    onChange={(event) =>
                      setFormData({ ...formData, settledAt: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Period Start</span>
                  <input
                    type="date"
                    value={formData.periodStart}
                    onChange={(event) =>
                      setFormData({ ...formData, periodStart: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Period End</span>
                  <input
                    type="date"
                    value={formData.periodEnd}
                    onChange={(event) =>
                      setFormData({ ...formData, periodEnd: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Daily Wage</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dailyWage}
                    onChange={(event) =>
                      setFormData({ ...formData, dailyWage: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Gross Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.grossAmount}
                    onChange={(event) =>
                      setFormData({ ...formData, grossAmount: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Advance Deduction</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.advanceDeduction}
                    onChange={(event) =>
                      setFormData({ ...formData, advanceDeduction: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Net Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.netAmount}
                    onChange={(event) =>
                      setFormData({ ...formData, netAmount: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Present Days</span>
                  <input
                    type="number"
                    value={formData.presentDays}
                    onChange={(event) =>
                      setFormData({ ...formData, presentDays: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Double Days</span>
                  <input
                    type="number"
                    value={formData.doubledDays}
                    onChange={(event) =>
                      setFormData({ ...formData, doubledDays: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Absent Days</span>
                  <input
                    type="number"
                    value={formData.absentDays}
                    onChange={(event) =>
                      setFormData({ ...formData, absentDays: event.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-gray-700">Advances Snapshot</span>
                <textarea
                  rows={10}
                  value={formData.advancesSnapshot}
                  onChange={(event) =>
                    setFormData({ ...formData, advancesSnapshot: event.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditingBill(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Bill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
