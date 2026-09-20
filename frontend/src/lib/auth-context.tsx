'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  designation?: string;
  role: 'owner' | 'coo' | 'sales_lead' | 'marketing_lead' | 'social_media_lead' | 'media_buyer' | 'finance_lead' | 'account_manager' | 'operations_lead' | 'client_portal' | string;
  roleName?: string;
  isOwner?: boolean;
  allowed_tabs?: string[];
  clientId?: string | null;
  clientName?: string | null;
  currentDevice?: {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    formatted: string;
    ip: string;
    userAgent: string;
    loggedInAt: string;
    lastActiveAt?: string;
  } | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
}

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'coo' | 'sales_lead' | 'marketing_lead' | 'social_media_lead' | 'media_buyer' | 'finance_lead' | 'account_manager' | 'operations_lead' | 'client_portal' | string;
  roleLabel: string;
  designation: string;
  avatarText: string;
  avatarBg: string;
  allowedTabs: string[];
  description: string;
}

export const AGENCY_PERSONAS: Persona[] = [
  {
    id: 'persona-owner',
    name: 'OptiVir Admin',
    email: 'optivirads@gmail.com',
    role: 'owner',
    roleLabel: 'Executive & Owner',
    designation: 'Managing Director • OptiVir',
    avatarText: 'OP',
    avatarBg: 'bg-[#B91C1C]',
    allowedTabs: ['*'],
    description: 'Full agency command across all 18 CRM, Revenue, Operations & Billing modules'
  },
  {
    id: 'persona-coo',
    name: 'Operations Lead (COO)',
    email: 'coo@optivirads.com',
    role: 'coo',
    roleLabel: 'Chief Operating Officer',
    designation: 'Chief Operating Officer • OptiVir',
    avatarText: 'CO',
    avatarBg: 'bg-purple-700',
    allowedTabs: ['dashboard', 'leads', 'contacts', 'clients', 'client-360', 'pipeline', 'proposals', 'onboarding', 'projects', 'tasks', 'marketing', 'finance', 'reports', 'activities', 'documents', 'notifications', 'settings'],
    description: 'Executive operational command across all agency deliverables, pipelines, and modules'
  },
  {
    id: 'persona-sales',
    name: 'Growth Lead',
    email: 'sales@optivirads.com',
    role: 'sales_lead',
    roleLabel: 'Sales Lead / AE',
    designation: 'Head of Growth & Pipeline',
    avatarText: 'GL',
    avatarBg: 'bg-blue-600',
    allowedTabs: ['dashboard', 'leads', 'contacts', 'companies', 'opportunities', 'pipeline', 'proposals', 'sales', 'activities', 'notifications'],
    description: 'CRM qualification, deal velocity, commercial quotations & pipeline forecasting'
  },
  {
    id: 'persona-marketing',
    name: 'Marketing Lead',
    email: 'marketing@optivirads.com',
    role: 'marketing_lead',
    roleLabel: 'Marketing Lead',
    designation: 'Head of Marketing & Growth',
    avatarText: 'ML',
    avatarBg: 'bg-indigo-600',
    allowedTabs: ['dashboard', 'marketing', 'reports', 'clients', 'projects', 'tasks', 'proposals'],
    description: 'Omnichannel performance marketing, brand campaigns, and conversion attribution'
  },
  {
    id: 'persona-social',
    name: 'Social Media Lead',
    email: 'social@optivirads.com',
    role: 'social_media_lead',
    roleLabel: 'Social Media Lead',
    designation: 'Social Media & Content Lead',
    avatarText: 'SL',
    avatarBg: 'bg-pink-600',
    allowedTabs: ['dashboard', 'marketing', 'projects', 'tasks', 'clients', 'reports'],
    description: 'Social post insights, creative deliverables, engagement KPIs, and brand community'
  },
  {
    id: 'persona-media',
    name: 'Media Lead',
    email: 'media@optivirads.com',
    role: 'media_buyer',
    roleLabel: 'Performance & Media Lead',
    designation: 'Head of Media & Ad Buying',
    avatarText: 'AD',
    avatarBg: 'bg-cyan-600',
    allowedTabs: ['dashboard', 'clients', 'client-360', 'projects', 'tasks', 'marketing', 'reports', 'notifications'],
    description: 'Google & Meta Ads telemetry, ROAS attribution, creative deliverables & project sprints'
  },
  {
    id: 'persona-finance',
    name: 'Finance Lead',
    email: 'finance@optivirads.com',
    role: 'finance_lead',
    roleLabel: 'Finance & Billing Lead',
    designation: 'Financial Controller',
    avatarText: 'FL',
    avatarBg: 'bg-emerald-600',
    allowedTabs: ['dashboard', 'finance', 'proposals', 'reports', 'documents', 'activities', 'notifications'],
    description: 'Tax invoicing, balance reconciliation, payment tracking & cashflow ledger'
  },
  {
    id: 'persona-client',
    name: 'Client Partner',
    email: 'client@portal.com',
    role: 'client_portal',
    roleLabel: 'Client Stakeholder',
    designation: 'Client Review Portal',
    avatarText: 'CP',
    avatarBg: 'bg-amber-600',
    allowedTabs: ['dashboard', 'clients', 'client-360', 'projects', 'tasks', 'marketing', 'finance', 'reports'],
    description: 'Single-client review portal: track sprint deliverables, inspect ROAS reports & view invoices'
  }
];

