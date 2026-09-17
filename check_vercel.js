async function checkVercel() {
  const htmlRes = await fetch('https://optivircrm.vercel.app/?tab=settings');
  const html = await htmlRes.text();
  
  const scriptMatches = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)];
  console.log('Found scripts:', scriptMatches.length);

  for (const match of scriptMatches) {
    const scriptUrl = `https://optivircrm.vercel.app${match[1]}`;
    const jsRes = await fetch(scriptUrl);
    const js = await jsRes.text();
    if (js.includes('crm-s5tr') || js.includes('localhost:5000') || js.includes('onrender.com') || js.includes('api.createSettingsUser') || js.includes('createSettingsUser')) {
      console.log('Match in script:', scriptUrl);
      const urlMatches = js.match(/https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?/g);
      console.log('URLs in script:', [...new Set(urlMatches)].filter(u => u.includes('5000') || u.includes('render') || u.includes('vercel') || u.includes('/api')));
    }
  }
}

checkVercel().catch(console.error);
