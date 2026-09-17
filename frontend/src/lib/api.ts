function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '/api').trim().replace(/\/+$/, '');
  // If a full remote URL is given without /api suffix, automatically append /api
  if (/^https?:\/\//i.test(raw) && !raw.endsWith('/api')) {
    return `${raw}/api`;
  }
  return raw;
}

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('optivir_token');
      // Dummy demo tokens are strictly invalid against the live enterprise backend - purge immediately
      if (token && token.startsWith('ov_jwt_demo_')) {
        localStorage.removeItem('optivir_token');
        return null;
      }
      return token;
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { success: false, message: response.statusText || `Server returned HTTP ${response.status}` };
    }

    if (!response.ok) {
      const err: any = new Error(data?.message || (response.status === 404 ? 'Resource not found' : `API error: ${response.status}`));
      err.details = data?.details || text;
      err.data = data;
      err.status = response.status;
      throw err;
    }

    return data;
  }

  // Auth
  async login(email: string, password: string, rememberMe: boolean = true) {
    return this.request<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<{ success: boolean; data: any }>('/dashboard/stats');
  }

  // CRM
  async getLeads(params: { status?: string; priority?: string; search?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; data: any[] }>(`/crm/leads${query ? `?${query}` : ''}`);
  }

  async createLead(payload: any) {
    return this.request<{ success: boolean; data: any }>('/crm/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateLead(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async convertLead(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/crm/leads/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteLead(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async getCompanies(search?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/crm/companies${search ? `?search=${search}` : ''}`);
  }

  async getContacts(companyId?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/crm/contacts${companyId ? `?companyId=${companyId}` : ''}`);
  }

  async getLeadSources() {
    return this.request<{ success: boolean; data: any[] }>('/crm/lead-sources');
  }

  // Sales & Deals
  async getPipelines() {
    return this.request<{ success: boolean; data: any[] }>('/sales/pipelines');
  }

  async getDeals(pipelineId?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/sales/deals${pipelineId ? `?pipelineId=${pipelineId}` : ''}`);
  }

  async createDeal(payload: any) {
    return this.request<{ success: boolean; data: any }>('/sales/deals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateDeal(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/sales/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async updateDealStage(id: string, stageId: string) {
    return this.request<{ success: boolean; data: any }>(`/sales/deals/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stageId }),
    });
  }

  async deleteDeal(id: string) {
    return this.request<{ success: boolean; message: string; id?: string }>(`/sales/deals/${id}`, {
      method: 'DELETE',
    });
  }

  async getServices() {
    return this.request<{ success: boolean; data: any[] }>('/sales/services');
  }

  async getClients(params: { status?: string; health?: string; search?: string; accountManagerId?: string; myOnly?: string; all?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; data: any[] }>(`/clients${query ? `?${query}` : ''}`);
  }

  async getClient360(id: string) {
    return this.request<{ success: boolean; data: any }>(`/clients/${id}/360`);
  }

  async updateOnboardingItem(clientId: string, checklistId: string, isCompleted: boolean) {
    return this.request<{ success: boolean; progress: number }>(`/clients/${clientId}/onboarding/${checklistId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }

  // Social Media Insights & Post Snapshots
  async getClientSocialInsights(clientId: string) {
    return this.request<{
      success: boolean;
      data: {
        posts: any[];
        summary: {
          total_posts: number;
          total_impressions: number;
          total_reach: number;
          total_likes: number;
          total_comments: number;
          total_shares: number;
          total_saves: number;
          total_clicks: number;
          avg_engagement_rate: number;
        };
        platforms: any[];
      };
    }>(`/clients/${clientId}/social-insights`);
  }

  async createClientSocialPost(clientId: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/clients/${clientId}/social-insights`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteClientSocialPost(clientId: string, postId: string) {
    return this.request<{ success: boolean; message: string }>(`/clients/${clientId}/social-insights/${postId}`, {
      method: 'DELETE',
    });
  }

  async getClientSocialIntegrations(clientId: string) {
    return this.request<{ success: boolean; data: any }>(`/clients/${clientId}/social-integrations`);
  }

  async updateClientSocialIntegrations(clientId: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/clients/${clientId}/social-integrations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async inspectClientMetaAccounts(clientId: string, accessToken: string) {
    return this.request<{
      success: boolean;
      data: {
        pages: Array<{
          id: string;
          name: string;
          category?: string;
          access_token?: string;
          instagram?: {
            id: string;
            username?: string;
            name?: string;
            profile_picture_url?: string;
          } | null;
        }>;
        directInstagram?: {
          id: string;
          username?: string;
          account_type?: string;
        } | null;
        message?: string;
        missingPermissions?: string[];
      };
    }>(`/clients/${clientId}/social-integrations/meta-inspect`, {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  }

  async connectClientMetaAccounts(clientId: string, payload: {
    accessToken?: string;
    pageId?: string;
    pageAccessToken?: string;
    pageName?: string;
    instagramAccountId?: string;
    instagramUsername?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>(`/clients/${clientId}/social-integrations/meta-connect`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncClientSocialInsights(clientId: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/clients/${clientId}/social-insights/sync`, {
      method: 'POST',
    });
  }

  async discoverClientSocialPosts(clientId: string, params?: { urls?: string[]; handle?: string }) {
    if (params && ((params.urls && params.urls.length > 0) || params.handle)) {
      return this.request<{ success: boolean; data: { availablePosts: any[]; unimportedCount: number; platforms: string[]; clientName: string; clientId: string; message?: string } }>(`/clients/${clientId}/social-insights/discover`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    }
    return this.request<{ success: boolean; data: { availablePosts: any[]; unimportedCount: number; platforms: string[]; clientName: string; clientId: string; message?: string } }>(`/clients/${clientId}/social-insights/discover`);
  }

  async importSelectedSocialPosts(clientId: string, selectedPosts: any[]) {
    return this.request<{ success: boolean; message: string; data: any }>(`/clients/${clientId}/social-insights/import-selected`, {
      method: 'POST',
      body: JSON.stringify({ selectedPosts }),
    });
  }

  async inspectSocialPostUrl(clientId: string, url: string) {
    return this.request<{ success: boolean; data: { title: string; description: string; thumbnail_url: string; platform: string; media_type: string; author?: string } }>(`/clients/${clientId}/social-insights/inspect-url`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }


  // Projects & Tasks
  async getProjects(clientId?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/projects${clientId ? `?clientId=${clientId}` : ''}`);
  }

  async getTasks(params: { status?: string; projectId?: string; clientId?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; data: any[] }>(`/projects/tasks${query ? `?${query}` : ''}`);
  }

  async createTask(payload: any) {
    return this.request<{ success: boolean; data: any }>('/projects/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request<{ success: boolean; data: any }>(`/projects/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTeamMembers() {
    return this.request<{ success: boolean; data: any[] }>('/projects/team-members');
  }

  async createTeamMember(payload: { name: string; designation?: string; email?: string; phone?: string; role?: string }) {
    return this.request<{ success: boolean; data: any }>('/projects/team-members', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Finance
  async getInvoices(clientId?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/finance/invoices${clientId ? `?clientId=${clientId}` : ''}`);
  }

  async getPayments() {
    return this.request<{ success: boolean; data: any[] }>('/finance/payments');
  }

  async recordPayment(payload: any) {
    return this.request<{ success: boolean; data: any }>('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getExpenses() {
    return this.request<{ success: boolean; data: any[] }>('/finance/expenses');
  }


  async getMarketingAnalytics() {
    return this.request<{ success: boolean; data: any }>('/marketing/analytics');
  }

  // Activities & Timeline
  async logActivity(payload: any) {
    return this.request<{ success: boolean; data: any }>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getActivities(params: { clientId?: string; leadId?: string; dealId?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; data: any[] }>(`/activities${query ? `?${query}` : ''}`);
  }

  // Companies & Contacts (CRUD)
  async createCompany(payload: any) {
    return this.request<{ success: boolean; data: any }>('/crm/companies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCompany(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/crm/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async createContact(payload: any) {
    return this.request<{ success: boolean; data: any }>('/crm/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateContact(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/crm/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Clients (CRUD)
  async createClient(payload: any) {
    return this.request<{ success: boolean; data: any }>('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateClient(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Projects (CRUD)
  async createProject(payload: any) {
    return this.request<{ success: boolean; data: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProject(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ success: boolean; message: string }>(`/projects/${id}`, { method: 'DELETE' });
  }

  async updateTask(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/projects/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Finance (CRUD)
  async createInvoice(payload: any) {
    return this.request<{ success: boolean; data: any }>('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateInvoice(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/finance/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async createExpense(payload: any) {
    return this.request<{ success: boolean; data: any }>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteExpense(id: string) {
    return this.request<{ success: boolean; message: string }>(`/finance/expenses/${id}`, { method: 'DELETE' });
  }

  // Marketing (CRUD)
  async getCampaigns(clientId?: string) {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/marketing/campaigns${query}`);
  }

  async quickLogAdSpend(payload: any) {
    return this.request<{ success: boolean; data: any; message?: string }>('/marketing/campaigns/quick-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createCampaign(payload: any) {
    return this.request<{ success: boolean; data: any }>('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCampaign(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/marketing/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteCampaign(id: string) {
    return this.request<{ success: boolean; message: string }>(`/marketing/campaigns/${id}`, { method: 'DELETE' });
  }

  async getDiscoverableAdAccounts(platform: string = 'Meta') {
    return this.request<{ success: boolean; data: any[] }>(`/marketing/ad-accounts/discover?platform=${encodeURIComponent(platform)}`);
  }

  async previewAdAccountCampaigns(adAccountId: string, platform: string = 'Meta', accessToken?: string, clientId?: string) {
    let url = `/marketing/ad-accounts/preview-campaigns?ad_account_id=${encodeURIComponent(adAccountId)}&platform=${encodeURIComponent(platform)}`;
    if (accessToken) {
      url += `&access_token=${encodeURIComponent(accessToken)}`;
    }
    if (clientId) {
      url += `&client_id=${encodeURIComponent(clientId)}`;
    }
    return this.request<{ success: boolean; data: any[]; alreadyInCrm?: any[]; totalDiscovered?: number }>(url);
  }

  async syncCampaignTelemetry(clientId?: string) {
    return this.request<{ success: boolean; message: string; updatedCount?: number }>('/marketing/campaigns/sync-telemetry', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    });
  }

  async connectAdAccountToClient(payload: {
    client_id: string;
    ad_account_id: string;
    ad_account_name?: string;
    platform?: string;
    access_token?: string;
    selected_campaign_ids?: string[];
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/marketing/campaigns/connect-ad-account', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Delete Operations (CRUD)
  async deleteCompany(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/companies/${id}`, { method: 'DELETE' });
  }

  async deleteContact(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/contacts/${id}`, { method: 'DELETE' });
  }

  async deleteTask(id: string) {
    return this.request<{ success: boolean; message: string }>(`/projects/tasks/${id}`, { method: 'DELETE' });
  }

  async deleteInvoice(id: string) {
    return this.request<{ success: boolean; message: string }>(`/finance/invoices/${id}`, { method: 'DELETE' });
  }

  async deleteClient(id: string) {
    return this.request<{ success: boolean; message: string }>(`/clients/${id}`, { method: 'DELETE' });
  }

  // Reports
  async getExecutiveSummary() {
    return this.request<{ success: boolean; data: any }>('/reports/executive-summary');
  }

  // Integrations Hub
  async getIntegrations() {
    return this.request<{ success: boolean; data: any[] }>('/integrations');
  }

  async testIntegration(integrationId: string, credentials: Record<string, string>) {
    return this.request<{ success: boolean; message: string; details?: string; latencyMs?: number; data?: any }>('/integrations/test', {
      method: 'POST',
      body: JSON.stringify({ integrationId, credentials }),
    });
  }

  async saveIntegration(payload: {
    integrationId: string;
    name?: string;
    category?: string;
    config?: Record<string, any>;
    statusText?: string;
    connected?: boolean;
    metadata?: Record<string, any>;
  }) {
    return this.request<{ success: boolean; message: string; data?: any }>('/integrations/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async disconnectIntegration(integrationId: string) {
    return this.request<{ success: boolean; message: string }>(`/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async fetchAdAccounts(payload: { integrationId?: string; accessToken?: string; partnerId?: string }) {
    return this.request<{ success: boolean; data: any[]; message?: string }>('/integrations/ad-accounts/fetch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAdAccountDetails(adAccountId: string) {
    return this.request<{ success: boolean; data: any; message?: string }>(`/integrations/ad-accounts/${adAccountId}/details`);
  }

  // ==========================================
  // Settings API Methods (Real PostgreSQL persistence)
  // ==========================================

  // 1. Organization Identity
  async getOrganizationSettings() {
    return this.request<{ success: boolean; data: any }>('/settings/organization');
  }

  async updateOrganizationSettings(payload: {
    legal_name?: string;
    brand_name?: string;
    tax_gstin?: string;
    tax_pan?: string;
    domain_website?: string;
    industry?: string;
    support_email?: string;
    switchboard_phone?: string;
    logo_url?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/organization', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // 2. General Regional
  async getRegionalSettings() {
    return this.request<{ success: boolean; data: any }>('/settings/regional');
  }

  async updateRegionalSettings(payload: {
    timezone?: string;
    currency?: string;
    date_format?: string;
    fiscal_year?: string;
    auto_shift_adjustment?: boolean;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/regional', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // 3. User Preferences
  async getUserPreferences() {
    return this.request<{ success: boolean; data: any }>('/settings/preferences');
  }

  async updateUserPreferences(payload: {
    landing_workspace?: string;
    density_profile?: string;
    auditory_chimes?: boolean;
    telemetry_diff?: boolean;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // 3.1. Personal Profile
  async getProfile() {
    return this.request<{ success: boolean; data: any }>('/settings/profile');
  }

  async updateProfile(payload: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // 4. User Directory
  async getSettingsUsers() {
    return this.request<{ success: boolean; data: any[] }>('/settings/users');
  }

  async createSettingsUser(payload: {
    name?: string;
    email: string;
    role?: string;
    designation?: string;
    team_id?: string;
    phone?: string;
    password?: string;
    allowed_tabs?: string[];
    client_id?: string | null;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resetUserPassword(userId: string, password: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async updateSettingsUser(id: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteSettingsUser(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/users/${id}`, {
      method: 'DELETE',
    });
  }

  // 5. Roles & Permissions
  async getSettingsRoles() {
    return this.request<{ success: boolean; data: any[]; allPermissions?: any[] }>('/settings/roles');
  }

  async createSettingsRole(payload: { name: string; description?: string; permissions?: string[] }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSettingsRolePermissions(roleId: string, permissions: string[] | Record<string, boolean>) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }

  async deleteSettingsRole(roleId: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // 6. Teams & Pods
  async getSettingsTeams() {
    return this.request<{ success: boolean; data: any[] }>('/settings/teams');
  }

  async createSettingsTeam(payload: {
    name: string;
    lead?: string;
    target?: string;
    description?: string;
    color?: string;
    metadata?: any;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSettingsTeam(id: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteSettingsTeam(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // 7. SSO & Security 2FA
  async getSecuritySettings() {
    return this.request<{ success: boolean; data: any }>('/settings/security');
  }

  async updateSecuritySettings(payload: {
    two_factor_enforced?: boolean;
    session_timeout?: string;
    failed_lockout_limit?: string;
    ip_whitelist?: string[];
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // 8. Pipelines & Stages
  async getSettingsPipelines() {
    return this.request<{ success: boolean; data: any[] }>('/settings/pipelines');
  }

  async createSettingsPipeline(payload: { name: string; is_default?: boolean }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/pipelines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createSettingsStage(pipelineId: string, payload: {
    name: string;
    probability?: number;
    win_probability?: number;
    sla_days?: number;
    color?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/pipelines/${pipelineId}/stages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSettingsStage(id: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/stages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteSettingsStage(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/stages/${id}`, {
      method: 'DELETE',
    });
  }

  // 9. Custom Fields
  async getCustomFieldDefinitions(entityType?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/settings/custom-fields${entityType ? `?entity_type=${entityType}` : ''}`);
  }

  async createCustomFieldDefinition(payload: {
    entity: string;
    name: string;
    key?: string;
    type: string;
    required?: boolean;
    options?: any[];
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/custom-fields', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteCustomFieldDefinition(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/custom-fields/${id}`, {
      method: 'DELETE',
    });
  }

  // 10. System Tags
  async getSystemTags() {
    return this.request<{ success: boolean; data: any[] }>('/settings/tags');
  }

  async createSystemTag(payload: { name: string; color?: string }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/tags', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteSystemTag(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // 11. Services Catalog
  async getServicesCatalog() {
    return this.request<{ success: boolean; data: any[] }>('/settings/services');
  }

  async createService(payload: {
    name: string;
    category?: string;
    pricing_model?: string;
    price?: number;
    description?: string;
    sac_code?: string;
    tax_rate?: string;
    deliverables_count?: number;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateService(id: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteService(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/services/${id}`, {
      method: 'DELETE',
    });
  }

  // 12. Lead Sources
  async getSettingsLeadSources() {
    return this.request<{ success: boolean; data: any[] }>('/settings/lead-sources');
  }

  async createLeadSource(payload: {
    name: string;
    channel?: string;
    cost_per_lead?: number;
    is_active?: boolean;
    status?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/lead-sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateLeadSource(id: string, payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>(`/settings/lead-sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteLeadSource(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/lead-sources/${id}`, {
      method: 'DELETE',
    });
  }

  // 13. Document Templates
  async getDocumentTemplates() {
    return this.request<{ success: boolean; data: any[] }>('/settings/document-templates');
  }

  async saveDocumentTemplate(payload: {
    id?: string;
    name: string;
    type?: string;
    version?: string;
    sac_code?: string;
    standard_terms?: string;
    content?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/document-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteDocumentTemplate(id: string) {
    return this.request<{ success: boolean; message: string }>(`/settings/document-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // 14. Billing & Currency
  async getBillingSettings() {
    return this.request<{ success: boolean; data: any }>('/settings/billing');
  }

  async updateBillingSettings(payload: {
    gstin?: string;
    pan?: string;
    state_code?: string;
    bank_name?: string;
    account_no?: string;
    ifsc?: string;
    invoice_prefix?: string;
  }) {
    return this.request<{ success: boolean; message: string; data: any }>('/settings/billing', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // 15. Audit Telemetry
  async getAuditLogs(limit: number = 50) {
    return this.request<{ success: boolean; data: any[] }>(`/settings/audit-logs?limit=${limit}`);
  }

  // Proposals
  async getProposals() {
    return this.request<{ success: boolean; data: any[] }>('/sales/proposals');
  }

  async createProposal(payload: any) {
    return this.request<{ success: boolean; data: any }>('/sales/proposals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProposal(id: string, payload: any) {
    return this.request<{ success: boolean; data: any }>(`/sales/proposals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteProposal(id: string) {
    return this.request<{ success: boolean; message?: string }>(`/sales/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  async createActivity(payload: {
    type: string;
    subject: string;
    description?: string;
    lead_id?: string;
    company_id?: string;
    contact_id?: string;
    deal_id?: string;
    client_id?: string;
    project_id?: string;
    duration_minutes?: number;
  }) {
    return this.request<{ success: boolean; data: any }>('/activities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<{ success: boolean; data: any[] }>('/notifications');
  }
}

export const api = new ApiClient();