export const getPersonaForUser = (u: User | null): Persona => {
  if (!u) {
    return AGENCY_PERSONAS[0];
  }

  // 1. If user is owner
  if (u.isOwner || u.email?.toLowerCase() === 'optivirads@gmail.com' || u.role === 'owner') {
    const p = AGENCY_PERSONAS[0];
    return {
      ...p,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || p.name,
      email: u.email || p.email,
      designation: u.designation || p.designation,
      allowedTabs: u.allowed_tabs || ['*']
    };
  }

  // 2. Match by email in AGENCY_PERSONAS
  const byEmail = AGENCY_PERSONAS.find(
    p => u.email && p.email.toLowerCase() === u.email.toLowerCase()
  );
  if (byEmail) {
    return {
      ...byEmail,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || byEmail.name,
      email: u.email,
      role: (u.role as any) || byEmail.role,
      roleLabel: u.roleName || byEmail.roleLabel,
      designation: u.designation || byEmail.designation,
      avatarText: ((u.firstName?.[0] || '') + (u.lastName?.[0] || u.email?.[0] || 'U')).toUpperCase() || byEmail.avatarText,
      allowedTabs: u.allowed_tabs || byEmail.allowedTabs
    };
  }

  // 3. Match by role slug in AGENCY_PERSONAS (e.g. 'coo', 'sales_lead', etc.)
  const byRole = AGENCY_PERSONAS.find(p => p.role === u.role);
  if (byRole) {
    return {
      ...byRole,
      id: `persona-${u.id || u.role}`,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || byRole.name,
      email: u.email,
      role: (u.role as any) || byRole.role,
      roleLabel: u.roleName || byRole.roleLabel,
      designation: u.designation || byRole.designation,
      avatarText: ((u.firstName?.[0] || '') + (u.lastName?.[0] || u.email?.[0] || 'U')).toUpperCase() || byRole.avatarText,
      allowedTabs: u.allowed_tabs || byRole.allowedTabs
    };
  }

  // 4. Dynamic persona for any custom role
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
  const initials = ((u.firstName?.[0] || '') + (u.lastName?.[0] || u.email?.[0] || 'U')).toUpperCase();
  return {
    id: `persona-${u.id || u.role}`,
    name: fullName,
    email: u.email,
    role: (u.role as any) || 'coo',
    roleLabel: u.roleName || 'Team Member',
    designation: u.designation || 'Specialist',
    avatarText: initials || 'U',
    avatarBg: u.role === 'coo' ? 'bg-purple-700' : 'bg-indigo-600',
    allowedTabs: u.allowed_tabs || ['dashboard'],
    description: 'Authenticated agency account'
  };
};

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  activePersona: Persona;
  concurrentNotice: string | null;
  clearConcurrentNotice: () => void;
  switchPersona: (personaId: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  canAccessTab: (tabId: string) => boolean;
  can: (resource: string, action: string) => boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  token: null,
  isLoading: true,
  activePersona: AGENCY_PERSONAS[0],
  concurrentNotice: null,
  clearConcurrentNotice: () => {},
  switchPersona: () => {},
  updateCurrentUser: () => {},
  canAccessTab: () => true,
  can: () => true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage strictly requires a valid real JWT token
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('optivir_token');
      if (t && !t.startsWith('ov_jwt_demo_')) return t;
      localStorage.removeItem('optivir_token');
      localStorage.removeItem('optivir_cached_user');
      localStorage.removeItem('optivir_cached_org');
      localStorage.removeItem('optivir_persona_id');
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const t = localStorage.getItem('optivir_token');
        if (t && !t.startsWith('ov_jwt_demo_')) {
          const cached = localStorage.getItem('optivir_cached_user');
          if (cached) return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  });

  const [organization, setOrganization] = useState<Organization | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const t = localStorage.getItem('optivir_token');
        if (t && !t.startsWith('ov_jwt_demo_')) {
          const cached = localStorage.getItem('optivir_cached_org');
          if (cached) return JSON.parse(cached);
        }
      } catch {}
    }
    return null;
  });

  const [activePersona, setActivePersona] = useState<Persona>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUserRaw = localStorage.getItem('optivir_cached_user');
        if (cachedUserRaw) {
          const u = JSON.parse(cachedUserRaw);
          return getPersonaForUser(u);
        }
      } catch {}
    }
    return AGENCY_PERSONAS[0];
  });

  const [isLoading, setIsLoading] = useState(true);
  const [concurrentNotice, setConcurrentNotice] = useState<string | null>(null);
  const clearConcurrentNotice = () => setConcurrentNotice(null);

  useEffect(() => {
    const handleConcurrent = (e: any) => {
      const msg = e.detail?.message || 'Your session has ended because this account was logged into from another system or device.';
      setConcurrentNotice(msg);
      logout();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('optivir:concurrent-session-terminated', handleConcurrent);
      return () => window.removeEventListener('optivir:concurrent-session-terminated', handleConcurrent);
    }
  }, []);

  const updateCurrentUser = React.useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('optivir_cached_user', JSON.stringify(updated));
      } catch {}
      setActivePersona(getPersonaForUser(updated));
      return updated;
    });
  }, []);

  const applyPersona = React.useCallback((persona: Persona) => {
    setActivePersona(persona);
    try {
      localStorage.setItem('optivir_persona_id', persona.id);
    } catch (e) {
      console.warn('Unable to persist persona preference', e);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        let storedToken = localStorage.getItem('optivir_token');

        // Unconditionally purge dummy demo tokens so requests strictly use genuine backend credentials
        if (storedToken && storedToken.startsWith('ov_jwt_demo_')) {
          console.warn('Purged invalid demo token');
          localStorage.removeItem('optivir_token');
          localStorage.removeItem('optivir_cached_user');
          localStorage.removeItem('optivir_cached_org');
          localStorage.removeItem('optivir_persona_id');
          storedToken = null;
        }

        const cachedUserRaw = localStorage.getItem('optivir_cached_user');
        const cachedOrgRaw = localStorage.getItem('optivir_cached_org');

        if (storedToken) {
          setToken(storedToken);

          if (cachedUserRaw) {
            try {
              const parsedUser: User = JSON.parse(cachedUserRaw);
              setUser(parsedUser);
              setActivePersona(getPersonaForUser(parsedUser));
            } catch {}
          }
          if (cachedOrgRaw) {
            try {
              const parsedOrg: Organization = JSON.parse(cachedOrgRaw);
              setOrganization(parsedOrg);
            } catch {}
          }

          // Hydrate user and org state directly from backend /auth/me as the primary source of truth
          try {
            const meRes = await api.getMe();
            if (meRes && meRes.success && meRes.data) {
              const d = meRes.data;
              const isSuper = Boolean(d.is_owner) || d.role_slug === 'super_admin' || d.email?.toLowerCase() === 'optivirads@gmail.com' || d.email?.toLowerCase() === 'abhinandc97@gmail.com';
              const freshUser: User = {
                id: d.id,
                email: d.email,
                firstName: d.first_name,
                lastName: d.last_name,
                phone: d.phone || null,
                avatarUrl: d.avatar_url || d.avatarUrl || null,
                designation: d.designation,
                role: d.role_slug || 'coo',
                roleName: d.role_name || 'Chief Operating Officer',
                isOwner: Boolean(d.is_owner),
                allowed_tabs: isSuper ? ['*'] : (d.allowed_tabs || ['dashboard']),
                clientId: d.client_id || null,
                clientName: d.client_name || null,
                currentDevice: d.currentDevice || d.current_device_info || null
              };
              const freshOrg: Organization = {
                id: d.organization_id || 'org-1',
                name: d.organization_name || 'OptiVir CRM Global',
                slug: d.organization_slug || 'optivir-crm',
                currency: d.currency || 'INR'
              };

              setUser(freshUser);
              setOrganization(freshOrg);
              localStorage.setItem('optivir_cached_user', JSON.stringify(freshUser));
              localStorage.setItem('optivir_cached_org', JSON.stringify(freshOrg));

              if (d.token) {
                localStorage.setItem('optivir_token', d.token);
                setToken(d.token);
              }

              // Always derive persona from the authenticated user
              const userPersona = getPersonaForUser(freshUser);
              setActivePersona(userPersona);
              localStorage.setItem('optivir_persona_id', userPersona.id);
            } else if ((meRes as any)?.status === 401 || (meRes as any)?.status === 403) {
              // Token strictly rejected by server as invalid
              localStorage.removeItem('optivir_token');
              localStorage.removeItem('optivir_cached_user');
              localStorage.removeItem('optivir_cached_org');
              localStorage.removeItem('optivir_persona_id');
              setToken(null);
              setUser(null);
              setOrganization(null);
              setActivePersona(AGENCY_PERSONAS[0]);
            }
          } catch (apiErr: any) {
            // ONLY log out if the backend definitively returns 401/403 HTTP status.
            if (apiErr?.status === 401 || apiErr?.status === 403) {
              console.warn('Session token expired or rejected by server:', apiErr?.message);
              localStorage.removeItem('optivir_token');
              localStorage.removeItem('optivir_cached_user');
              localStorage.removeItem('optivir_cached_org');
              localStorage.removeItem('optivir_persona_id');
              setToken(null);
              setUser(null);
              setOrganization(null);
              setActivePersona(AGENCY_PERSONAS[0]);
            } else {
              console.warn('Server offline or network unavailable during auth sync; retaining local session.');
            }
          }
        } else {
          setToken(null);
          setUser(null);
          setOrganization(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const switchPersona = (personaId: string) => {
    const isMasterOwner = Boolean(user?.isOwner) || user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.role === 'owner';
    // Only master owner or explicit demo mode can switch persona preview
    if (!isMasterOwner && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return;
    }
    const persona = AGENCY_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      applyPersona(persona);
    }
  };

  const canAccessTab = (tabId: string): boolean => {
    // 1. Master Owner / Super Admin / COO
    if (user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.email?.toLowerCase() === 'abhinandc97@gmail.com' || user?.isOwner || user?.role === 'super_admin' || user?.role === 'coo') {
      return true;
    }
    // 2. Active persona role COO or Owner
    if (activePersona?.role === 'coo' || activePersona?.role === 'owner') {
      return true;
    }
    // 3. Client-restricted user: strictly limit to client-facing modules
    if (user?.clientId) {
      const clientAllowed = ['dashboard', 'clients', 'client-360', 'projects', 'tasks', 'marketing', 'finance', 'reports', 'documents', 'notifications'];
      if (!clientAllowed.includes(tabId)) return false;
    }
    // 4. User specific allowed_tabs from database
    if (user?.allowed_tabs && Array.isArray(user.allowed_tabs)) {
      if (user.allowed_tabs.includes('*')) return true;
      return user.allowed_tabs.includes(tabId);
    }
    // 5. Fallback persona check
    if (!activePersona) return true;
    if (activePersona.role === 'owner' || activePersona.allowedTabs.includes('*')) return true;
    return activePersona.allowedTabs.includes(tabId);
  };

  const can = (resource: string, action: string): boolean => {
    const isMasterOwner = Boolean(user?.isOwner) || user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.role === 'owner';

    // Strict Rule: Only primary owner optivirads@gmail.com can create users or assign permissions
    if (resource === 'user_management' || resource === 'users_admin') {
      return isMasterOwner;
    }

    // Critical master actions reserved exclusively for executive owner
    if ((resource === 'billing' || resource === 'security') && action === 'edit') {
      return isMasterOwner;
    }

    if (isMasterOwner || user?.role === 'super_admin') return true;

    // COO operational permissions (all modules except critical master billing/security edit or user creation)
    if (user?.role === 'coo' || activePersona?.role === 'coo') {
      if ((resource === 'billing' || resource === 'security') && action === 'edit') return false;
      return true;
    }

    // Client-scoped user: block internal agency resources
    if (user?.clientId) {
      if (['leads', 'pipeline', 'settings', 'operations', 'teams'].includes(resource)) return false;
    }

    if (user?.allowed_tabs && Array.isArray(user.allowed_tabs)) {
      if (user.allowed_tabs.includes('*') || user.allowed_tabs.includes(resource)) return true;
    }

    if (resource === 'finance' && activePersona.role !== 'finance_lead') return false;
    if (resource === 'settings') return false;
    if (resource === 'pipeline' && activePersona.role !== 'sales_lead') return false;
    if (action === 'delete' && activePersona.role !== 'sales_lead') return false;
    return true;
  };

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    try {
      const res = await api.login(email, pass, rememberMe);
      if (res && res.success && res.data) {
        const loggedInUser: User = {
          ...res.data.user,
          currentDevice: res.data.user?.currentDevice || null
        };
        const loggedInOrg: Organization = res.data.organization;

        localStorage.setItem('optivir_token', res.data.token);
        localStorage.setItem('optivir_cached_user', JSON.stringify(loggedInUser));
        localStorage.setItem('optivir_cached_org', JSON.stringify(loggedInOrg));
        localStorage.setItem('optivir_remember_me', rememberMe ? 'true' : 'false');

        const userPersona = getPersonaForUser(loggedInUser);
        localStorage.setItem('optivir_persona_id', userPersona.id);

        setActivePersona(userPersona);
        setToken(res.data.token);
        setUser(loggedInUser);
        setOrganization(loggedInOrg);
        return;
      }
      throw new Error((res as any)?.message || 'Authentication failed. Please verify your email and password.');
    } catch (apiErr: any) {
      throw new Error(apiErr?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('optivir_token');
    localStorage.removeItem('optivir_cached_user');
    localStorage.removeItem('optivir_cached_org');
    localStorage.removeItem('optivir_persona_id');
    localStorage.removeItem('optivir_remember_me');
    setUser(null);
    setOrganization(null);
    setToken(null);
    setActivePersona(AGENCY_PERSONAS[0]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      token,
      isLoading,
      activePersona,
      concurrentNotice,
      clearConcurrentNotice,
      switchPersona,
      updateCurrentUser,
      canAccessTab,
      can,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
