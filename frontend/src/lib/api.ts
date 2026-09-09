const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
      throw new Error(data.message || `API error: ${response.status}`);
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

  async updateDealStage(id: string, stageId: string) {
    return this.request<{ success: boolean; data: any }>(`/sales/deals/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stageId }),
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

  // Delete Operations (CRUD)
  async deleteLead(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/leads/${id}`, { method: 'DELETE' });
  }

  async deleteCompany(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/companies/${id}`, { method: 'DELETE' });
  }

  async deleteContact(id: string) {
    return this.request<{ success: boolean; message: string }>(`/crm/contacts/${id}`, { method: 'DELETE' });
  }

  async deleteDeal(id: string) {
    return this.request<{ success: boolean; message: string }>(`/sales/deals/${id}`, { method: 'DELETE' });
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
}

export const api = new ApiClient();
