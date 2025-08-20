import puppeteer from 'puppeteer';

async function debugAdminAuth() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    console.log('🔍 Testing admin authentication flow...');
    
    // Go to admin pages first
    await page.goto('http://localhost:5173/admin/pages', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check current URL and page content
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasLoginForm: !!document.querySelector('form, input[type="email"], input[type="password"]'),
        hasAdminInterface: !!document.querySelector('.admin-header, .admin-sidebar, table'),
        bodyText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('📄 Page Content:', JSON.stringify(pageContent, null, 2));
    
    // If we're on login page, let's try to login
    if (pageContent.hasLoginForm) {
      console.log('🔐 Attempting to login...');
      
      // Clear existing values and fill login form with correct credentials
      await page.click('input[type="email"]', {clickCount: 3});
      await page.type('input[type="email"]', 'admin3@generativ.cc');
      await page.click('input[type="password"]', {clickCount: 3});
      await page.type('input[type="password"]', 'Admin123!');
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const afterLoginUrl = page.url();
      console.log(`📍 After login URL: ${afterLoginUrl}`);
      
      // Check if we're now in admin interface
      const adminContent = await page.evaluate(() => {
        const table = document.querySelector('table');
        const rows = document.querySelectorAll('tbody tr, tr[data-page-id]');
        
        const pageEntries = [];
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            pageEntries.push({
              title: cells[0]?.textContent?.trim(),
              slug: cells[1]?.textContent?.trim(),
              status: cells[2]?.textContent?.trim()
            });
          }
        });
        
        return {
          hasTable: !!table,
          rowCount: rows.length,
          pageEntries: pageEntries,
          hasAdminHeader: !!document.querySelector('.admin-header'),
          hasSidebar: !!document.querySelector('.admin-sidebar'),
          bodyText: document.body.textContent.substring(0, 1000)
        };
      });
      
      console.log('🎯 Admin Interface After Login:');
      console.log(JSON.stringify(adminContent, null, 2));
      
      // Navigate to pages section
      console.log('📄 Navigating to pages section...');
      await page.goto('http://localhost:5173/admin/pages', { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check pages interface
      const pagesInterface = await page.evaluate(() => {
        const table = document.querySelector('table');
        const rows = document.querySelectorAll('tbody tr, tr[data-page-id]');
        
        const pageEntries = [];
        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            pageEntries.push({
              rowIndex: index,
              title: cells[0]?.textContent?.trim(),
              slug: cells[1]?.textContent?.trim(),
              status: cells[2]?.textContent?.trim(),
              actions: cells[3]?.textContent?.trim()
            });
          }
        });
        
        // Also check for any loading or error states
        const loading = document.querySelector('.loading, .spinner');
        const error = document.querySelector('.error');
        const noPages = document.querySelector('.no-pages, .empty-state');
        
        return {
          hasTable: !!table,
          totalRows: rows.length,
          pageEntries: pageEntries,
          isLoading: !!loading,
          hasError: !!error,
          showsNoPages: !!noPages,
          tableHTML: table ? table.outerHTML.substring(0, 500) : null,
          bodyText: document.body.textContent.substring(0, 1000)
        };
      });
      
      console.log('📋 Pages Interface Analysis:');
      console.log(JSON.stringify(pagesInterface, null, 2));
      
      // Take screenshot of admin interface
      await page.screenshot({ path: 'admin-pages-final.png', fullPage: true });
      console.log('📸 Screenshot saved as admin-pages-final.png');
    }
    
  } catch (error) {
    console.error('❌ Error during admin auth debugging:', error);
  } finally {
    await browser.close();
  }
}

debugAdminAuth().catch(console.error);
