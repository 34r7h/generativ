import puppeteer from 'puppeteer';

async function debugAdmin() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Intercept API responses to see what data is being returned
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/cms')) {
        try {
          const responseBody = await response.text();
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            body: responseBody
          });
        } catch (error) {
          // Ignore preflight requests
        }
      }
    });
    
    console.log('🔍 Testing admin pages interface...');
    
    // Go to admin pages
    await page.goto('http://localhost:5173/admin/pages', { waitUntil: 'networkidle0' });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what the admin interface actually shows
    const adminData = await page.evaluate(() => {
      // Look for pages table
      const table = document.querySelector('table');
      const rows = document.querySelectorAll('tr[data-page-id], tbody tr, .page-row');
      
      // Get page entries
      const pageEntries = [];
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          pageEntries.push({
            title: cells[0]?.textContent?.trim(),
            slug: cells[1]?.textContent?.trim(),
            status: cells[2]?.textContent?.trim(),
            actions: cells[3]?.textContent?.trim()
          });
        }
      });
      
      // Check for loading states
      const loading = document.querySelector('.loading, .spinner');
      const error = document.querySelector('.error');
      const noPages = document.querySelector('.no-pages, .empty-state');
      
      return {
        hasTable: !!table,
        rowCount: rows.length,
        pageEntries: pageEntries,
        isLoading: !!loading,
        hasError: !!error,
        showsNoPages: !!noPages,
        bodyText: document.body.textContent.substring(0, 1000)
      };
    });
    
    console.log('🎯 Admin Interface Data:');
    console.log(JSON.stringify(adminData, null, 2));
    
    console.log('\n📡 API Responses:');
    apiResponses.forEach((response, index) => {
      console.log(`\n--- API Response ${index + 1} ---`);
      console.log(`Status: ${response.status}`);
      console.log(`Body: ${response.body.substring(0, 500)}...`);
    });
    
    // Now test the API directly from the browser console
    console.log('\n🧪 Testing API directly from browser...');
    const directAPITest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3003/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'getAllPages' })
        });
        const data = await response.json();
        return {
          success: response.ok,
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('\n🔬 Direct API Test Result:');
    console.log(JSON.stringify(directAPITest, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: 'admin-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as admin-debug.png');
    
  } catch (error) {
    console.error('❌ Error during admin debugging:', error);
  } finally {
    await browser.close();
  }
}

debugAdmin().catch(console.error);
