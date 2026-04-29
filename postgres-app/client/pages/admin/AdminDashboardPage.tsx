import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { IGExportTemplate } from '../../components/IGExportTemplate';
import { TVExportTemplate } from '../../components/TVExportTemplate';
import { api } from '../../services/apiService';
import { House, Profile, StaffAccountInput, UserRole } from '../../types';

const staffRoleOptions = [UserRole.Admin, UserRole.WhanauLeader, UserRole.Teacher];

const emptyAccountForm: StaffAccountInput = {
  full_name: '',
  email: '',
  role: UserRole.Teacher,
  password: '',
};

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <StaffAccountsSection />
      <AllowedEmailsSection />
      <HouseManagementSection />
      <ManualPointsSection />
      <ExportAssetsSection />
      <DangerZoneSection />
    </div>
  );
};

const StaffAccountsSection: React.FC = () => {
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [accountForm, setAccountForm] = useState<StaffAccountInput>(emptyAccountForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [rowDrafts, setRowDrafts] = useState<Record<string, { full_name: string; email: string; role: UserRole; is_active: boolean }>>({});

  const syncDrafts = useCallback((nextAccounts: Profile[]) => {
    setRowDrafts(
      nextAccounts.reduce<Record<string, { full_name: string; email: string; role: UserRole; is_active: boolean }>>((acc, account) => {
        acc[account.id] = {
          full_name: account.full_name,
          email: account.email || '',
          role: account.role,
          is_active: account.is_active,
        };
        return acc;
      }, {})
    );
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStaffAccounts();
      setAccounts(data);
      syncDrafts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  }, [syncDrafts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      await api.createStaffAccount(accountForm);
      setAccountForm(emptyAccountForm);
      setMessage('Staff account created successfully.');
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to create staff account');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveAccount = async (accountId: string) => {
    const draft = rowDrafts[accountId];
    if (!draft) {
      return;
    }

    setSavingId(accountId);
    setError(null);
    setMessage(null);

    try {
      await api.updateStaffAccount(accountId, draft);
      setMessage('Staff account updated successfully.');
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to update staff account');
    } finally {
      setSavingId(null);
    }
  };

  const handleResetPassword = async (accountId: string) => {
    const password = passwordDrafts[accountId];
    if (!password) {
      setError('Enter a new password before resetting an account password.');
      return;
    }

    setSavingId(accountId);
    setError(null);
    setMessage(null);

    try {
      await api.resetStaffPassword(accountId, password);
      setPasswordDrafts((prev) => ({ ...prev, [accountId]: '' }));
      setMessage('Password reset successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Staff Accounts</h2>
        <p className="text-sm text-gray-400">
          Real staff access is now managed through hashed passwords, active accounts, and role-based server permissions.
        </p>
      </div>

      {error && <div className="p-3 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
      {message && <div className="p-3 rounded-md text-sm bg-green-800/50 text-green-300">{message}</div>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <input
          value={accountForm.full_name}
          onChange={(event) => setAccountForm((prev) => ({ ...prev, full_name: event.target.value }))}
          placeholder="Full name"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
          required
        />
        <input
          value={accountForm.email}
          onChange={(event) => setAccountForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="name@aotea.school.nz"
          type="email"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
          required
        />
        <select
          value={accountForm.role}
          onChange={(event) => setAccountForm((prev) => ({ ...prev, role: event.target.value as StaffAccountInput['role'] }))}
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
        >
          {staffRoleOptions.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <input
          value={accountForm.password}
          onChange={(event) => setAccountForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Temporary password"
          type="password"
          minLength={10}
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="md:col-span-2 xl:col-span-4 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating account...' : 'Create staff account'}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Loading staff accounts...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Password reset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {accounts.map((account) => {
                const draft = rowDrafts[account.id];
                return (
                  <tr key={account.id}>
                    <td className="px-4 py-4">
                      <input
                        value={draft?.full_name || ''}
                        onChange={(event) => setRowDrafts((prev) => ({
                          ...prev,
                          [account.id]: { ...(prev[account.id] || draft), full_name: event.target.value },
                        }))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        value={draft?.email || ''}
                        onChange={(event) => setRowDrafts((prev) => ({
                          ...prev,
                          [account.id]: { ...(prev[account.id] || draft), email: event.target.value },
                        }))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={draft?.role || account.role}
                        onChange={(event) => setRowDrafts((prev) => ({
                          ...prev,
                          [account.id]: { ...(prev[account.id] || draft), role: event.target.value as UserRole },
                        }))}
                        className="bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                      >
                        {staffRoleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={draft?.is_active ?? account.is_active}
                          onChange={(event) => setRowDrafts((prev) => ({
                            ...prev,
                            [account.id]: { ...(prev[account.id] || draft), is_active: event.target.checked },
                          }))}
                        />
                        Active
                      </label>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {account.last_login_at ? new Date(account.last_login_at).toLocaleString('en-NZ') : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          minLength={10}
                          value={passwordDrafts[account.id] || ''}
                          onChange={(event) => setPasswordDrafts((prev) => ({ ...prev, [account.id]: event.target.value }))}
                          placeholder="New password"
                          className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleResetPassword(account.id)}
                          disabled={savingId === account.id}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleSaveAccount(account.id)}
                        disabled={savingId === account.id}
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-semibold disabled:opacity-50"
                      >
                        {savingId === account.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const AllowedEmailsSection: React.FC = () => {
  const [items, setItems] = useState<Array<{ email: string; role: string; note?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Teacher);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await api.getAllowedEmails());
    } catch (err: any) {
      setError(err.message || 'Failed to load allowed email rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    try {
      await api.upsertAllowedEmail(email, role, note || undefined);
      setEmail('');
      setNote('');
      await fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save allowed email rule');
    }
  };

  const handleDelete = async (entry: string) => {
    try {
      await api.deleteAllowedEmail(entry);
      await fetchItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete allowed email rule');
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Allowed Emails</h2>
        <p className="text-sm text-gray-400">
          Staff accounts can only be created for approved addresses or domains.
        </p>
      </div>

      {error && <div className="p-3 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email or @domain"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
        >
          {staffRoleOptions.map((nextRole) => (
            <option key={nextRole} value={nextRole}>{nextRole}</option>
          ))}
        </select>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl"
        >
          Save rule
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading allowed email rules...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email / Domain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Note</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {items.map((item) => (
                <tr key={item.email}>
                  <td className="px-4 py-4 text-sm text-white">{item.email}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{item.role}</td>
                  <td className="px-4 py-4 text-sm text-gray-400">{item.note || '—'}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.email)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const HouseManagementSection: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localPoints, setLocalPoints] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const fetchHouses = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getHouses();
      setHouses(data);
      setLocalPoints(
        data.reduce<Record<string, string>>((acc, house) => {
          acc[house.id] = house.points.toString();
          return acc;
        }, {})
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load house data');
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const latestPublishedAt = useMemo(
    () => houses.map((house) => house.published_at).filter(Boolean).sort().pop(),
    [houses]
  );
  const hasUnpublishedChanges = houses.some((house) => house.points !== (house.published_points ?? 0));

  const handleSave = async (houseId: string) => {
    const nextPoints = Number(localPoints[houseId]);
    if (Number.isNaN(nextPoints)) {
      setError('Points must be numeric.');
      return;
    }

    setSaving((prev) => ({ ...prev, [houseId]: true }));
    try {
      await api.updateHousePoints(houseId, nextPoints);
      await fetchHouses();
    } catch (err: any) {
      setError(err.message || 'Failed to update house points');
    } finally {
      setSaving((prev) => ({ ...prev, [houseId]: false }));
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    try {
      await api.publishPoints();
      setPublishMessage('Published leaderboard successfully.');
      await fetchHouses();
    } catch (err: any) {
      setError(err.message || 'Failed to publish points');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">House Point Management</h2>
        <p className="text-sm text-gray-400">
          Admin edits stay private until published to the public leaderboard.
        </p>
      </div>

      {error && <div className="p-3 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
      {publishMessage && <div className="p-3 rounded-md text-sm bg-green-800/50 text-green-300">{publishMessage}</div>}

      <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Publish to Leaderboard</h3>
          {latestPublishedAt ? (
            <p className="text-sm text-gray-400">
              Last published: {new Date(latestPublishedAt).toLocaleString('en-NZ')}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Points have not been published yet.</p>
          )}
          {hasUnpublishedChanges && (
            <p className="text-sm text-amber-400 mt-1">There are unpublished changes waiting to go live.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing...' : 'Publish points'}
        </button>
      </div>

      <div className="space-y-4">
        {houses.map((house) => (
          <div key={house.id} className="flex flex-col lg:flex-row lg:items-center justify-between bg-gray-900 p-4 rounded-lg gap-4">
            <div>
              <span className={`font-bold text-lg ${house.textColor}`}>{house.name}</span>
              <div className="text-sm text-gray-400 mt-1">
                Public score: {house.published_points ?? 0}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={localPoints[house.id] || ''}
                onChange={(event) => setLocalPoints((prev) => ({ ...prev, [house.id]: event.target.value }))}
                className="w-28 bg-gray-700 border border-gray-600 rounded-md p-2 text-right text-white"
              />
              <button
                type="button"
                onClick={() => handleSave(house.id)}
                disabled={saving[house.id]}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-sm font-semibold disabled:opacity-50"
              >
                {saving[house.id] ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ManualPointsSection: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getHouses()
      .then((data) => {
        setHouses(data);
        if (data.length > 0) {
          setSelectedHouse(data[0].id);
        }
      })
      .catch((err: any) => setError(err.message || 'Failed to load houses'));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await api.addManualPoints(selectedHouse, Number(points), reason);
      setMessage('Manual points added and logged successfully.');
      setPoints('');
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to add manual points');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Manual Event Points</h2>
        <p className="text-sm text-gray-400">
          Use this for whole-event adjustments such as Sports Day. Each change is still logged in the request history as an approved action.
        </p>
      </div>

      {error && <div className="p-3 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}
      {message && <div className="p-3 rounded-md text-sm bg-green-800/50 text-green-300">{message}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={selectedHouse}
          onChange={(event) => setSelectedHouse(event.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
        >
          {houses.map((house) => (
            <option key={house.id} value={house.id}>{house.name}</option>
          ))}
        </select>
        <input
          type="number"
          value={points}
          onChange={(event) => setPoints(event.target.value)}
          placeholder="Points"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
          required
        />
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          className="bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add points'}
        </button>
      </form>
    </section>
  );
};

const ExportAssetsSection: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [isExportingTv, setIsExportingTv] = useState(false);
  const [isExportingIg, setIsExportingIg] = useState(false);
  const tvRef = React.useRef<HTMLDivElement>(null);
  const igRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getPublishedHouses()
      .then(setHouses)
      .catch((err) => console.error('Failed to fetch houses for export', err));
  }, []);

  const handleExport = async (kind: 'tv' | 'ig') => {
    const ref = kind === 'tv' ? tvRef.current : igRef.current;
    if (!ref || houses.length === 0) {
      return;
    }

    kind === 'tv' ? setIsExportingTv(true) : setIsExportingIg(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const dataUrl = await toPng(ref, {
        width: kind === 'tv' ? 1080 : 1080,
        height: kind === 'tv' ? 1920 : 1080,
        backgroundColor: '#000000',
        pixelRatio: 1,
      });

      const link = document.createElement('a');
      link.download = kind === 'tv'
        ? `Aotea-Leaderboard-TV-${new Date().toISOString().split('T')[0]}.png`
        : `Aotea-Leaderboard-IG-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error creating export image', err);
    } finally {
      kind === 'tv' ? setIsExportingTv(false) : setIsExportingIg(false);
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 border-l-4 border-teal-500 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">Image Export</h2>
        <p className="text-gray-400 font-medium max-w-xl mb-6">
          Generate published leaderboard images for TV signage and Instagram posts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => handleExport('tv')}
            disabled={isExportingTv || houses.length === 0}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <span className="text-lg block">{isExportingTv ? 'Generating...' : 'TV Display'}</span>
              <span className="text-xs opacity-70 block">1080 × 1920 portrait</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleExport('ig')}
            disabled={isExportingIg || houses.length === 0}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left">
              <span className="text-lg block">{isExportingIg ? 'Generating...' : 'Instagram Post'}</span>
              <span className="text-xs opacity-70 block">1080 × 1080 square</span>
            </div>
          </button>
        </div>
      </div>

      <div style={{ position: 'fixed', left: '-20000px', top: '-20000px', width: '1080px', height: '1920px' }}>
        <TVExportTemplate ref={tvRef} houses={houses} />
      </div>
      <div style={{ position: 'fixed', left: '-20000px', top: '-20000px', width: '1080px', height: '1080px' }}>
        <IGExportTemplate ref={igRef} houses={houses} />
      </div>
    </section>
  );
};

const DangerZoneSection: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);

    try {
      await api.resetProject();
      await api.logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset project');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 border-4 border-red-500/50 space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-gray-400">
          This removes point requests, resets house scores, and removes other staff accounts while keeping the current admin account so the system remains recoverable.
        </p>
      </div>

      {error && <div className="p-3 rounded-md text-sm bg-red-800/50 text-red-300">{error}</div>}

      <label className="block text-sm font-medium text-gray-300">
        Type <span className="text-white font-bold">DELETE ALL DATA</span> to enable reset.
      </label>
      <input
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-white"
      />

      <button
        type="button"
        onClick={handleReset}
        disabled={confirmText !== 'DELETE ALL DATA' || isResetting}
        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResetting ? 'Resetting...' : 'Reset all project data'}
      </button>
    </section>
  );
};

export default AdminDashboardPage;
