async function testLive() {
  const RENDER_URL = 'https://crm-s5tr.onrender.com';
  console.log('1. Testing Render health...');
  const healthRes = await fetch(`${RENDER_URL}/health`);
  console.log('Health status:', healthRes.status, await healthRes.json());

  console.log('2. Testing Render login as optivirads@gmail.com...');
  const loginRes = await fetch(`${RENDER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'optivirads@gmail.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  console.log('Login result:', loginRes.status, loginData.success ? 'Logged in successfully!' : loginData);
  if (!loginData.success) return;

  const token = loginData.data.token;
  console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NONE');

  console.log('3. Testing GET /api/settings/users on Render...');
  const usersRes = await fetch(`${RENDER_URL}/api/settings/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Users res status:', usersRes.status);
  const usersData = await usersRes.json();
  console.log('Users list count:', usersData.data?.length);

  console.log('4. Testing POST /api/settings/users on Render with test user...');
  const testEmail = `test.create.${Date.now()}@optivirads.com`;
  const createRes = await fetch(`${RENDER_URL}/api/settings/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testEmail,
      name: 'Automated Test User',
      role: 'marketing_lead',
      designation: 'Head of Marketing',
      password: 'Optivir@2026',
      allowed_tabs: ['dashboard', 'marketing', 'reports']
    })
  });
  console.log('Create user res status:', createRes.status);
  const createData = await createRes.json();
  console.log('Create user data:', createData);
}

testLive().catch(console.error);
