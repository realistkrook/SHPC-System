import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { House, Profile, UserRole } from '../../types';

const AdminDashboardPage: React.FC = () => {
    return (
        <div className="space-y-12">
            <UserManagement />
            <AllowedEmails />
            <HouseManagement />
            <DangerZone />
        </div>
    );
};

const AllowedEmails = () => {
    const [items, setItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<UserRole>(UserRole.Student);

    const fetch = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await supabase.getAllowedEmails();
            setItems(data);
        } catch (err: any) {
            alert(`Failed to load allowed emails: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => { fetch(); }, [fetch]);

    const handleAdd = async () => {
        if (!email) return alert('Enter an email or domain (e.g. @aotea.school.nz)');
        try {
            await supabase.upsertAllowedEmail(email.toLowerCase().trim(), role);
            setEmail('');
            fetch();
        } catch (err: any) { alert(`Error: ${err.message}`); }
    };

    const handleDelete = async (e: string) => {
        if (!confirm(`Delete allowed entry ${e}?`)) return;
        try {
            await supabase.deleteAllowedEmail(e);
            fetch();
        } catch (err: any) { alert(`Error: ${err.message}`); }
    };

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Allowed Emails / Domain Access</h2>
            <p className="text-sm text-gray-400 mb-4">Manage explicit emails or domain entries (use '@aotea.school.nz' to allow a whole domain).</p>

            <div className="flex items-center space-x-2 mb-4">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email or @domain" className="bg-gray-700 border border-gray-600 rounded-md p-2 w-full" />
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="bg-gray-700 border border-gray-600 rounded-md p-2">
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={handleAdd} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md">Add</button>
            </div>

            {loading ? <div className="text-gray-400">Loading...</div> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900"><tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email/Domain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3" /></tr></thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {items.map(it => (
                                <tr key={it.email}>
                                    <td className="px-6 py-4 text-sm text-white">{it.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{it.role}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <button onClick={() => handleDelete(it.email)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const UserManagement = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        setError(null);
        try {
            const data = await supabase.getProfiles();
            setProfiles(data);
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleRoleChange = async (profileId: string, newRole: UserRole) => {
        try {
            await supabase.updateUserRole(profileId, newRole);
            fetchProfiles(); // Refresh
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-6">User Management</h2>
            {error && <div className="p-3 mb-4 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {profiles.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{p.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{p.email || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <select value={p.role} onChange={e => handleRoleChange(p.id, e.target.value as UserRole)} className="bg-gray-700 border border-gray-600 rounded-md p-1">
                                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const HouseManagement = () => {
    const [houses, setHouses] = useState<House[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [localPoints, setLocalPoints] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

    const fetchHouses = useCallback(async () => {
        setError(null);
        try {
            const data = await supabase.getHouses();
            setHouses(data);
            // Initialize local state
            const pointsMap: { [key: string]: string } = {};
            data.forEach(h => pointsMap[h.id] = h.points.toString());
            setLocalPoints(pointsMap);
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        fetchHouses();
    }, [fetchHouses]);

    const handlePointsChange = (houseId: string, val: string) => {
        setLocalPoints(prev => ({ ...prev, [houseId]: val }));
    };

    const handleSave = async (houseId: string) => {
        const val = localPoints[houseId];
        const newPoints = parseInt(val, 10);
        if (isNaN(newPoints)) return;

        setSaving(prev => ({ ...prev, [houseId]: true }));
        try {
            await supabase.updateHousePoints(houseId, newPoints);
            // Refresh to confirm
            await fetchHouses();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(prev => ({ ...prev, [houseId]: false }));
        }
    }

    const handleResetPoints = async (houseId: string) => {
        if (window.confirm("Are you sure you want to reset this house's points to 0?")) {
            try {
                await supabase.updateHousePoints(houseId, 0);
                fetchHouses();
            } catch (error: any) {
                alert(`Error: ${error.message}`);
            }
        }
    }

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-6">House Point Management</h2>
            {error && <div className="p-3 mb-4 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
            <div className="space-y-4">
                {houses.map(h => (
                    <div key={h.id} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                        <span className={`font-bold text-lg ${h.textColor}`}>{h.name}</span>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={localPoints[h.id] || ''}
                                onChange={e => handlePointsChange(h.id, e.target.value)}
                                className="w-24 bg-gray-700 border border-gray-600 rounded-md p-1 text-right text-white"
                            />
                            <button
                                onClick={() => handleSave(h.id)}
                                disabled={saving[h.id]}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-medium disabled:opacity-50"
                            >
                                {saving[h.id] ? 'Saving...' : 'Save'}
                            </button>
                            <div className="w-px h-6 bg-gray-700 mx-2"></div>
                            <button onClick={() => handleResetPoints(h.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs">Reset to 0</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const DangerZone = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleReset = async () => {
        setIsResetting(true);
        setError(null);
        try {
            await supabase.resetProject();
            alert('Project data has been reset successfully. You will now be logged out.');
            await supabase.signOut();
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsResetting(false);
        }
    };

    const isConfirmationMatching = confirmText === 'DELETE ALL DATA';

    return (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 border-4 border-red-500/50">
            <h2 className="text-3xl font-bold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-gray-400 mb-6">These actions are destructive and cannot be undone. Proceed with extreme caution.</p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-lg transition-colors"
            >
                Reset All Project Data
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-lg w-full border border-red-500">
                        <h3 className="text-2xl font-bold text-red-400 mb-4">Confirm Project Reset</h3>
                        <p className="text-gray-300 mb-4">
                            This will permanently delete all point requests, all user profiles (except your own admin account), and reset all house points to zero.
                        </p>
                        <p className="text-yellow-400 font-semibold mb-6">This action is irreversible.</p>

                        {error && <div className="p-3 mb-4 bg-red-500/20 text-red-300 rounded-md">{error}</div>}

                        <label htmlFor="confirm-text" className="block text-sm font-medium text-gray-300 mb-2">
                            To confirm, please type: <strong className="text-white">DELETE ALL DATA</strong>
                        </label>
                        <input
                            id="confirm-text"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                onClick={() => { setIsModalOpen(false); setError(null); }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={!isConfirmationMatching || isResetting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md disabled:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isResetting ? 'Resetting...' : 'I understand, reset everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminDashboardPage;