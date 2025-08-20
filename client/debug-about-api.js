import puppeteer from 'puppeteer';

async function debugAboutAPI() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Intercept API responses
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
    
    console.log('🔍 Testing About page API calls...');
    
    // Go to about page
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check current state
    const pageState = await page.evaluate(() => {
      const loading = document.querySelector('.loading-state');
      const error = document.querySelector('.error-state');
      const content = document.querySelector('.page-section, .page-hero');
      
      return {
        isLoading: !!loading,
        hasError: !!error,
        hasContent: !!content,
        errorText: error ? error.textContent : null,
        bodyText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('📄 Page State:');
    console.log(JSON.stringify(pageState, null, 2));
    
    console.log('\n📡 API Responses:');
    apiResponses.forEach((response, index) => {
      console.log(`\n--- API Response ${index + 1} ---`);
      console.log(`Status: ${response.status}`);
      console.log(`Body: ${response.body.substring(0, 500)}...`);
    });
    
    // Test API directly
    console.log('\n🧪 Testing API directly...');
    const directAPITest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3003/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'getPageBySlug', slug: 'about' })
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
    await page.screenshot({ path: 'about-api-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as about-api-debug.png');
    
  } catch (error) {
    console.error('❌ Error during API debugging:', error);
  } finally {
    await browser.close();
  }
}

debugAboutAPI().catch(console.error);
