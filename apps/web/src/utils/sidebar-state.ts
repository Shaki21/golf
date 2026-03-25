/**
 * Sidebar State Management Utils
 * Handles persistent sidebar menu state across navigation
 */

const SIDEBAR_STORAGE_KEY = 'tier-golf-sidebar-state';

export interface SidebarState {
  [menuLabel: string]: boolean;
}

/**
 * Save sidebar state to sessionStorage
 */
export const saveSidebarState = (state: SidebarState): void => {
  try {
    sessionStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save sidebar state:', error);
  }
};

/**
 * Load sidebar state from sessionStorage
 */
export const loadSidebarState = (): SidebarState => {
  try {
    const saved = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Failed to load sidebar state:', error);
    return {};
  }
};

/**
 * Clear sidebar state from sessionStorage
 */
export const clearSidebarState = (): void => {
  try {
    sessionStorage.removeItem(SIDEBAR_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear sidebar state:', error);
  }
};
