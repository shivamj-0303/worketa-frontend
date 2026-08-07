import { useMemo, useState, type TouchEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Employee {
  id: string;
  fullName: string;
  phone: string;
  type: 'DRIVER' | 'ASSISTANT';
  joiningDate: string;
  active: boolean;
  dailyWage?: number;
}

type AttendanceType = 'PRESENT' | 'ABSENT' | 'WORKED_DOUBLE';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;
  type: AttendanceType;
  wageForDay: number;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

type CalendarCell = {
  date: string | null;
  dayNumber: number | null;
  type?: AttendanceType;
};

const attendanceTheme: Record<
  AttendanceType,
  { label: string; className: string; chipClass: string }
> = {
  PRESENT: {
    label: 'Present',
    className: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  ABSENT: {
    label: 'Absent',
    className: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
    chipClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  WORKED_DOUBLE: {
    label: 'Worked Double',
    className: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
    chipClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function shiftMonth(date: Date, delta: number) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + delta);
  return next;
}

function buildCalendarCells(
  month: Date,
  attendanceByDate: Record<string, AttendanceType>
): CalendarCell[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ date: null, dayNumber: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ date: isoDate, dayNumber: day, type: attendanceByDate[isoDate] });
  }

  return cells;
}

export default function EmployeesPage() {
  const apiClient = useApiClient();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceEmployee, setAttendanceEmployee] = useState<Employee | null>(null);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    type: 'DRIVER' as 'DRIVER' | 'ASSISTANT',
    joiningDate: new Date().toISOString().split('T')[0],
    dailyWage: '',
  });

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => apiClient.get('/v1/employees'),
  });

  const employees = useMemo(() => {
    const apiResponse = response as ApiResponse<Employee[]> | undefined;
    return apiResponse?.success && Array.isArray(apiResponse.data) ? apiResponse.data : [];
  }, [response]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp: Employee) =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm)
    );
  }, [employees, searchTerm]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      fullName: string;
      phone: string;
      type: 'DRIVER' | 'ASSISTANT';
      joiningDate: string;
      dailyWage: number;
    }) => {
      if (isEditing && selectedEmployee) {
        return apiClient.put(`/v1/employees/${selectedEmployee.id}`, data);
      }

      return apiClient.post('/v1/employees', data);
    },
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/employees/${id}`),
    onSuccess: () => refetch(),
  });

  const openAttendanceCalendar = (employee: Employee) => {
    setAttendanceEmployee(employee);
    setAttendanceMonth(new Date());
    setTouchStartX(null);
  };

  const closeAttendanceCalendar = () => {
    setAttendanceEmployee(null);
    setTouchStartX(null);
  };

  const attendanceMonthKey = formatMonthKey(attendanceMonth);

  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    isError: attendanceError,
  } = useQuery({
    queryKey: ['employee-attendance', attendanceEmployee?.id, attendanceMonthKey],
    enabled: Boolean(attendanceEmployee?.id),
    queryFn: async () =>
      apiClient.get(
        `/v1/attendance/employee/${attendanceEmployee?.id}?month=${attendanceMonthKey}`
      ),
  });

  const attendanceRecords = useMemo(() => {
    const apiResponse = attendanceResponse as ApiResponse<AttendanceRecord[]> | undefined;
    return apiResponse?.success && Array.isArray(apiResponse.data) ? apiResponse.data : [];
  }, [attendanceResponse]);

  const attendanceByDate = useMemo(() => {
    return attendanceRecords.reduce<Record<string, AttendanceType>>((map, record) => {
      map[record.attendanceDate] = record.type;
      return map;
    }, {});
  }, [attendanceRecords]);

  const calendarCells = useMemo(
    () => buildCalendarCells(attendanceMonth, attendanceByDate),
    [attendanceByDate, attendanceMonth]
  );

  const attendanceCounts = useMemo(
    () => ({
      PRESENT: attendanceRecords.filter((record) => record.type === 'PRESENT').length,
      ABSENT: attendanceRecords.filter((record) => record.type === 'ABSENT').length,
      WORKED_DOUBLE: attendanceRecords.filter((record) => record.type === 'WORKED_DOUBLE').length,
    }),
    [attendanceRecords]
  );

  const handleCalendarSwipeEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) > 55) {
      setAttendanceMonth((currentMonth) => shiftMonth(currentMonth, deltaX > 0 ? -1 : 1));
    }

    setTouchStartX(null);
  };

  const handleCreate = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      fullName: formData.fullName,
      phone: formData.phone,
      type: formData.type,
      joiningDate: formData.joiningDate,
      dailyWage: formData.dailyWage ? parseFloat(formData.dailyWage) : 0,
    });
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      phone: employee.phone,
      type: employee.type,
      joiningDate: employee.joiningDate,
      dailyWage: employee.dailyWage?.toString() || '',
    });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      type: 'DRIVER',
      joiningDate: new Date().toISOString().split('T')[0],
      dailyWage: '',
    });
    setIsCreating(false);
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-600">Loading employees...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="premium-surface flex flex-col gap-4 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            People
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage employee profiles and open an attendance calendar from the list.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          variant="primary"
        >
          {isCreating ? '✕ Cancel' : '+ Add Employee'}
        </Button>
      </div>

      {isCreating && (
        <div className="premium-card space-y-4 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h2>

          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 9876543210"
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'DRIVER' | 'ASSISTANT' })
                }
                className="premium-input bg-white"
              >
                <option value="DRIVER">Driver</option>
                <option value="ASSISTANT">Assistant</option>
              </select>
            </div>

            <Input
              label="Daily Wage (₹)"
              type="number"
              value={formData.dailyWage}
              onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
              placeholder="500"
            />
          </div>

          <Input
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            required
          />

          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              variant="success"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {isEditing ? 'Update Employee' : 'Create Employee'}
            </Button>
            <Button onClick={resetForm} variant="ghost" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="premium-card p-4 md:p-5">
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="premium-table-wrap overflow-x-auto">
        <table className="premium-table min-w-[1200px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Daily Wage</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Attendance</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                  {searchTerm
                    ? 'No employees found'
                    : 'No employees yet. Create one to get started.'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp: Employee) => (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-primary-50/50">
                  <td className="font-medium text-slate-900">{emp.fullName}</td>
                  <td className="text-slate-600">{emp.phone}</td>
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${emp.type === 'DRIVER' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'}`}
                    >
                      {emp.type}
                    </span>
                  </td>
                  <td className="text-slate-600">₹{emp.dailyWage || 0}</td>
                  <td className="text-slate-600">
                    {new Date(emp.joiningDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${emp.active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}
                    >
                      {emp.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => openAttendanceCalendar(emp)}>
                      View Calendar
                    </Button>
                  </td>
                  <td className="space-x-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(emp)}
                      disabled={createMutation.isPending || deleteMutation.isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(emp.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {attendanceEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            className="premium-surface max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem]"
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
            onTouchEnd={handleCalendarSwipeEnd}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
                  Attendance calendar
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {attendanceEmployee.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Swipe left or right to move between months.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeAttendanceCalendar}>
                Close
              </Button>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.4fr_0.9fr] md:px-6">
              <div className="premium-card space-y-4 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttendanceMonth((current) => shiftMonth(current, -1))}
                  >
                    ←
                  </Button>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
                      Month
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">
                      {formatMonthLabel(attendanceMonth)}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttendanceMonth((current) => shiftMonth(current, 1))}
                  >
                    →
                  </Button>
                </div>

                {attendanceLoading ? (
                  <div className="flex min-h-[360px] items-center justify-center text-slate-600">
                    Loading attendance...
                  </div>
                ) : attendanceError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                    Could not load attendance for this month.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarCells.map((cell, index) => {
                        if (!cell.date || !cell.dayNumber) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/60"
                            />
                          );
                        }

                        const theme = cell.type ? attendanceTheme[cell.type] : undefined;

                        return (
                          <div
                            key={cell.date}
                            className={`min-h-20 rounded-2xl border p-2 transition ${theme ? `${theme.className} border-transparent` : 'border-slate-200 bg-white'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {cell.dayNumber}
                              </span>
                              {cell.type && (
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                  {attendanceTheme[cell.type].label}
                                </span>
                              )}
                            </div>
                            {cell.type ? (
                              <div className="mt-3 text-xs font-medium text-slate-700">
                                {attendanceTheme[cell.type].label}
                              </div>
                            ) : (
                              <div className="mt-3 text-xs text-slate-400">No mark</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="premium-card space-y-3 p-4 md:p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Month summary
                  </h3>
                  <div className="grid gap-3">
                    {(Object.keys(attendanceTheme) as AttendanceType[]).map((type) => (
                      <div
                        key={type}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${attendanceTheme[type].chipClass}`}
                      >
                        <span className="text-sm font-medium">{attendanceTheme[type].label}</span>
                        <span className="text-lg font-black text-slate-900">
                          {attendanceCounts[type]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="premium-card space-y-3 p-4 md:p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Legend
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(attendanceTheme) as AttendanceType[]).map((type) => (
                      <div key={type} className="flex items-center gap-3">
                        <span
                          className={`h-4 w-4 rounded-full ${attendanceTheme[type].className}`}
                        />
                        <span className="text-sm text-slate-700">
                          {attendanceTheme[type].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
