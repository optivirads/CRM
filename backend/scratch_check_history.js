const { execSync } = require('child_process');
const files = [
  'frontend/src/app/page.tsx',
  'frontend/src/app/globals.css',
  'frontend/src/components/layout/Sidebar.tsx',
  'frontend/src/components/layout/Header.tsx',
  'frontend/src/components/operations/SettingsView.tsx',
  'frontend/src/components/crm/LeadsView.tsx',
  'frontend/src/components/clients/ClientsListView.tsx'
];

for (const f of files) {
  try {
    const diff = execSync(`git diff 3a2d9ae..46a8652 -- ${f}`).toString();
    console.log(`Diff 3a2d9ae..46a8652 for ${f}: ${diff.length} bytes`);
  } catch (e) {
    console.log(`Error for ${f}:`, e.message);
  }
}
