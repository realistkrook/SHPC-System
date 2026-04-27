import { House, Profile, UserRole, PointRequest, PointRequestStatus } from '../types';

const API_BASE = '/api';

/**
 * API Service — replaces supabaseService for the PostgreSQL version.
 * All calls go through the Express REST backend via fetch().
 */
class ApiService {

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // =================================================================
  // HOUSE METHODS
  // =================================================================

  private houseColorMap: { [key: string]: string } = {
    pukeko: 'bg-purple-600',
    kereru: 'bg-green-600',
    keruru: 'bg-green-600',
    korimako: 'bg-yellow-500',
    kotuku: 'bg-white',
  };

  private houseNameMap: { [key: string]: string } = {
    pukeko: 'Pūkeko',
    kereru: 'Kererū',
    keruru: 'Kererū',
    korimako: 'Kōrimako',
    kotuku: 'Kōtuku',
  };

  async getHouses(): Promise<House[]> {
    const data = await this.request<any[]>('/houses');
    return data.map(h => {
      const color = this.houseColorMap[h.id.toLowerCase()] || 'bg-gray-500';
      return {
        ...h,
        name: this.houseNameMap[h.id.toLowerCase()] || h.name,
        color,
        textColor: color.replace('bg-', 'text-'),
      };
    });
  }

  async getPublishedHouses(): Promise<House[]> {
    const houses = await this.getHouses();
    return houses.map(h => ({
      ...h,
      points: h.published_points ?? h.points,
    }));
  }

  async updateHousePoints(houseId: string, points: number): Promise<void> {
    await this.request(`/houses/${houseId}/points`, {
      method: 'PUT',
      body: JSON.stringify({ points }),
    });
  }

  async addManualPoints(houseId: string, points: number, reason: string): Promise<void> {
    const currentProfileId = this.getCurrentProfileId();
    await this.request(`/houses/${houseId}/manual-points`, {
      method: 'POST',
      body: JSON.stringify({ points, reason, reviewer_id: currentProfileId }),
    });
  }

  async publishPoints(): Promise<void> {
    await this.request('/houses/publish', { method: 'POST' });
  }

  // =================================================================
  // PROFILE METHODS
  // =================================================================

  async getProfiles(): Promise<Profile[]> {
    return this.request<Profile[]>('/profiles');
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      return await this.request<Profile>(`/profiles/${userId}`);
    } catch {
      return null;
    }
  }

  async updateUserRole(profileId: string, newRole: UserRole): Promise<void> {
    await this.request(`/profiles/${profileId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    });
  }

  // =================================================================
  // POINT REQUEST METHODS
  // =================================================================

  async getPointRequests(userId?: string): Promise<PointRequest[]> {
    const queryString = userId ? `?teacher_id=${userId}` : '';
    const data = await this.request<any[]>(`/point-requests${queryString}`);

    return data.map((req: any) => ({
      ...req,
      teacher_name: req.teacher_name || 'N/A',
      house_name: this.houseNameMap[(req.house_id || '').toLowerCase()] || req.house_name || 'N/A',
      reviewed_by_name: req.reviewed_by_name || null,
    }));
  }

  async submitPointRequest(request: { house_id: string; points: number; reason: string }): Promise<void> {
    const currentProfileId = this.getCurrentProfileId();
    await this.request('/point-requests', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        teacher_id: currentProfileId,
      }),
    });
  }

  async approveRequest(requestId: string): Promise<void> {
    const currentProfileId = this.getCurrentProfileId();
    await this.request(`/point-requests/${requestId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ reviewer_id: currentProfileId }),
    });
  }

  async rejectRequest(requestId: string): Promise<void> {
    const currentProfileId = this.getCurrentProfileId();
    await this.request(`/point-requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reviewer_id: currentProfileId }),
    });
  }

  // =================================================================
  // ADMIN METHODS
  // =================================================================

  async getAllowedEmails(): Promise<any[]> {
    return this.request<any[]>('/admin/allowed-emails');
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

  async resetProject(): Promise<void> {
    const currentProfileId = this.getCurrentProfileId();
    await this.request('/admin/reset', {
      method: 'POST',
      body: JSON.stringify({ keep_profile_id: currentProfileId }),
    });
  }

  // =================================================================
  // SESSION HELPERS (simple profile selector, no auth)
  // =================================================================

  /**
   * In the PostgreSQL version, we use a simple "current profile" stored in localStorage.
   * No JWT, no OAuth — just a profile ID for demo/assessment purposes.
   */
  getCurrentProfileId(): string | null {
    return localStorage.getItem('current_profile_id');
  }

  setCurrentProfile(profileId: string): void {
    localStorage.setItem('current_profile_id', profileId);
  }

  clearCurrentProfile(): void {
    localStorage.removeItem('current_profile_id');
  }
}

export const api = new ApiService();
