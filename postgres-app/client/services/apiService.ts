import { House, PointRequest, Profile, StaffAccountInput, UserRole } from '../types';

const API_BASE = '/api';

class ApiService {
  private houseColorMap: Record<string, string> = {
    pukeko: 'bg-purple-600',
    kereru: 'bg-green-600',
    keruru: 'bg-green-600',
    korimako: 'bg-yellow-500',
    kotuku: 'bg-white',
  };

  private houseNameMap: Record<string, string> = {
    pukeko: 'Pukeko',
    kereru: 'Kereru',
    keruru: 'Kereru',
    korimako: 'Korimako',
    kotuku: 'Kotuku',
  };

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<Profile> {
    const data = await this.request<{ profile: Profile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data.profile;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getSessionProfile(): Promise<Profile | null> {
    try {
      const data = await this.request<{ profile: Profile }>('/auth/me');
      return data.profile;
    } catch {
      return null;
    }
  }

  async getHouses(): Promise<House[]> {
    const data = await this.request<any[]>('/houses');
    return data.map((house) => {
      const color = this.houseColorMap[(house.id || '').toLowerCase()] || 'bg-gray-500';
      return {
        ...house,
        name: this.houseNameMap[(house.id || '').toLowerCase()] || house.name,
        color,
        textColor: color.replace('bg-', 'text-'),
      };
    });
  }

  async getPublishedHouses(): Promise<House[]> {
    const houses = await this.getHouses();
    return houses.map((house) => ({
      ...house,
      points: house.published_points ?? house.points,
    }));
  }

  async updateHousePoints(houseId: string, points: number): Promise<void> {
    await this.request(`/houses/${houseId}/points`, {
      method: 'PUT',
      body: JSON.stringify({ points }),
    });
  }

  async addManualPoints(houseId: string, points: number, reason: string): Promise<void> {
    await this.request(`/houses/${houseId}/manual-points`, {
      method: 'POST',
      body: JSON.stringify({ points, reason }),
    });
  }

  async publishPoints(): Promise<void> {
    await this.request('/houses/publish', { method: 'POST' });
  }

  async getPointRequests(teacherId?: string): Promise<PointRequest[]> {
    const query = teacherId ? `?teacher_id=${encodeURIComponent(teacherId)}` : '';
    const data = await this.request<any[]>(`/point-requests${query}`);

    return data.map((request) => ({
      ...request,
      teacher_name: request.teacher_name || 'N/A',
      house_name: this.houseNameMap[(request.house_id || '').toLowerCase()] || request.house_name || 'N/A',
      reviewed_by_name: request.reviewed_by_name || null,
    }));
  }

  async submitPointRequest(request: { house_id: string; points: number; reason: string }): Promise<void> {
    await this.request('/point-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async approveRequest(requestId: string): Promise<void> {
    await this.request(`/point-requests/${requestId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectRequest(requestId: string): Promise<void> {
    await this.request(`/point-requests/${requestId}/reject`, {
      method: 'PUT',
    });
  }

  async getAllowedEmails(): Promise<Array<{ email: string; role: string; note?: string }>> {
    return this.request('/admin/allowed-emails');
  }

  async upsertAllowedEmail(email: string, role: string, note?: string): Promise<void> {
    await this.request('/admin/allowed-emails', {
      method: 'POST',
      body: JSON.stringify({ email, role, note }),
    });
  }

  async deleteAllowedEmail(email: string): Promise<void> {
    await this.request(`/admin/allowed-emails/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  }

  async getStaffAccounts(): Promise<Profile[]> {
    return this.request('/admin/accounts');
  }

  async createStaffAccount(account: StaffAccountInput): Promise<Profile> {
    return this.request('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  async updateStaffAccount(accountId: string, updates: { full_name: string; email: string; role: UserRole; is_active: boolean }): Promise<Profile> {
    return this.request(`/admin/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async resetStaffPassword(accountId: string, password: string): Promise<void> {
    await this.request(`/admin/accounts/${accountId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  async resetProject(): Promise<void> {
    await this.request('/admin/reset', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
