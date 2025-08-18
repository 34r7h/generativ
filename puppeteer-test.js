const puppeteer = require('puppeteer');

// Wait for servers to start
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting Puppeteer test...');
  
  // Wait for servers to start
  console.log('Waiting for servers to start...');
  await sleep(5000); // Wait 5 seconds
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    console.log('Browser launched successfully');

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 30000
    }).catch(err => {
      console.log('Navigation failed. Make sure the dev server is running.');
      console.error(err);
      return null;
    });

    // Check if page loaded successfully
    if (page.url() !== 'about:blank') {
      const title = await page.title();
      console.log(`Page title: ${title}`);

      // Take screenshot
      console.log('Taking screenshot...');
      await page.screenshot({ path: 'screenshot.png' });
      console.log('Screenshot saved as screenshot.png');

      // Get page content
      const content = await page.content();
      console.log('Page loaded successfully. Content length:', content.length);
      
      // Check for critical elements
      const headerExists = await page.$('header');
      console.log('Header element exists:', !!headerExists);
      
      const footerExists = await page.$('footer');
      console.log('Footer element exists:', !!footerExists);

      // Check navigation links
      const navLinks = await page.$$eval('.main-nav a', links => 
        links.map(link => ({ text: link.textContent.trim(), href: link.getAttribute('href') }))
      );
      
      console.log('Navigation links:', navLinks);
      
      // Check for main sections on homepage
      const sections = await page.$$eval('section', sections => 
        sections.map(section => section.className)
      );
      
      console.log('Page sections:', sections);
      
      // Try navigating to services page
      if (navLinks.some(link => link.href === '/services')) {
        console.log('Navigating to services page...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.click('.main-nav a[href="/services"]')
        ]);
        
        const servicesTitle = await page.title();
        console.log(`Services page title: ${servicesTitle}`);
        
        // Take screenshot of services page
        await page.screenshot({ path: 'services-screenshot.png' });
        console.log('Services screenshot saved as services-screenshot.png');
      }
    } else {
      console.log('Failed to load the homepage. Make sure the dev server is running.');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

runTest();