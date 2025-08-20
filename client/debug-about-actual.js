import puppeteer from 'puppeteer';

async function debugAboutActual() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    console.log('🔍 Inspecting ACTUAL About page content...');
    
    // Go to about page
    await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what's actually rendered
    const actualContent = await page.evaluate(() => {
      // Look for the actual rendered content
      const heroSection = document.querySelector('.page-hero');
      const contentSections = document.querySelectorAll('.page-section');
      const missionSection = document.querySelector('.mission-section');
      const valuesSection = document.querySelector('.values-section');
      const leadershipSection = document.querySelector('.leadership-section');
      const approachSection = document.querySelector('.approach-section');
      const timelineSection = document.querySelector('.timeline-section');
      const ctaSection = document.querySelector('.cta-section');
      
      // Check if pageData exists in Vue
      const vueApp = document.querySelector('#app')?.__vue_app__;
      
      return {
        // What sections actually exist
        hasHeroSection: !!heroSection,
        hasContentSections: contentSections.length,
        hasMissionSection: !!missionSection,
        hasValuesSection: !!valuesSection,
        hasLeadershipSection: !!leadershipSection,
        hasApproachSection: !!approachSection,
        hasTimelineSection: !!timelineSection,
        hasCtaSection: !!ctaSection,
        
        // What's actually visible
        heroText: heroSection ? heroSection.textContent.substring(0, 200) : null,
        missionText: missionSection ? missionSection.textContent.substring(0, 200) : null,
        valuesText: valuesSection ? valuesSection.textContent.substring(0, 200) : null,
        
        // Check for hardcoded vs dynamic content
        hasHardcodedContent: !!(missionSection || valuesSection || leadershipSection || approachSection || timelineSection || ctaSection),
        
        // Full body text to see what's actually there
        fullBodyText: document.body.textContent.substring(0, 1000),
        
        // Check Vue component state
        vueAppExists: !!vueApp
      };
    });
    
    console.log('📄 ACTUAL About Page Content:');
    console.log(JSON.stringify(actualContent, null, 2));
    
    // Take screenshot
    await page.screenshot({ path: 'about-actual-content.png', fullPage: true });
    console.log('📸 Screenshot saved as about-actual-content.png');
    
    // Now check the Vue component data
    const vueData = await page.evaluate(() => {
      try {
        // Try to access Vue component data
        const app = document.querySelector('#app');
        if (app && app.__vue_app__) {
          const root = app.__vue_app__._instance;
          if (root && root.component) {
            const aboutComponent = root.component;
            return {
              hasComponent: true,
              pageData: aboutComponent.pageData,
              loading: aboutComponent.loading,
              error: aboutComponent.error
            };
          }
        }
        return { hasComponent: false };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🔍 Vue Component Data:');
    console.log(JSON.stringify(vueData, null, 2));
    
  } catch (error) {
    console.error('❌ Error during about page debugging:', error);
  } finally {
    await browser.close();
  }
}

debugAboutActual().catch(console.error);
