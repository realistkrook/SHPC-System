import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseService';
import { House, PointRequest, PointRequestStatus } from '../../types';

const LeaderDashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabase.getPointRequests();
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
      await supabase.approveRequest(requestId);
      fetchRequests(); // Refresh list
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await supabase.rejectRequest(requestId);
      fetchRequests(); // Refresh list
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === PointRequestStatus.Pending);

  return (
    <div className="space-y-12">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Pending Approval Queue</h2>
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

      <AddManualPointsForm />
    </div>
  );
};


const AddManualPointsForm: React.FC = () => {
    const [houses, setHouses] = useState<House[]>([]);
    const [selectedHouse, setSelectedHouse] = useState('');
    const [points, setPoints] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHouses = async () => {
            setFormError(null);
            try {
                const houseData = await supabase.getHouses();
                setHouses(houseData);
                if(houseData.length > 0) setSelectedHouse(houseData[0].id);
            } catch (err: any) {
                setFormError(err.message);
            }
        }
        fetchHouses();
    }, []);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedHouse || !points || !reason) {
            setMessage({type: 'error', text: 'Please fill all fields.'});
            return;
        }
        setSubmitting(true);
        setMessage(null);
        try {
            await supabase.addManualPoints(selectedHouse, parseInt(points, 10), reason);
            setMessage({type: 'success', text: 'Points added successfully!'});
            setPoints('');
            setReason('');
        } catch (error: any) {
            setMessage({type: 'error', text: error.message});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Add Manual Points</h2>
            <p className="text-sm text-gray-400 mb-6">Use for large events like Sports Day. This adds points directly.</p>
            {formError && <div className="p-3 mb-4 rounded-md text-sm bg-red-800/50 text-red-300">{formError}</div>}
            <form onSubmit={handleManualSubmit} className="space-y-6">
                <select value={selectedHouse} onChange={e => setSelectedHouse(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white" disabled={!!formError}>
                    {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                <input type="number" value={points} onChange={e => setPoints(e.target.value)} placeholder="Points" className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white" disabled={!!formError} />
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (e.g., Sports Day Winner)" className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white" disabled={!!formError}/>
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                    {message.text}
                    </div>
                )}
                <button type="submit" disabled={submitting || !!formError} className="w-full py-3 px-4 rounded-md text-white bg-[#007971] hover:bg-teal-700 disabled:opacity-50">
                    {submitting ? "Adding..." : "Add Points"}
                </button>
            </form>
        </div>
    );
}


export default LeaderDashboardPage;