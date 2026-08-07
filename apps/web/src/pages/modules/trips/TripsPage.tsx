'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Trip {
  id: string;
  route: string;
  tripDate: string;
  startTime: string;
  endTime?: string;
  companyName?: string;
  driverId: string;
  vehicleId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface Employee {
  id: string;
  fullName: string;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
}

type TripFormData = {
  route: string;
  tripDate: string;
  startTime: string;
  companyName: string;
  driverId: string;
  vehicleId: string;
  status: Trip['status'];
};

export default function TripsPage() {
  const apiClient = useApiClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<TripFormData>({
    route: '',
    tripDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    companyName: '',
    driverId: '',
    vehicleId: '',
    status: 'PENDING' as Trip['status'],
  });

  // Fetch trips
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      return apiClient.get('/v1/trips');
    },
  });

  // Parse response properly
  const trips = useMemo(() => {
    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }, [response]);

  // Filtered trips based on search
  const filteredTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driverId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trips, searchQuery]);

  // Fetch employees and vehicles for dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const empResponse = await apiClient.get('/v1/employees');
        const vehicleResponse = await apiClient.get('/v1/vehicles');

        if (empResponse.success && Array.isArray(empResponse.data)) {
          setEmployees(empResponse.data);
        }
        if (vehicleResponse.success && Array.isArray(vehicleResponse.data)) {
          setVehicles(vehicleResponse.data);
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchDropdowns();
  }, [apiClient]);

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      if (isEditing && selectedTrip) {
        return apiClient.put(`/v1/trips/${selectedTrip.id}`, data);
      }
      return apiClient.post('/v1/trips', data);
    },
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/v1/trips/${id}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      route: '',
      tripDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      companyName: '',
      driverId: '',
      vehicleId: '',
      status: 'PENDING',
    });
    setIsEditing(false);
    setSelectedTrip(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route.trim()) {
      alert('Route is required');
      return;
    }
    if (!formData.driverId) {
      alert('Driver is required');
      return;
    }
    if (!formData.vehicleId) {
      alert('Vehicle is required');
      return;
    }

    // Convert date and time to ISO format OffsetDateTime
    const startDateTime = `${formData.tripDate}T${formData.startTime}:00+00:00`;

    const payload: TripFormData = {
      ...formData,
      startTime: startDateTime,
    };

    createMutation.mutate(payload);
  };

  const handleEdit = (trip: Trip) => {
    setSelectedTrip(trip);
    setFormData({
      route: trip.route,
      tripDate: trip.tripDate,
      startTime: trip.startTime,
      companyName: trip.companyName || '',
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      status: trip.status,
    });
    setIsEditing(true);
  };

  const handleDelete = (trip: Trip) => {
    if (confirm(`Delete trip ${trip.route}?`)) {
      deleteMutation.mutate(trip.id);
    }
  };

  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.fullName || id;
  };

  const getVehicleNumber = (id: string) => {
    return vehicles.find((v) => v.id === id)?.vehicleNumber || id;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-gray-600">Loading trips...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">Error loading trips. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
        <Button
          variant="primary"
          onClick={() => {
            if (isEditing) {
              resetForm();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? '✕ Cancel' : '+ Create Trip'}
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedTrip ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Route"
                placeholder="e.g., Delhi to Mumbai"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                required
              />
              <Input
                label="Trip Date"
                type="date"
                value={formData.tripDate}
                onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })}
                required
              />
              <Input
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <Input
                label="Company Name"
                placeholder="e.g., ABC Logistics"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Trip['status'] })
                  }
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Driver</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((veh) => (
                    <option key={veh.id} value={veh.id}>
                      {veh.vehicleNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="success" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? 'Saving...'
                  : selectedTrip
                    ? 'Update Trip'
                    : 'Create Trip'}
              </Button>
              {selectedTrip && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Search Section */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Driver</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip) => (
              <tr key={trip.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{trip.route}</td>
                <td className="px-6 py-3">{trip.tripDate}</td>
                <td className="px-6 py-3">{getEmployeeName(trip.driverId)}</td>
                <td className="px-6 py-3">{getVehicleNumber(trip.vehicleId)}</td>
                <td className="px-6 py-3">{trip.companyName || '-'}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      trip.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : trip.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : trip.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {trip.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(trip)}
                      className="text-blue-600"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trip)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrips.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchQuery ? 'No trips match your search' : 'No trips found'}
          </div>
        )}
      </div>
    </div>
  );
}
