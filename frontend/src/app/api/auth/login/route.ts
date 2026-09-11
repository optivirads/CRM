import { NextResponse } from 'next/server';

const AGENCY_USERS: Record<string, any> = {
  'optivirads@gmail.com': {
    id: 'usr-owner',
    email: 'optivirads@gmail.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    designation: 'Managing Director • OptiVir',
    role: 'owner',
    roleName: 'Executive & Owner',
    isOwner: true,
  },
  'sales@optivirads.com': {
    id: 'usr-sales',
    email: 'sales@optivirads.com',
    firstName: 'Growth',
    lastName: 'Lead',
    designation: 'Head of Growth & Pipeline',
    role: 'sales_lead',
    roleName: 'Sales Lead / AE',
    isOwner: false,
  },
  'media@optivirads.com': {
    id: 'usr-media',
    email: 'media@optivirads.com',
    firstName: 'Media',
    lastName: 'Lead',
    designation: 'Head of Media & Ad Buying',
    role: 'media_buyer',
    roleName: 'Performance & Media Lead',
    isOwner: false,
  },
  'finance@optivirads.com': {
    id: 'usr-finance',
    email: 'finance@optivirads.com',
    firstName: 'Finance',
    lastName: 'Lead',
    designation: 'Financial Controller',
    role: 'finance_lead',
    roleName: 'Finance & Billing Lead',
    isOwner: false,
  },
  'client@portal.com': {
    id: 'usr-client',
    email: 'client@portal.com',
    firstName: 'Client',
    lastName: 'Partner',
    designation: 'Client Review Portal',
    role: 'client_portal',
    roleName: 'Client Stakeholder',
    isOwner: false,
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = AGENCY_USERS[cleanEmail] || {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      firstName: cleanEmail.split('@')[0].toUpperCase(),
      lastName: 'User',
      designation: 'Agency Specialist',
      role: 'owner',
      roleName: 'Executive & Owner',
      isOwner: true,
    };

    const token = `ov_jwt_${user.role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      data: {
        token,
        user,
        organization: {
          id: 'org-1',
          name: 'OptiVir CRM Global',
          slug: 'optivir-crm',
          currency: 'INR'
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
