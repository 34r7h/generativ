import puppeteer from 'puppeteer';

async function debugAPI() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Intercept and log all API responses
    const apiResponses = [];
    
    page.on('response', async response => {
      if (response.url().includes('/cms')) {
        try {
          const responseBody = await response.text();
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            body: responseBody
          });
          console.log(`📡 API Response to ${response.url()}:`, responseBody);
        } catch (error) {
          console.error('Error reading response body:', error);
        }
      }
    });
    
    console.log('🔍 Loading home page to capture API responses...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Wait for all API calls to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📊 All API Responses Captured:');
    apiResponses.forEach((response, index) => {
      console.log(`\n--- Response ${index + 1} ---`);
      console.log(`URL: ${response.url}`);
      console.log(`Status: ${response.status}`);
      console.log(`Body: ${response.body}`);
    });
    
    // Now check what the Vue component actually has
    const vueData = await page.evaluate(() => {
      // Try to access the Vue component data
      const app = document.querySelector('#app');
      
      // Look for any Vue-related data
      const pageData = window.pageData;
      const vueApp = window.__VUE_APP__;
      
      // Check if there are any reactive refs
      const refs = [];
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        refs.push('Vue DevTools detected');
      }
      
      return {
        pageData: pageData,
        vueApp: !!vueApp,
        refs: refs,
        bodyText: document.body.textContent.substring(0, 1000)
      };
    });
    
    console.log('\n🎯 Vue Component Data:');
    console.log(JSON.stringify(vueData, null, 2));
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugAPI().catch(console.error);
