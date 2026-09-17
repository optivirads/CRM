import dotenv from 'dotenv';
dotenv.config();

const API_PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${API_PORT}/api`;

async function testSingleSession() {
  console.log('🧪 Starting Single Active Session & Device Tracking Verification...\n');

  const testEmail = 'optivirads@gmail.com';
  const testPass = 'admin123';

  // 1. Login from System 1 (Windows Chrome)
  console.log('1️⃣  Attempting login from System 1 (Windows 11 / Chrome)...');
  const res1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({ email: testEmail, password: testPass, rememberMe: true })
  });

  const data1: any = await res1.json();
  if (!res1.ok || !data1.success) {
    throw new Error(`Login System 1 failed: ${JSON.stringify(data1)}`);
  }
  const token1 = data1.data.token;
  const user1 = data1.data.user;
  console.log('✅ System 1 Logged in successfully!');
  console.log(`   Device detected: ${user1.currentDevice?.formatted}`);
  console.log(`   Client IP: ${user1.currentDevice?.ip}`);

  // 2. Verify /auth/me with Token 1
  console.log('\n2️⃣  Verifying /auth/me for System 1...');
  const meRes1 = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token1}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    }
  });
  const meData1: any = await meRes1.json();
  if (meRes1.status !== 200) {
    throw new Error(`System 1 /auth/me failed: ${JSON.stringify(meData1)}`);
  }
  console.log('✅ System 1 session is active and valid (HTTP 200 OK)');

  // 3. Login from System 2 (macOS Safari) with the same account
  console.log('\n3️⃣  Attempting concurrent login from System 2 (macOS / Safari)...');
  const res2 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
    },
    body: JSON.stringify({ email: testEmail, password: testPass, rememberMe: true })
  });

  const data2: any = await res2.json();
  if (!res2.ok || !data2.success) {
    throw new Error(`Login System 2 failed: ${JSON.stringify(data2)}`);
  }
  const token2 = data2.data.token;
  const user2 = data2.data.user;
  console.log('✅ System 2 Logged in successfully!');
  console.log(`   Device detected: ${user2.currentDevice?.formatted}`);

  // 4. Verify System 1 is now INVALIDATED / TERMINATED!
  console.log('\n4️⃣  Testing System 1 after System 2 logged in (Single System Enforcement)...');
  const meResOld = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token1}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    }
  });
  const meDataOld: any = await meResOld.json();
  console.log(`   System 1 Response Status: HTTP ${meResOld.status}`);
  console.log(`   System 1 Response Code: ${meDataOld.code}`);
  console.log(`   System 1 Message: "${meDataOld.message}"`);

  if (meResOld.status === 401 && meDataOld.code === 'CONCURRENT_SESSION_TERMINATED') {
    console.log('🎯 SUCCESS: System 1 was immediately terminated with CONCURRENT_SESSION_TERMINATED!');
  } else {
    throw new Error(`Single-session check failed! Expected 401 CONCURRENT_SESSION_TERMINATED, got: ${meResOld.status}`);
  }

  // 5. Verify System 2 is still valid
  console.log('\n5️⃣  Verifying System 2 remains active...');
  const meResNew = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token2}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
    }
  });
  const meDataNew: any = await meResNew.json();
  if (meResNew.status === 200) {
    console.log('✅ System 2 is active and healthy (HTTP 200 OK)');
    console.log(`   Active device confirmed: ${meDataNew.data?.currentDevice?.formatted}`);
  } else {
    throw new Error(`System 2 check failed: ${JSON.stringify(meDataNew)}`);
  }

  // 6. Test Admin Session Revoke
  console.log('\n6️⃣  Testing Admin Revoke Session for System 2...');
  const revokeRes = await fetch(`${BASE_URL}/settings/users/${user2.id}/revoke-session`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token2}`,
      'Content-Type': 'application/json'
    }
  });
  const revokeData: any = await revokeRes.json();
  if (revokeRes.status !== 200 || !revokeData.success) {
    throw new Error(`Revoke session failed: ${JSON.stringify(revokeData)}`);
  }
  console.log('✅ Admin revoked session successfully');

  // 7. Verify System 2 is now revoked
  console.log('\n7️⃣  Verifying System 2 after revocation...');
  const meRevoked = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token2}`
    }
  });
  const meRevokedData: any = await meRevoked.json();
  console.log(`   System 2 Response Status: HTTP ${meRevoked.status}`);
  console.log(`   System 2 Code: ${meRevokedData.code}`);
  if (meRevoked.status === 401 && meRevokedData.code === 'SESSION_REVOKED') {
    console.log('🎯 SUCCESS: Revoked system rejected with SESSION_REVOKED (HTTP 401)');
  } else {
    throw new Error(`Expected 401 SESSION_REVOKED, got: ${meRevoked.status}`);
  }

  console.log('\n🎉 ALL SINGLE-SYSTEM ENFORCEMENT & DEVICE TRACKING TESTS PASSED PERFECTLY!\n');
}

testSingleSession().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
