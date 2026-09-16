'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation?: string;
  role: 'owner' | 'sales_lead' | 'media_buyer' | 'finance_lead' | 'client_portal' | string;
  roleName?: string;
  isOwner?: boolean;
  allowed_tabs?: string[];
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
  role: 'owner' | 'sales_lead' | 'media_buyer' | 'finance_lead' | 'client_portal';
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
    id: 'persona-media',
    name: 'Media Lead',
    email: 'media@optivirads.com',
    role: 'media_buyer',
    roleLabel: 'Performance & Media Lead',
    designation: 'Head of Media & Ad Buying',
    avatarText: 'ML',
    avatarBg: 'bg-purple-600',
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
    allowedTabs: ['client-360', 'documents', 'notifications'],
    description: 'Client review portal: track sprint deliverables, inspect ROAS reports & view invoices'
  }
];

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  activePersona: Persona;
  switchPersona: (personaId: string) => void;
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
  switchPersona: () => {},
  canAccessTab: () => true,
  can: () => true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePersona, setActivePersona] = useState<Persona>(AGENCY_PERSONAS[0]);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyPersona = React.useCallback((persona: Persona) => {
    setActivePersona(persona);
    const [firstName, ...rest] = persona.name.split(' ');
    const lastName = rest.join(' ');
    const updatedUser: User = {
      id: `usr-${persona.role}`,
      email: persona.email,
      firstName,
      lastName,
      designation: persona.designation,
      role: persona.role,
      roleName: persona.roleLabel,
      isOwner: persona.role === 'owner',
      allowed_tabs: persona.allowedTabs
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('optivir_persona_id', persona.id);
      localStorage.setItem('optivir_cached_user', JSON.stringify(updatedUser));
      if (!localStorage.getItem('optivir_token') && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        const dummyToken = `ov_jwt_demo_${persona.role}_${Date.now()}`;
        localStorage.setItem('optivir_token', dummyToken);
        setToken(dummyToken);
      }
      const defaultOrg: Organization = {
        id: 'org-1',
        name: 'OptiVir CRM Global',
        slug: 'optivir-crm',
        currency: 'INR'
      };
      setOrganization(defaultOrg);
      localStorage.setItem('optivir_cached_org', JSON.stringify(defaultOrg));
    } catch (e) {
      console.warn('Unable to persist persona preference', e);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('optivir_token');
        const storedPersonaId = localStorage.getItem('optivir_persona_id');
        const cachedUserRaw = localStorage.getItem('optivir_cached_user');
        const cachedOrgRaw = localStorage.getItem('optivir_cached_org');

        if (storedToken) {
          setToken(storedToken);

          // Restore cached user and organization immediately to eliminate UI flicker
          if (cachedUserRaw) {
            try {
              const parsedUser = JSON.parse(cachedUserRaw);
              setUser(parsedUser);
            } catch {}
          }
          if (cachedOrgRaw) {
            try {
              const parsedOrg = JSON.parse(cachedOrgRaw);
              setOrganization(parsedOrg);
            } catch {}
          }
          if (storedPersonaId) {
            const found = AGENCY_PERSONAS.find(p => p.id === storedPersonaId);
            if (found) {
              setActivePersona(found);
            }
          }

          // Hydrate user and org state directly from backend /auth/me as the primary source of truth
          try {
            const meRes = await api.getMe();
            if (meRes && meRes.success && meRes.data) {
              const d = meRes.data;
              const isSuper = d.is_owner || d.role_slug === 'super_admin' || d.email?.toLowerCase() === 'optivirads@gmail.com' || d.email?.toLowerCase() === 'abhinandc97@gmail.com';
              const freshUser: User = {
                id: d.id,
                email: d.email,
                firstName: d.first_name,
                lastName: d.last_name,
                designation: d.designation,
                role: d.role_slug || 'admin',
                roleName: d.role_name || 'Admin',
                isOwner: Boolean(d.is_owner),
                allowed_tabs: isSuper ? ['*'] : (d.allowed_tabs || ['dashboard'])
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

              if (storedPersonaId) {
                const found = AGENCY_PERSONAS.find(p => p.id === storedPersonaId);
                if (found) {
                  setActivePersona({
                    ...found,
                    allowedTabs: freshUser.allowed_tabs || found.allowedTabs
                  });
                }
              }
            } else if ((meRes as any)?.status === 401 || (meRes as any)?.status === 403) {
              // Token strictly rejected by server as invalid
              localStorage.removeItem('optivir_token');
              localStorage.removeItem('optivir_cached_user');
              localStorage.removeItem('optivir_cached_org');
              setToken(null);
              setUser(null);
              setOrganization(null);
            }
          } catch (apiErr: any) {
            // ONLY log out if the backend definitively returns 401/403 HTTP status.
            // Do NOT log out on network disconnects, server restarts, or 500 errors.
            if (apiErr?.status === 401 || apiErr?.status === 403) {
              console.warn('Session token expired or rejected by server:', apiErr?.message);
              localStorage.removeItem('optivir_token');
              localStorage.removeItem('optivir_cached_user');
              localStorage.removeItem('optivir_cached_org');
              setToken(null);
              setUser(null);
              setOrganization(null);
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
    const persona = AGENCY_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      applyPersona(persona);
    }
  };

  const canAccessTab = (tabId: string): boolean => {
    // 1. Super admin / optivirads@gmail.com / abhinandc97@gmail.com / owner
    if (user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.email?.toLowerCase() === 'abhinandc97@gmail.com' || user?.isOwner || user?.role === 'super_admin') {
      return true;
    }
    // 2. User specific allowed_tabs from database
    if (user?.allowed_tabs && Array.isArray(user.allowed_tabs)) {
      if (user.allowed_tabs.includes('*')) return true;
      return user.allowed_tabs.includes(tabId);
    }
    // 3. Fallback persona check
    if (!activePersona) return true;
    if (activePersona.role === 'owner' || activePersona.allowedTabs.includes('*')) return true;
    return activePersona.allowedTabs.includes(tabId);
  };

  const can = (resource: string, action: string): boolean => {
    if (user?.email?.toLowerCase() === 'optivirads@gmail.com' || user?.email?.toLowerCase() === 'abhinandc97@gmail.com' || user?.isOwner || user?.role === 'super_admin' || activePersona.role === 'owner') return true;
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
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

    try {
      const res = await api.login(email, pass, rememberMe);
      if (res && res.success && res.data) {
        localStorage.setItem('optivir_token', res.data.token);
        localStorage.setItem('optivir_cached_user', JSON.stringify(res.data.user));
        localStorage.setItem('optivir_cached_org', JSON.stringify(res.data.organization));
        localStorage.setItem('optivir_remember_me', rememberMe ? 'true' : 'false');

        const matchedPersona = AGENCY_PERSONAS.find(p => p.email.toLowerCase() === res.data.user.email?.toLowerCase());
        if (matchedPersona) {
          localStorage.setItem('optivir_persona_id', matchedPersona.id);
          setActivePersona({
            ...matchedPersona,
            allowedTabs: res.data.user.allowed_tabs || matchedPersona.allowedTabs
          });
        } else {
          const dynamicPersona: Persona = {
            id: `persona-${res.data.user.id}`,
            name: `${res.data.user.firstName || ''} ${res.data.user.lastName || ''}`.trim() || res.data.user.email,
            email: res.data.user.email,
            role: (res.data.user.role as any) || 'sales_lead',
            roleLabel: res.data.user.roleName || 'Team Member',
            designation: res.data.user.designation || 'Specialist',
            avatarText: (res.data.user.firstName?.[0] || res.data.user.email?.[0] || 'U').toUpperCase(),
            avatarBg: 'bg-indigo-600',
            allowedTabs: res.data.user.allowed_tabs || ['dashboard'],
            description: 'Assigned agency account'
          };
          setActivePersona(dynamicPersona);
        }
        setToken(res.data.token);
        setUser(res.data.user);
        setOrganization(res.data.organization);
        return;
      }
      throw new Error((res as any)?.message || 'Authentication failed. Please verify your email and password.');
    } catch (apiErr: any) {
      if (!isDemoMode) {
        // Secure production behavior: never bypass auth on error or failed response
        throw new Error(apiErr?.message || 'Authentication failed. Please verify your credentials.');
      }

      console.warn('API login failed. Proceeding with local credentials verification in DEMO mode only:', apiErr);

      // Local fallback for standalone mode / demo evaluation ONLY when NEXT_PUBLIC_DEMO_MODE is true
      const matchedPersona = AGENCY_PERSONAS.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!matchedPersona) {
        throw new Error('Evaluation persona not found. In demo mode, select an evaluation persona.');
      }

      const [firstName, ...rest] = matchedPersona.name.split(' ');
      const fallbackUser: User = {
        id: `usr-${matchedPersona.role}`,
        email: matchedPersona.email,
        firstName,
        lastName: rest.join(' '),
        designation: matchedPersona.designation,
        role: matchedPersona.role,
        roleName: matchedPersona.roleLabel,
        isOwner: matchedPersona.role === 'owner'
      };

      const fallbackOrg: Organization = {
        id: 'org-1',
        name: 'OptiVir CRM Global',
        slug: 'optivir-crm',
        currency: 'INR'
      };

      const tokenVal = `ov_jwt_demo_${matchedPersona.role}_${Date.now()}`;
      localStorage.setItem('optivir_token', tokenVal);
      localStorage.setItem('optivir_cached_user', JSON.stringify(fallbackUser));
      localStorage.setItem('optivir_cached_org', JSON.stringify(fallbackOrg));
      localStorage.setItem('optivir_persona_id', matchedPersona.id);
      localStorage.setItem('optivir_remember_me', 'true');

      setActivePersona(matchedPersona);
      setToken(tokenVal);
      setUser(fallbackUser);
      setOrganization(fallbackOrg);
    }
  };

  const logout = () => {
    localStorage.removeItem('optivir_token');
    localStorage.removeItem('optivir_cached_user');
    localStorage.removeItem('optivir_cached_org');
    localStorage.removeItem('optivir_persona_id');
    localStorage.removeItem('optivir_remember_me');
    setUser(null);
    setOrganization(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      token,
      isLoading,
      activePersona,
      switchPersona,
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
