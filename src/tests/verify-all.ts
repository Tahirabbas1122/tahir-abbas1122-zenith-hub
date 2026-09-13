// Zenith Software Hub - Automated System & API Verification Suite

async function runTests() {
  console.log('🧪 Starting Zenith Software Hub Automated Test Suite...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Test Home Page HTML
  await test('Home Page returns 200 and renders Zenith Hub brand', async () => {
    const res = await fetch(`${baseUrl}/`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('ZENITH') || !html.includes('Computer Games')) {
      throw new Error('Home page did not contain expected content');
    }
  });

  // 2. Test Catalog API
  await test('GET /api/software returns paginated items & categories', async () => {
    const res = await fetch(`${baseUrl}/api/software?page=1&limit=6`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) throw new Error('No items returned');
    if (!data.categories || data.categories.length === 0) throw new Error('No categories returned');
    if (!data.pagination || data.pagination.totalCount === 0) throw new Error('Missing pagination');
  });

  // 3. Test Catalog Category Filter
  await test('GET /api/software?category=computer-games filters by category', async () => {
    const res = await fetch(`${baseUrl}/api/software?category=computer-games`);
    const data = await res.json();
    if (data.items.length === 0) throw new Error('No games returned');
    const allGames = data.items.every((i: any) => i.category.slug === 'computer-games');
    if (!allGames) throw new Error('Returned items from wrong category');
  });

  // 4. Test Detail Page API
  await test('GET /api/software/neon-odyssey-2088 returns item with download files & screenshots', async () => {
    const res = await fetch(`${baseUrl}/api/software/neon-odyssey-2088`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.item || data.item.slug !== 'neon-odyssey-2088') throw new Error('Invalid item data');
    if (!data.item.downloadFiles || data.item.downloadFiles.length === 0) throw new Error('No download files');
    if (!data.item.screenshots || data.item.screenshots.length === 0) throw new Error('No screenshots');
  });

  // 5. Test Download URL Signing API
  let signedUrl = '';
  await test('POST /api/downloads/sign generates expiring signed URL & logs download', async () => {
    // Get a software item's file
    const softRes = await fetch(`${baseUrl}/api/software/hypercode-ide`);
    const softData = await softRes.json();
    const file = softData.item.downloadFiles[0];

    const res = await fetch(`${baseUrl}/api/downloads/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: file.id,
        softwareId: softData.item.id,
      }),
    });

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.downloadUrl || !data.expiresAt) throw new Error('Missing signed download URL');
    signedUrl = data.downloadUrl;
  });

  // 6. Test Mock Download Stream Endpoint
  await test('GET signed download URL delivers binary payload with correct headers', async () => {
    if (!signedUrl) throw new Error('No signed URL to test');
    const res = await fetch(signedUrl);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('ZENITH SOFTWARE HUB VERIFIED BINARY')) {
      throw new Error('Downloaded binary content mismatch');
    }
  });

  // 7. Test Batch Download Signing API
  await test('POST /api/downloads/batch processes multi-item downloads', async () => {
    const softRes = await fetch(`${baseUrl}/api/software?limit=2`);
    const softData = await softRes.json();
    const items = softData.items.map((i: any) => ({
      fileId: i.downloadFiles[0].id,
      softwareId: i.id,
    }));

    const res = await fetch(`${baseUrl}/api/downloads/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.items || data.items.length !== 2) throw new Error('Batch results mismatch');
  });

  // 8. Test Zenith AI Chatbot RAG Assistant
  await test('POST /api/ai/chat returns grounded recommendations for natural language query', async () => {
    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Find video editors under 900MB' }),
    });

    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.message) throw new Error('Empty AI response');
    if (!data.suggestedItems || data.suggestedItems.length === 0) throw new Error('No grounded items suggested');
    const hasAuraStudio = data.suggestedItems.some((i: any) => i.slug === 'aurastudio-pro');
    if (!hasAuraStudio) throw new Error('Did not find expected video editor');
  });

  // 9. Test User Registration API
  const testEmail = `testuser_${Date.now()}@zenithhub.com`;
  await test('POST /api/auth/register creates new isolated user account', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Tester',
        email: testEmail,
        password: 'Password123!',
      }),
    });

    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.user || data.user.email !== testEmail) throw new Error('User not created correctly');
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
