'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '../lib/admin';
import { User, Pin } from '../types';

interface PinManagementProps {
  onRefresh: () => void;
  adminUser: User;
}

export default function PinManagement({ onRefresh, adminUser }: PinManagementProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pinsData, usersData] = await Promise.all([
        AdminService.getAllPins().catch(() => []), // Gracefully handle if pins collection doesn't exist
        AdminService.getAllUsers()
      ]);
      setPins(pinsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading PIN management data:', error);
      setPins([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePin = async () => {
    if (!adminUser) {
      alert('Admin user not found');
      return;
    }

    try {
      setIsGenerating(true);
      const newPins = await AdminService.generateBulkPins(generateCount, adminUser.$id);
      console.log('Generated pins:', newPins);
      await loadData(); // Reload the data
      onRefresh();
      alert(`Successfully generated ${generateCount} new PINs`);
    } catch (error) {
      console.error('Error generating PINs:', error);
      alert('Error generating PINs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignPin = async (pinId: string, userId: string) => {
    try {
      await AdminService.assignPinToUser(pinId, userId);
      await loadData();
      onRefresh();
      alert('PIN assigned successfully');
    } catch (error) {
      console.error('Error assigning PIN:', error);
      alert('Error assigning PIN: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-green-100 text-green-800';
      case 'unused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnassignedUsers = () => {
    return users.filter(user => 
      user.paymentStatus === 'approved' && 
      !user.referralPin && 
      user.isActive
    );
  };

  const getUnusedPins = () => {
    return pins.filter(pin => pin.status === 'unused');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PIN Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New PINs</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="1"
            max="100"
            value={generateCount}
            onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
            className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600">PINs</span>
          <button
            onClick={handleGeneratePin}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate PINs'}
          </button>
        </div>
      </div>

      {/* Users Needing PINs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Users Needing PINs</h3>
        <div className="space-y-4">
          {getUnassignedUsers().length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users need PINs at the moment.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                <div>User</div>
                <div>Email</div>
                <div>Payment Status</div>
                <div>PIN Status</div>
              </div>
              {getUnassignedUsers().map((user) => (
                <div key={user.$id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-2 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                  <div className="text-gray-600">{user.email}</div>
                  <div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      No PIN
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Manual PIN Assignment */}
      {getUnassignedUsers().length > 0 && getUnusedPins().length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manual PIN Assignment</h3>
          <div className="space-y-4">
            {getUnassignedUsers().slice(0, 5).map((user) => (
              <div key={user.$id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignPin(e.target.value, user.$id);
                    }
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Select PIN</option>
                  {getUnusedPins().map((pin) => (
                    <option key={pin.$id} value={pin.$id}>
                      {pin.pinCode}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIN Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total PINs</h3>
          <p className="text-3xl font-bold text-blue-600">{pins.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unused PINs</h3>
          <p className="text-3xl font-bold text-gray-600">{pins.filter(p => p.status === 'unused').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assigned PINs</h3>
          <p className="text-3xl font-bold text-blue-600">{pins.filter(p => p.status === 'assigned').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Used PINs</h3>
          <p className="text-3xl font-bold text-green-600">{pins.filter(p => p.status === 'used').length}</p>
        </div>
      </div>

      {/* PINs Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All PINs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIN Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No PINs generated yet. Click "Generate First PIN" to get started.
                  </td>
                </tr>
              ) : (
                pins.map((pin) => {
                  const assignedUser = users.find(user => user.referralPin === pin.pinCode);
                  return (
                    <tr key={pin.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pin.pinCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pin.status)}`}>
                          {pin.status.charAt(0).toUpperCase() + pin.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignedUser ? (assignedUser.name || assignedUser.email) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pin.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate First PIN Button */}
      {pins.length === 0 && (
        <div className="text-center py-8">
          <button
            onClick={handleGeneratePin}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-lg"
          >
            {isGenerating ? 'Generating...' : 'Generate First PIN'}
          </button>
        </div>
      )}
    </div>
  );
}
