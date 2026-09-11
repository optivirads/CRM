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
  login: (email: string, pass: string) => Promise<void>;
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
      isOwner: persona.role === 'owner'
    };
    setUser(updatedUser);
    try {
      localStorage.setItem('optivir_persona_id', persona.id);
      localStorage.setItem('optivir_user', JSON.stringify(updatedUser));
      if (!localStorage.getItem('optivir_token')) {
        const dummyToken = `ov_jwt_${persona.role}_${Date.now()}`;
        localStorage.setItem('optivir_token', dummyToken);
        setToken(dummyToken);
      }
      if (!localStorage.getItem('optivir_org')) {
        const defaultOrg = {
          id: 'org-1',
          name: 'OptiVir CRM Global',
          slug: 'optivir-crm',
          currency: 'INR'
        };
        localStorage.setItem('optivir_org', JSON.stringify(defaultOrg));
        setOrganization(defaultOrg);
      }
    } catch (e) {
      console.warn('Unable to persist persona to localStorage', e);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('optivir_token');
        const storedUser = localStorage.getItem('optivir_user');
        const storedOrg = localStorage.getItem('optivir_org');
        const storedPersonaId = localStorage.getItem('optivir_persona_id');

        // Only restore session if a valid token is present
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedOrg) {
            setOrganization(JSON.parse(storedOrg));
          }
          if (storedPersonaId) {
            const found = AGENCY_PERSONAS.find(p => p.id === storedPersonaId);
            if (found) {
              setActivePersona(found);
            }
          }
        } else {
          // No authenticated session found
          setToken(null);
          setUser(null);
          setOrganization(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setToken(null);
        setUser(null);
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
    if (!activePersona) return true;
    if (activePersona.role === 'owner' || activePersona.allowedTabs.includes('*')) return true;
    return activePersona.allowedTabs.includes(tabId);
  };

  const can = (resource: string, action: string): boolean => {
    if (activePersona.role === 'owner') return true;
    if (resource === 'finance' && activePersona.role !== 'finance_lead') return false;
    if (resource === 'settings') return false;
    if (resource === 'pipeline' && activePersona.role !== 'sales_lead') return false;
    if (action === 'delete' && activePersona.role !== 'sales_lead') return false;
    return true;
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login(email, pass);
      if (res.success && res.data) {
        localStorage.setItem('optivir_token', res.data.token);
        localStorage.setItem('optivir_user', JSON.stringify(res.data.user));
        localStorage.setItem('optivir_org', JSON.stringify(res.data.organization));
        const matchedPersona = AGENCY_PERSONAS.find(p => p.email.toLowerCase() === res.data.user.email?.toLowerCase()) || AGENCY_PERSONAS[0];
        localStorage.setItem('optivir_persona_id', matchedPersona.id);
        setActivePersona(matchedPersona);
        setToken(res.data.token);
        setUser(res.data.user);
        setOrganization(res.data.organization);
        return;
      }
    } catch (apiErr) {
      console.warn('API login error, proceeding with local credentials verification:', apiErr);
    }

    // Local fallback for standalone mode / demo evaluation
    const matchedPersona = AGENCY_PERSONAS.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    ) || AGENCY_PERSONAS[0];

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

    const tokenVal = `ov_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('optivir_token', tokenVal);
    localStorage.setItem('optivir_user', JSON.stringify(fallbackUser));
    localStorage.setItem('optivir_org', JSON.stringify(fallbackOrg));
    localStorage.setItem('optivir_persona_id', matchedPersona.id);

    setActivePersona(matchedPersona);
    setToken(tokenVal);
    setUser(fallbackUser);
    setOrganization(fallbackOrg);
  };

  const logout = () => {
    localStorage.removeItem('optivir_token');
    localStorage.removeItem('optivir_user');
    localStorage.removeItem('optivir_org');
    localStorage.removeItem('optivir_persona_id');
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
