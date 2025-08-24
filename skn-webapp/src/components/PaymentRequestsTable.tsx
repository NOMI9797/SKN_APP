'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '../lib/admin';
import { PaymentRequest } from '../types';

interface PaymentRequestsTableProps {
  onRefresh: () => void;
}

export default function PaymentRequestsTable({ onRefresh }: PaymentRequestsTableProps) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPaymentRequests();
  }, [selectedStatus]);

  const loadPaymentRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await AdminService.getPaymentRequests(
        selectedStatus === 'all' ? undefined : selectedStatus
      );
      setPaymentRequests(requests);
    } catch (error) {
      console.error('Error loading payment requests:', error);
      setPaymentRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await AdminService.approvePaymentRequest(
        selectedRequest.$id,
        'admin_user_id', // This should come from auth context
        adminNotes
      );
      setIsModalOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      onRefresh();
      loadPaymentRequests();
    } catch (error) {
      console.error('Error approving payment request:', error);
      alert('Error approving payment request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await AdminService.rejectPaymentRequest(
        selectedRequest.$id,
        'admin_user_id', // This should come from auth context
        rejectionReason
      );
      setIsModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      onRefresh();
      loadPaymentRequests();
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      alert('Error rejecting payment request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openModal = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {paymentRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No payment requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentRequests.map((request) => (
                  <tr key={request.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{request.paymentType}</div>
                        <div className="text-sm text-gray-500">ID: {request.transactionId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.amount} PKR
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Review
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedRequest && (
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
            setAdminNotes('');
            setRejectionReason('');
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto relative z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Review Payment Request - {selectedRequest.userName}
                    </h3>
                  
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">User Information</h4>
                        <p className="text-sm text-gray-600">{selectedRequest.userName} ({selectedRequest.userEmail})</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Payment Details</h4>
                        <p className="text-sm text-gray-600">
                          Method: {selectedRequest.paymentType}<br/>
                          Amount: {selectedRequest.amount} PKR<br/>
                          Transaction ID: {selectedRequest.transactionId}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Screenshot</h4>
                        <img 
                          src={selectedRequest.screenshotUrl} 
                          alt="Payment Proof" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Add notes for the user..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Reason for rejection..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                    setRejectionReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
