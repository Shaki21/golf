/**
 * DOM Injection Detection Test
 *
 * Purpose: Ensure no third-party browser extensions inject unwanted DOM elements
 *
 * Context: Browser extensions like "Blaze AI", "ChatGPT", etc. inject DOM elements
 * into all pages, including local development. This test runs in a clean browser
 * context to verify our application doesn't contain these elements.
 *
 * If this test fails:
 * 1. Check if you're running in a browser with extensions enabled
 * 2. Use incognito/private mode or dedicated dev profile
 * 3. See CONTRIBUTING.md for details
 */

const { test, expect } = require('@playwright/test');

// Common patterns injected by browser extensions
const INJECTION_PATTERNS = {
  // AI Assistant Extensions
  blaze: {
    texts: ['Open AI Blaze', 'Blaze AI'],
    ids: ['blaze-', 'openai-blaze'],
    classes: ['blaze-widget', 'blaze-btn'],
    images: ['icon_128.png', 'blaze-icon'],
  },
  chatgpt: {
    texts: ['ChatGPT', 'Restore your last chat'],
    ids: ['chatgpt-', 'openai-chatgpt'],
    classes: ['chatgpt-widget', 'chatgpt-btn'],
  },
  grammarly: {
    ids: ['grammarly-', 'grammarlyExtension'],
    classes: ['grammarly-desktop', '_1Wnr'],
  },
  generic: {
    // Common extension patterns
    classes: ['extension-', 'chrome-extension', 'moz-extension'],
    attributes: ['data-extension', 'data-inject'],
  }
};

