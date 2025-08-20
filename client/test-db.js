import puppeteer from 'puppeteer';

async function testDatabase() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    console.log('🔍 Testing database operations...');
    
    // Test getAllPages
    console.log('\n📊 Testing getAllPages...');
    const getAllPagesResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3003/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getAllPages' })
      });
      return await response.json();
    });
    
    console.log('getAllPages response:', JSON.stringify(getAllPagesResponse, null, 2));
    
    // Test getPageBySlug for 'home'
    console.log('\n🏠 Testing getPageBySlug for "home"...');
    const getPageBySlugResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3003/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getPageBySlug', slug: 'home' })
      });
      return await response.json();
    });
    
    console.log('getPageBySlug response:', JSON.stringify(getPageBySlugResponse, null, 2));
    
    // Test getPageBySlug for 'about'
    console.log('\n📄 Testing getPageBySlug for "about"...');
    const getAboutPageResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3003/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getPageBySlug', slug: 'about' })
      });
      return await response.json();
    });
    
    console.log('getPageBySlug for "about" response:', JSON.stringify(getAboutPageResponse, null, 2));
    
    // Test creating a new page to see if it works
    console.log('\n➕ Testing createPage...');
    const createPageResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3003/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'createPage', 
          page: {
            title: 'Test Page',
            slug: 'test-page',
            content: 'This is a test page',
            template: 'default',
            isPublished: true
          }
        })
      });
      return await response.json();
    });
    
    console.log('createPage response:', JSON.stringify(createPageResponse, null, 2));
    
    // Test getAllPages again to see if the new page appears
    console.log('\n📊 Testing getAllPages again...');
    const getAllPagesResponse2 = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3003/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'getAllPages' })
      });
      return await response.json();
    });
    
    console.log('getAllPages response (after create):', JSON.stringify(getAllPagesResponse2, null, 2));
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testDatabase().catch(console.error);
