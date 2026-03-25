/**
 * iOS Focus Mode Plugin
 * Native iOS integration for Do Not Disturb and Focus modes
 */

import { registerPlugin } from '@capacitor/core';
import type { FocusModePlugin } from './definitions';

const FocusMode = registerPlugin<FocusModePlugin>('FocusMode', {
  web: () => import('./web').then(m => new m.FocusModeWeb()),
});

export * from './definitions';
export { FocusMode };
