'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/useApiClient';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'TRUCK' | 'VAN' | 'PICKUP' | 'TANKER';
  capacity: number;
  active: boolean;
}

type VehicleFormData = {
  vehicleNumber: string;
  type: Vehicle['type'];
  capacity: number;
  active: boolean;
};

export default function VehiclesPage() {
  const apiClient = useApiClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: '',
    type: 'TRUCK' as Vehicle['type'],
    capacity: 1,
    active: true,
  });

  // Fetch vehicles
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      return apiClient.get('/v1/vehicles');
    },
  });

  // Parse response properly
  const vehicles = useMemo(() => {
    if (response?.success && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }, [response]);

  // Filtered vehicles based on search
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) =>
      vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, searchQuery]);

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      if (isEditing && selectedVehicle) {
        return apiClient.put(`/v1/vehicles/${selectedVehicle.id}`, data);
      }
      return apiClient.post('/v1/vehicles', data);
    },
    onSuccess: () => {
      refetch();
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/v1/vehicles/${id}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      type: 'TRUCK',
      capacity: 1,
      active: true,
    });
    setIsEditing(false);
    setSelectedVehicle(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim()) {
      alert('Vehicle Number is required');
      return;
    }
    if (formData.capacity < 1) {
      alert('Capacity must be at least 1');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      capacity: vehicle.capacity,
      active: vehicle.active,
    });
    setIsEditing(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Delete vehicle ${vehicle.vehicleNumber}?`)) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-gray-600">Loading vehicles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">Error loading vehicles. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
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
          {isEditing ? '✕ Cancel' : '+ Add Vehicle'}
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEditing && selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vehicle Number"
                placeholder="e.g., DL-01-AB-1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as Vehicle['type'] })
                  }
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="TANKER">Tanker</option>
                </select>
              </div>
              <Input
                label="Capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.value === 'active' })
                  }
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="success" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? 'Saving...'
                  : selectedVehicle
                    ? 'Update Vehicle'
                    : 'Add Vehicle'}
              </Button>
              {selectedVehicle && (
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
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Vehicle Number</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Capacity</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b hover:bg-gray-50 text-gray-900">
                <td className="px-6 py-4 font-medium">{vehicle.vehicleNumber}</td>
                <td className="px-6 py-4">{vehicle.type}</td>
                <td className="px-6 py-4">{vehicle.capacity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      vehicle.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                      className="text-blue-600"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(vehicle)}
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
        {filteredVehicles.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchQuery
              ? 'No vehicles match your search'
              : 'No vehicles found. Create one to get started.'}
          </div>
        )}
      </div>
    </div>
  );
}
