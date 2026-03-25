/**
 * iOS Focus Mode Plugin Definitions
 * Native iOS integration for Do Not Disturb and Focus modes
 */

export interface FocusModePlugin {
  /**
   * Check if Focus mode is supported on this device
   * @returns Promise with support status
   */
  isSupported(): Promise<{ supported: boolean; version?: number }>;

  /**
   * Enable a Focus mode by name
   * @param options Focus mode configuration
   * @returns Promise with success status
   */
  enableFocusMode(options: {
    focusName: string;
    duration?: number; // minutes, 0 = indefinite
  }): Promise<{ success: boolean; error?: string }>;

  /**
   * Disable the currently active Focus mode
   * @returns Promise with success status
   */
  disableFocusMode(): Promise<{ success: boolean; error?: string }>;

  /**
   * Get the currently active Focus mode
   * @returns Promise with current focus mode info
   */
  getCurrentFocusMode(): Promise<{
    isActive: boolean;
    focusName?: string;
    remainingMinutes?: number;
  }>;

  /**
   * Check if a specific Focus mode exists
   * @param options Focus mode name to check
   * @returns Promise with existence status
   */
  focusModeExists(options: {
    focusName: string;
  }): Promise<{ exists: boolean }>;

  /**
   * Request permission to control Focus modes
   * @returns Promise with permission status
   */
  requestPermission(): Promise<{
    granted: boolean;
    error?: string;
  }>;

  /**
   * Listen for Focus mode state changes
   * @param callback Called when Focus mode changes
   */
  addFocusModeListener(
    callback: (info: { isActive: boolean; focusName?: string }) => void
  ): Promise<{ id: string }>;

  /**
   * Remove Focus mode state listener
   * @param options Listener ID to remove
   */
  removeFocusModeListener(options: { id: string }): Promise<void>;
}
