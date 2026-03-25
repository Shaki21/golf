/**
 * Debug Test - Tests the test infrastructure
 */

import { getTestApp, getDemoIds } from '../helpers';

describe('Debug Test', () => {
  it('should get demo ids', async () => {
    let app;
    try {
      console.log('1. Getting test app...');
      app = await getTestApp();
      console.log('2. App ready');
    } catch (error: any) {
      console.error('Failed to get test app:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }

    console.log('3. Getting demo IDs...');
    try {
      const demoIds = await getDemoIds();
      console.log('4. Demo IDs:', JSON.stringify(demoIds));

      expect(demoIds).toBeDefined();
      expect(demoIds.coachEntity).toBeDefined();
      expect(demoIds.playerEntity).toBeDefined();

      console.log('5. All checks passed!');
    } catch (error: any) {
      console.error('Error getting demo IDs:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    } finally {
      if (app) {
        await app.close();
      }
    }
  });
});
