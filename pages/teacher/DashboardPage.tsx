import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseService';
import { useAuth } from '../../hooks/useAuth';
import { House, PointRequest, PointRequestStatus } from '../../types';

const TeacherDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [myRequests, setMyRequests] = useState<PointRequest[]>([]);
  
  // Form state
  const [selectedHouse, setSelectedHouse] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!profile) return;
    setPageError(null);
    try {
      const houseData = await supabase.getHouses();
      setHouses(houseData);
      if (houseData.length > 0) {
        setSelectedHouse(houseData[0].id);
      }
      const requestData = await supabase.getPointRequests();
      setMyRequests(requestData);
    } catch (err: any) {
      setPageError(err.message);
    }
  }, [profile]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedHouse || !points || !reason) {
      setMessage({type: 'error', text: 'Please fill out all fields.'});
      return;
    }
    setSubmitting(true);
    setMessage(null);

    try {
      await supabase.submitPointRequest({
        house_id: selectedHouse,
        points: parseInt(points, 10),
        reason,
      });
      setMessage({type: 'success', text: 'Point request submitted successfully!'});
      setPoints('');
      setReason('');
      // Refresh my requests
      const requestData = await supabase.getPointRequests();
      setMyRequests(requestData);
    } catch (error: any) {
      setMessage({type: 'error', text: error.message || 'Failed to submit request.'});
    } finally {
      setSubmitting(false);
    }
  };
  
  const statusColor = (status: PointRequestStatus) => {
    switch(status) {
        case PointRequestStatus.Approved: return 'text-green-400 bg-green-900/50';
        case PointRequestStatus.Rejected: return 'text-red-400 bg-red-900/50';
        case PointRequestStatus.Pending: return 'text-yellow-400 bg-yellow-900/50';
    }
  }

  if (pageError) {
    return (
        <div className="p-4 bg-red-800/50 text-red-300 rounded-md shadow-lg">
            <h3 className="font-bold text-lg mb-2">Error loading page data</h3>
            <p className="font-mono text-sm">{pageError}</p>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Submit Point Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="house" className="block text-sm font-medium text-gray-300 mb-2">House</label>
            <select
              id="house"
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#007971]"
            >
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-300 mb-2">Points</label>
            <input
              type="number"
              id="points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#007971]"
              placeholder="e.g., 10"
              min="1"
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#007971]"
              placeholder="e.g., Excellent work in class"
            />
          </div>
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
              {message.text}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#007971] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h2 className="text-3xl font-bold text-white mb-6">My Past Submissions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">House</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {myRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(req.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.house_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-xs truncate">{req.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {myRequests.length === 0 && <p className="text-center text-gray-400 py-8">You haven't submitted any requests yet.</p>}
      </div>
    </div>
  );
};

export default TeacherDashboardPage;