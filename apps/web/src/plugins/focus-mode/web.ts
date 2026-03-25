/**
 * iOS Focus Mode Plugin - Web Implementation (Fallback)
 * This is used when running in a browser (not native app)
 */

import { WebPlugin } from '@capacitor/core';
import type { FocusModePlugin } from './definitions';

export class FocusModeWeb extends WebPlugin implements FocusModePlugin {
  async isSupported(): Promise<{ supported: boolean; version?: number }> {
    // Web browsers don't support native Focus mode control
    return { supported: false };
  }

  async enableFocusMode(options: {
    focusName: string;
    duration?: number;
  }): Promise<{ success: boolean; error?: string }> {
    console.warn(
      `[FocusMode Web] Cannot enable Focus mode "${options.focusName}" in browser. Use iOS Shortcuts or native app.`
    );
    return {
      success: false,
      error: 'Focus mode control not available in browser. Use iOS Shortcuts or install native app.'
    };
  }

  async disableFocusMode(): Promise<{ success: boolean; error?: string }> {
    console.warn('[FocusMode Web] Cannot disable Focus mode in browser.');
    return {
      success: false,
      error: 'Focus mode control not available in browser.'
    };
  }

  async getCurrentFocusMode(): Promise<{
    isActive: boolean;
    focusName?: string;
    remainingMinutes?: number;
  }> {
    // Browser cannot detect iOS Focus mode status
    return { isActive: false };
  }

  async focusModeExists(options: {
    focusName: string;
  }): Promise<{ exists: boolean }> {
    console.warn(
      `[FocusMode Web] Cannot check if Focus mode "${options.focusName}" exists in browser.`
    );
    return { exists: false };
  }

  async requestPermission(): Promise<{
    granted: boolean;
    error?: string;
  }> {
    console.warn('[FocusMode Web] Cannot request Focus mode permission in browser.');
    return {
      granted: false,
      error: 'Permission request not available in browser.'
    };
  }

  async addFocusModeListener(
    callback: (info: { isActive: boolean; focusName?: string }) => void
  ): Promise<{ id: string }> {
    console.warn('[FocusMode Web] Focus mode listeners not available in browser.');
    // Return a dummy ID
    return { id: 'web-fallback' };
  }

  async removeFocusModeListener(options: { id: string }): Promise<void> {
    // No-op in web implementation
  }
}
