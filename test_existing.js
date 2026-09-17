async function testExistingUser() {
  const RENDER_URL = 'https://crm-s5tr.onrender.com';
  const loginRes = await fetch(`${RENDER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'optivirads@gmail.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  console.log('Sending POST /api/settings/users for jananiavni18@gmail.com...');
  const res = await fetch(`${RENDER_URL}/api/settings/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'jananiavni18@gmail.com',
      name: 'Soumya K',
      role: 'marketing_lead',
      designation: 'Head of Marketing',
      password: 'Optivir@2026',
      allowed_tabs: ['dashboard', 'clients', 'projects', 'tasks', 'marketing', 'reports']
    })
  });

  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Response body:', data);
}

testExistingUser().catch(console.error);
