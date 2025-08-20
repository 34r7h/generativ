import puppeteer from 'puppeteer';

async function inspectPages() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/cms')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    console.log('🔍 Inspecting Home Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check what's actually being displayed
    const homePageContent = await page.evaluate(() => {
      // Try to access Vue component data
      const vueApp = document.querySelector('#app')?.__vue_app__;
      const pageData = window.pageData;
      
      // Check console logs for debugging
      const consoleLogs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        consoleLogs.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      const sections = document.querySelectorAll('.page-section');
      const heroSection = document.querySelector('.hero-section');
      const pageContent = document.querySelector('.page-content');
      
      return {
        pageDataExists: !!pageData,
        pageDataValue: pageData,
        vueAppExists: !!vueApp,
        consoleLogs: consoleLogs,
        sectionsCount: sections.length,
        heroSectionExists: !!heroSection,
        pageContentExists: !!pageContent,
        pageContentText: pageContent ? pageContent.textContent : null,
        heroTitle: heroSection ? heroSection.querySelector('h1')?.textContent : null,
        heroDescription: heroSection ? heroSection.querySelector('p')?.textContent : null,
        allText: document.body.textContent.substring(0, 500) + '...'
      };
    });
    
    console.log('🏠 Home Page Inspection Results:');
    console.log(JSON.stringify(homePageContent, null, 2));
    
    console.log('🌐 Network Requests:');
    console.log(JSON.stringify(requests, null, 2));
    
    console.log('📡 CMS API Responses:');
    console.log(JSON.stringify(responses, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'home-page-inspection.png', fullPage: true });
    console.log('📸 Screenshot saved as home-page-inspection.png');
    
    // Now check the About page
    console.log('\n🔍 Inspecting About Page...');
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aboutPageContent = await page.evaluate(() => {
      const pageData = window.pageData;
      const sections = document.querySelectorAll('.page-section');
      const pageHero = document.querySelector('.page-hero');
      const pageContent = document.querySelector('.page-content');
      
      return {
        pageDataExists: !!pageData,
        pageDataValue: pageData,
        sectionsCount: sections.length,
        pageHeroExists: !!pageHero,
        pageContentExists: !!pageContent,
        pageContentText: pageContent ? pageContent.textContent : null,
        heroTitle: pageHero ? pageHero.querySelector('h1')?.textContent : null,
        heroDescription: pageHero ? pageHero.querySelector('p')?.textContent : null,
        allText: document.body.textContent.substring(0, 500) + '...'
      };
    });
    
    console.log('📄 About Page Inspection Results:');
    console.log(JSON.stringify(aboutPageContent, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'about-page-inspection.png', fullPage: true });
    console.log('📸 Screenshot saved as about-page-inspection.png');
    
    // Check the admin pages interface
    console.log('\n🔍 Inspecting Admin Pages Interface...');
    await page.goto('http://localhost:5173/admin/pages', { waitUntil: 'networkidle0' });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const adminPagesContent = await page.evaluate(() => {
      const pages = document.querySelectorAll('tr[data-page-id]');
      const pageTitles = Array.from(pages).map(page => {
        const titleEl = page.querySelector('td:first-child');
        const slugEl = page.querySelector('td:nth-child(2)');
        const statusEl = page.querySelector('td:nth-child(3)');
        return {
          title: titleEl ? titleEl.textContent.trim() : null,
          slug: slugEl ? slugEl.textContent.trim() : null,
          status: statusEl ? statusEl.textContent.trim() : null
        };
      });
      
      return {
        pagesCount: pages.length,
        pageDetails: pageTitles,
        allText: document.body.textContent.substring(0, 500) + '...'
      };
    });
    
    console.log('⚙️ Admin Pages Interface Results:');
    console.log(JSON.stringify(adminPagesContent, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'admin-pages-inspection.png', fullPage: true });
    console.log('📸 Screenshot saved as admin-pages-inspection.png');
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  } finally {
    await browser.close();
  }
}

inspectPages().catch(console.error);
