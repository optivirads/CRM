const { execSync } = require('child_process');
const commits = execSync('git log --format="%H %s"').toString().trim().split('\n');
console.log('Total commits:', commits.length);

for (const line of commits) {
  const [hash, ...rest] = line.split(' ');
  const msg = rest.join(' ');
  try {
    const code = execSync(`git show ${hash}:frontend/src/components/operations/SettingsView.tsx`).toString();
    const hasAudit = code.includes('AUDIT TELEMETRY');
    const hasSignOutDevice = code.includes('Sign Out Device');
    const maxWMatch = code.match(/max-w-\[?[0-9a-zA-Z]+\]?/g);
    console.log(`${hash.slice(0, 7)} | ${msg.slice(0, 45).padEnd(45)} | Audit: ${hasAudit} | SignOutDev: ${hasSignOutDevice} | maxW: ${maxWMatch ? maxWMatch.slice(0, 2).join(',') : 'none'}`);
  } catch (e) {
    console.log(`${hash.slice(0, 7)} | ${msg.slice(0, 45).padEnd(45)} | error`);
  }
}
