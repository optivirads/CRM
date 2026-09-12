const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('optivir_token');
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      const err: any = new Error(data.message || `API error: ${response.status}`);
      err.details = data.details;
      err.data = data;
      throw err;
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
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

  // Clients & Client 360°
  async getClients(params: { status?: string; health?: string; search?: string } = {}) {
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

  // Marketing
  async getCampaigns(clientId?: string) {
    return this.request<{ success: boolean; data: any[] }>(`/marketing/campaigns${clientId ? `?clientId=${clientId}` : ''}`);
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
}

export const api = new ApiClient();
