'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@worketa/api';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';

interface EmployeeData {
  id: string;
  fullName: string;
  type: string;
  dailyWage: number;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;
  type: 'PRESENT' | 'ABSENT' | 'WORKED_DOUBLE';
  wageForDay: number;
}

type PendingAttendanceEntry = {
  employeeId: string;
  type: AttendanceRecord['type'];
  employeeWage: number;
  id?: string;
};

export default function AttendancePage() {
  const apiClient = useApiClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAttendance, setPendingAttendance] = useState<
    Record<string, PendingAttendanceEntry>
  >({});
  const [attendanceMap, setAttendanceMap] = useState<{
    [key: string]: AttendanceRecord;
  }>({});

  // Fetch employees
  const { data: empResponse, isLoading: empLoading } = useQuery<ApiResponse<EmployeeData[]>>({
    queryKey: ['employees'],
    queryFn: async () => {
      return apiClient.get('/v1/employees');
    },
  });

  const employees = useMemo(() => {
    if (empResponse?.success && Array.isArray(empResponse.data)) {
      return empResponse.data;
    }
    return [];
  }, [empResponse]);

  // Fetch attendance records for selected date
  const { data: attResponse, refetch: refetchAttendance } = useQuery<
    ApiResponse<AttendanceRecord[]>
  >({
    queryKey: ['attendance', selectedDate],
    queryFn: async () => {
      return apiClient.get(`/v1/attendance?date=${selectedDate}`);
    },
  });

  const attendanceRecords = useMemo(() => {
    if (attResponse?.success && Array.isArray(attResponse.data)) {
      const map: { [key: string]: AttendanceRecord } = {};
      attResponse.data.forEach((record) => {
        map[record.employeeId] = record;
      });
      return map;
    }
    return {};
  }, [attResponse]);

  const confirmAllAttendance = async () => {
    const entries = Object.values(pendingAttendance);

    try {
      await Promise.all(entries.map((entry) => markAttendanceMutation.mutateAsync(entry)));

      setPendingAttendance({});
      await refetchAttendance();
    } catch (err) {
      console.error('Attendance update failed', err);
    }
  };

  // Update attendance map when records change
  useEffect(() => {
    setAttendanceMap(attendanceRecords);
  }, [attendanceRecords]);

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({
      employeeId,
      type,
      employeeWage,
    }: {
      employeeId: string;
      type: 'PRESENT' | 'ABSENT' | 'WORKED_DOUBLE';
      employeeWage: number;
    }) => {
      const wageForDay =
        type === 'PRESENT' ? employeeWage : type === 'WORKED_DOUBLE' ? employeeWage * 2 : 0;

      const payload = {
        employeeId,
        attendanceDate: selectedDate,
        type,
        wageForDay,
      };

      const existing = attendanceMap[employeeId];

      if (existing?.id) {
        return apiClient.put(`/v1/attendance/${existing.id}`, payload);
      }

      return apiClient.post('/v1/attendance', payload);
    },
    onSuccess: async () => {
      await refetchAttendance();
      setPendingAttendance({});
    },
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const handleMarkAttendance = (
    employeeId: string,
    type: AttendanceRecord['type'],
    wage: number
  ) => {
    setPendingAttendance((prev) => {
      const existing = attendanceMap[employeeId];
      return {
        ...prev,
        [employeeId]: {
          employeeId,
          type,
          wageForDay: type === 'PRESENT' ? wage : type === 'WORKED_DOUBLE' ? wage * 2 : 0,
          id: existing?.id, // IMPORTANT for update vs create
        },
      };
    });
  };

  if (empLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-gray-600">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Search Section */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Attendance Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {Object.values(attendanceMap).filter((a) => a.type === 'PRESENT').length}
          </div>
          <div className="text-gray-600 text-sm mt-1">Present</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-600">
            {Object.values(attendanceMap).filter((a) => a.type === 'ABSENT').length}
          </div>
          <div className="text-gray-600 text-sm mt-1">Absent</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {Object.values(attendanceMap).filter((a) => a.type === 'WORKED_DOUBLE').length}
          </div>
          <div className="text-gray-600 text-sm mt-1">Worked Double</div>
        </div>
      </div>

      {/* Employees Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Employee</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Daily Wage</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => {
              const attendance = pendingAttendance[employee.id] || attendanceMap[employee.id];
              return (
                <tr key={employee.id} className="border-b hover:bg-gray-50 text-gray-900">
                  <td className="px-6 py-4 font-medium">{employee.fullName}</td>
                  <td className="px-6 py-4">₹{employee.dailyWage?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4">
                    {attendance ? (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          attendance.type === 'PRESENT'
                            ? 'bg-green-100 text-green-800'
                            : attendance.type === 'ABSENT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {attendance.type}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not marked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <Button
                        variant={attendance?.type === 'PRESENT' ? 'success' : 'ghost'}
                        size="sm"
                        onClick={() =>
                          handleMarkAttendance(employee.id, 'PRESENT', employee.dailyWage || 0)
                        }
                        disabled={markAttendanceMutation.isPending}
                        className={attendance?.type === 'PRESENT' ? '' : 'text-green-600'}
                      >
                        Present
                      </Button>
                      <Button
                        variant={attendance?.type === 'ABSENT' ? 'success' : 'ghost'}
                        size="sm"
                        onClick={() =>
                          handleMarkAttendance(employee.id, 'ABSENT', employee.dailyWage || 0)
                        }
                        disabled={markAttendanceMutation.isPending}
                        className={attendance?.type === 'ABSENT' ? '' : 'text-red-600'}
                      >
                        Absent
                      </Button>
                      <Button
                        variant={attendance?.type === 'WORKED_DOUBLE' ? 'success' : 'ghost'}
                        size="sm"
                        onClick={() =>
                          handleMarkAttendance(
                            employee.id,
                            'WORKED_DOUBLE',
                            employee.dailyWage || 0
                          )
                        }
                        disabled={markAttendanceMutation.isPending}
                        className={attendance?.type === 'WORKED_DOUBLE' ? '' : 'text-blue-600'}
                      >
                        Double
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FIXED ACTION BAR */}
        {Object.keys(pendingAttendance).length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white shadow-lg border rounded-xl p-4 flex items-center gap-4">
            <div className="text-sm text-gray-700">
              <strong>{Object.keys(pendingAttendance).length}</strong> changes pending
            </div>

            <Button onClick={confirmAllAttendance} className="bg-blue-600 text-white px-4 py-2">
              Update Attendance
            </Button>
          </div>
        )}
        {filteredEmployees.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchQuery ? 'No employees match your search' : 'No employees found'}
          </div>
        )}
      </div>
    </div>
  );
}
