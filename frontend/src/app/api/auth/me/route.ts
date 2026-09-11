import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Authentication token required' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: 'usr-owner',
      email: 'optivirads@gmail.com',
      first_name: 'Marcus',
      last_name: 'Vance',
      designation: 'Managing Director • OptiVir',
      role_name: 'Executive & Owner',
      role_slug: 'owner',
      is_owner: true,
      organization_id: 'org-1',
      organization_name: 'OptiVir CRM Global',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }
  });
}
