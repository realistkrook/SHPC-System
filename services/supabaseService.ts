import { createClient, SupabaseClient, User, Session, RealtimeChannel, PostgrestError, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { House, Profile, UserRole, PointRequest, PointRequestStatus } from '../types';

// Read Supabase credentials from environment (Vite uses import.meta.env)
// Do NOT commit real keys to source control. Provide them in a local `.env` or as CI secrets.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL ?? (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn in dev so it's obvious to the developer; runtime will still surface errors when requests fail.
  // eslint-disable-next-line no-console
  console.warn('Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Configure your .env or environment variables.');
}

class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      // Create a minimal dummy object so the app doesn't crash at module import time.
      // Methods will throw helpful errors when called so developers know to set env vars.
      // We cast to any to satisfy the SupabaseClient type in this file.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const missingMsg = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local or environment.';
      const thrower = () => { throw new Error(missingMsg); };
      const dummy: any = {
        auth: {
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(missingMsg) }),
          signOut: async () => ({ error: new Error(missingMsg) }),
          getSession: async () => ({ data: { session: null } }),
          onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: (_: string) => ({ select: async () => { thrower(); } , insert: async () => { thrower(); }, update: async () => { thrower(); }, delete: async () => { thrower(); } }),
        rpc: async () => { thrower(); },
        channel: (_: string) => ({ on: () => ({ subscribe: (_: any, __: any) => {} }) }),
        removeChannel: (_: any) => {},
      };
      this.supabase = dummy as SupabaseClient;
    }
  }

  // =================================================================
  // AUTHENTICATION METHODS
  // =================================================================

  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; profile: Profile | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { user: null, session: null, profile: null, error: error.message };
    }
    if (data.user) {
        const profile = await this.getProfile(data.user.id);
        if(!profile) {
            return { user: data.user, session: data.session, profile: null, error: 'Could not find a user profile.'}
        }
        return { user: data.user, session: data.session, profile, error: null };
    }
    return { user: null, session: null, profile: null, error: 'An unknown error occurred.' };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error.message;
  }

  async signInWithProvider(provider: string, redirectTo?: string): Promise<any> {
    // Starts OAuth flow via Supabase hosted pages. If a redirect URL is provided,
    // Supabase will send the user back to that URL after auth.
    const { data, error } = await (this.supabase as any).auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });
    return { data, error };
  }

  // =================================================================
  // ALLOWED EMAILS (admin managed list)
  // =================================================================

  async getAllowedEmails(): Promise<any[]> {
    const { data, error } = await this.supabase.from('allowed_emails').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch allowed emails: ${error.message}`);
    return data || [];
  }

  async upsertAllowedEmail(email: string, role: string, note?: string): Promise<void> {
    const { error } = await this.supabase.from('allowed_emails').upsert({ email, role, note });
    if (error) throw new Error(error.message);
  }

  async deleteAllowedEmail(email: string): Promise<void> {
    const { error } = await this.supabase.from('allowed_emails').delete().eq('email', email);
    if (error) throw new Error(error.message);
  }

  async getSession(): Promise<Session | null> {
      const { data } = await this.supabase.auth.getSession();
      return data.session;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      return this.supabase.auth.onAuthStateChange(callback).data.subscription;
  }

  // =================================================================
  // PROFILE METHODS
  // =================================================================

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data;
  }

  async getProfiles(): Promise<Profile[]> {
      const { data, error } = await this.supabase.from('profiles').select('*');
      if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
      return data || [];
  }
  
  async updateUserRole(profileId: string, newRole: UserRole): Promise<void> {
      const { error } = await this.supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
      if (error) throw error.message;
  }

  // =================================================================
  // HOUSE METHODS
  // =================================================================

  async getHouses(): Promise<House[]> {
    const { data, error } = await this.supabase
      .from('houses')
      .select('id, name, points');
    if (error) {
      throw new Error(`Failed to fetch houses: ${error.message}`);
    }

    const houseColorMap: { [key: string]: string } = {
    pukeko: 'bg-blue-600',
        keruru: 'bg-purple-600',
        korimako: 'bg-green-600',
        kotuku: 'bg-yellow-500',
    };

    return data.map(h => {
        const color = houseColorMap[h.id] || 'bg-gray-500';
        return {
          ...h,
          color,
          textColor: color.replace('bg-', 'text-')
        };
    });
  }
  
  async updateHousePoints(houseId: string, points: number): Promise<void> {
      const { error } = await this.supabase.from('houses').update({ points }).eq('id', houseId);
      if (error) throw error.message;
  }
  
  /**
   * Adds points directly and creates an approved request for logging.
   * Requires a Supabase RPC function `add_manual_points`.
   */
  async addManualPoints(houseId: string, points: number, reason: string): Promise<void> {
      const { error } = await this.supabase.rpc('add_manual_points', {
          p_house_id: houseId,
          p_points: points,
          p_reason: reason
      });
      if (error) throw error.message;
  }

  // =================================================================
  // POINT REQUEST METHODS
  // =================================================================

  async getPointRequests(): Promise<PointRequest[]> {
      const { data, error } = await this.supabase
        .from('point_requests')
        .select(`
            *,
            teacher:profiles ( full_name ),
            house:houses ( name ),
            reviewer:reviewed_by ( full_name )
        `)
        .order('submitted_at', { ascending: false });
        
      if (error) {
          throw new Error(`Failed to fetch point requests: ${error.message}`);
      }
      
      return data.map((req: any) => ({
          ...req,
          teacher_name: req.teacher?.full_name || 'N/A',
          house_name: req.house?.name || 'N/A',
          reviewed_by_name: req.reviewer?.full_name || null,
      }));
  }

  async submitPointRequest(request: { house_id: string; points: number; reason: string }): Promise<void> {
    const session = await this.getSession();
    if (!session?.user) throw new Error("You must be logged in to submit a request.");

    const { error } = await this.supabase.from('point_requests').insert({
      ...request,
      teacher_id: session.user.id,
      status: PointRequestStatus.Pending,
    });

    if (error) throw error.message;
  }

  /**
   * Approves a request by calling a secure database function.
   * This function should handle updating the request status AND the house points atomically.
   * You must create this RPC function in your Supabase SQL editor.
   */
  async approveRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase.rpc('approve_request', { request_id: requestId });
    if (error) throw new Error(`Failed to approve request: ${error.message}`);
  }

  async rejectRequest(requestId: string): Promise<void> {
      const session = await this.getSession();
      if (!session?.user) throw new Error("You must be logged in.");

      const { error } = await this.supabase
        .from('point_requests')
        .update({ status: PointRequestStatus.Rejected, reviewed_by: session.user.id })
        .eq('id', requestId);
    if (error) throw new Error(`Failed to reject request: ${error.message}`);
  }
  
  /**
   * Resets all project data. Calls a secure RPC function.
   * This will delete all point requests, all profiles/users except the caller,
   * and reset house points to 0.
   */
  async resetProject(): Promise<void> {
    const { error } = await this.supabase.rpc('reset_project');
    if (error) throw new Error(`Failed to reset project: ${error.message}`);
  }

  // =================================================================
  // REALTIME METHODS
  // =================================================================

  on(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => void): RealtimeChannel {
    const channel = this.supabase.channel(`public:${table}`);
    channel
      .on('postgres_changes', { event, schema: 'public', table } as any, callback)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes.`);
        }
        if(err) {
          console.error(`Subscription error on ${table}:`, err);
        }
      });
    return channel;
  }

  removeSubscription(subscription: RealtimeChannel): void {
    if (subscription) {
      this.supabase.removeChannel(subscription);
    }
  }
}

export const supabase = new SupabaseService();