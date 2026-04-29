import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/apiService';
import { PointRequest, PointRequestStatus } from '../../types';

const LeaderDashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPointRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      await api.approveRequest(requestId);
      fetchRequests(); // Refresh list
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.rejectRequest(requestId);
      fetchRequests(); // Refresh list
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === PointRequestStatus.Pending);

  return (
    <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Pending Approval Queue</h2>
      <p className="text-sm text-gray-400 mb-6">
        Whanau leaders can review and action teacher submissions. Manual score changes remain admin-only.
      </p>
      {error && <div className="p-3 mb-4 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
      {loading ? <p className="text-gray-400">Loading requests...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
             <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teacher</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">House</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {pendingRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{req.teacher_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.house_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-xs truncate">{req.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleApprove(req.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs">Approve</button>
                    <button onClick={() => handleReject(req.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingRequests.length === 0 && !error && <p className="text-center text-gray-400 py-8">No pending requests.</p>}
        </div>
      )}
    </div>
  );
};

export default LeaderDashboardPage;