test.describe('DOM Injection Detection', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001');

    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should not contain Blaze AI extension elements', async ({ page }) => {
    // Check for text content
    for (const text of INJECTION_PATTERNS.blaze.texts) {
      const element = await page.getByText(text, { exact: false }).count();
      expect(element, `Found "${text}" in DOM - likely from Blaze extension`).toBe(0);
    }

    // Check for icon_128.png
    for (const imageName of INJECTION_PATTERNS.blaze.images) {
      const images = await page.locator(`img[src*="${imageName}"]`).count();
      expect(images, `Found ${imageName} in DOM - likely from Blaze extension`).toBe(0);
    }

    // Check for Blaze-specific IDs
    for (const idPattern of INJECTION_PATTERNS.blaze.ids) {
      const elements = await page.locator(`[id^="${idPattern}"]`).count();
      expect(elements, `Found element with id starting with "${idPattern}"`).toBe(0);
    }

    // Check for Blaze-specific classes
    for (const className of INJECTION_PATTERNS.blaze.classes) {
      const elements = await page.locator(`.${className}`).count();
      expect(elements, `Found element with class "${className}"`).toBe(0);
    }
  });

  test('should not contain ChatGPT extension elements', async ({ page }) => {
    for (const text of INJECTION_PATTERNS.chatgpt.texts) {
      const element = await page.getByText(text, { exact: false }).count();
      expect(element, `Found "${text}" in DOM - likely from ChatGPT extension`).toBe(0);
    }

    for (const idPattern of INJECTION_PATTERNS.chatgpt.ids) {
      const elements = await page.locator(`[id^="${idPattern}"]`).count();
      expect(elements, `Found element with id starting with "${idPattern}"`).toBe(0);
    }
  });

  test('should not contain Grammarly extension elements', async ({ page }) => {
    for (const idPattern of INJECTION_PATTERNS.grammarly.ids) {
      const elements = await page.locator(`[id^="${idPattern}"]`).count();
      expect(elements, `Found element with id starting with "${idPattern}"`).toBe(0);
    }

    for (const className of INJECTION_PATTERNS.grammarly.classes) {
      const elements = await page.locator(`[class*="${className}"]`).count();
      expect(elements, `Found element with class containing "${className}"`).toBe(0);
    }
  });

  test('should not contain generic extension markers', async ({ page }) => {
    // Check for common extension class patterns
    for (const classPattern of INJECTION_PATTERNS.generic.classes) {
      const elements = await page.locator(`[class*="${classPattern}"]`).count();
      expect(elements, `Found element with class containing "${classPattern}"`).toBe(0);
    }

    // Check for data-extension attributes
    for (const attrPattern of INJECTION_PATTERNS.generic.attributes) {
      const elements = await page.locator(`[${attrPattern}]`).count();
      expect(elements, `Found element with attribute "${attrPattern}"`).toBe(0);
    }
  });

  test('should verify /aarsplan route is clean', async ({ page }) => {
    // Navigate to the specific route mentioned in the bug report
    await page.goto('http://localhost:3001/aarsplan');
    await page.waitForLoadState('networkidle');

    // Comprehensive check on this specific page
    const bodyText = await page.textContent('body');

    expect(bodyText).not.toContain('Open AI Blaze');
    expect(bodyText).not.toContain('Restore your last chat');

    const images = await page.locator('img[src*="icon_128"]').count();
    expect(images, 'Found icon_128.png on /aarsplan - Blaze extension detected').toBe(0);
  });

  test('should only contain TIER Golf elements', async ({ page }) => {
    // Verify our app is actually loaded
    const title = await page.title();
    expect(title).toBe('TIER Golf');

    // Should contain our own branding - check for TIER Golf text or logo
    const tierGolfText = await page.getByText(/TIER Golf/i).count();
    const hasLogo = await page.locator('svg, img[alt*="TIER"], img[alt*="Golf"]').count();
    expect(tierGolfText + hasLogo, 'Should contain TIER Golf branding').toBeGreaterThan(0);
  });

  test('should log any suspicious elements for debugging', async ({ page }) => {
    // Get all elements with suspicious attributes
    const suspiciousElements = await page.evaluate(() => {
      const suspicious = [];
      const allElements = document.querySelectorAll('*');

      allElements.forEach(el => {
        // Check for extension-like attributes
        const attrs = Array.from(el.attributes);
        const hasSuspiciousAttr = attrs.some(attr =>
          attr.name.includes('extension') ||
          attr.name.includes('inject') ||
          attr.value.includes('extension') ||
          attr.value.includes('chrome-extension') ||
          attr.value.includes('moz-extension')
        );

        if (hasSuspiciousAttr) {
          suspicious.push({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            attributes: attrs.map(a => `${a.name}="${a.value}"`).join(' ')
          });
        }
      });

      return suspicious;
    });

    // This is informational - log but don't fail the test
    if (suspiciousElements.length > 0) {
      console.warn('⚠️ Found suspicious elements:', JSON.stringify(suspiciousElements, null, 2));
      console.warn('This may indicate browser extension injection.');
      console.warn('Run tests in clean browser profile. See CONTRIBUTING.md');
    }

    // Still fail if we find actual injected content
    expect(suspiciousElements.length,
      'Found suspicious elements - likely browser extension injection. ' +
      'Run tests in incognito or clean profile.'
    ).toBe(0);
  });
});

test.describe('Application Integrity', () => {

  test('should only load resources from localhost or allowed CDNs', async ({ page }) => {
    const externalRequests = [];

    // Allowed external domains (fonts, CDNs used by the app)
    const allowedDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
    ];

    page.on('request', request => {
      const url = request.url();
      // Allow localhost and data URLs
      if (!url.startsWith('http://localhost') &&
          !url.startsWith('https://localhost') &&
          !url.startsWith('data:') &&
          !url.startsWith('blob:')) {
        // Check if it's an allowed domain
        const isAllowed = allowedDomains.some(domain => url.includes(domain));
        if (!isAllowed) {
          externalRequests.push(url);
        }
      }
    });

    await page.goto('http://localhost:3001/aarsplan');
    await page.waitForLoadState('networkidle');

    if (externalRequests.length > 0) {
      console.warn('⚠️ Unexpected external requests detected:', externalRequests);
    }

    // In a clean environment, there should be no unexpected external requests
    expect(externalRequests.length,
      'Detected unexpected external requests - may indicate extension or unauthorized CDN loading'
    ).toBe(0);
  });
});
