/**
 * Native Features Hooks
 *
 * Provides access to native device capabilities:
 * - Camera for video/photo capture
 * - Haptics for tactile feedback
 * - Push notifications
 */

import { useCallback } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';

// ============================================================================
// CAMERA HOOK
// ============================================================================

export interface CapturedMedia {
  path: string;
  webPath?: string;
  format: string;
  isVideo: boolean;
}

export function useCamera() {
  const takePhoto = useCallback(async (): Promise<CapturedMedia | null> => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true,
      });

      return {
        path: photo.path || '',
        webPath: photo.webPath,
        format: photo.format,
        isVideo: false,
      };
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }, []);

  const pickFromGallery = useCallback(async (): Promise<CapturedMedia | null> => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return {
        path: photo.path || '',
        webPath: photo.webPath,
        format: photo.format,
        isVideo: false,
      };
    } catch (error) {
      console.error('Failed to pick from gallery:', error);
      return null;
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    const permissions = await Camera.checkPermissions();
    return permissions;
  }, []);

  const requestPermissions = useCallback(async () => {
    const permissions = await Camera.requestPermissions();
    return permissions;
  }, []);

  return {
    takePhoto,
    pickFromGallery,
    checkPermissions,
    requestPermissions,
  };
}

// ============================================================================
// HAPTICS HOOK
// ============================================================================

export function useHaptics() {
  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      const styleMap: Record<string, ImpactStyle> = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] });
    } catch (error) {
      // Silently fail on devices without haptics
    }
  }, []);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      const typeMap: Record<string, NotificationType> = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await Haptics.notification({ type: typeMap[type] });
    } catch (error) {
      // Silently fail
    }
  }, []);

  const vibrate = useCallback(async (duration: number = 300) => {
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      // Silently fail
    }
  }, []);

  const selectionStart = useCallback(async () => {
    try {
      await Haptics.selectionStart();
    } catch (error) {
      // Silently fail
    }
  }, []);

  const selectionChanged = useCallback(async () => {
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      // Silently fail
    }
  }, []);

  const selectionEnd = useCallback(async () => {
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      // Silently fail
    }
  }, []);

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
  };
}

// ============================================================================
// PUSH NOTIFICATIONS HOOK
// ============================================================================

export interface PushNotificationHandlers {
  onRegistration?: (token: string) => void;
  onNotificationReceived?: (notification: PushNotificationSchema) => void;
  onNotificationAction?: (notification: ActionPerformed) => void;
}

export function usePushNotifications(handlers?: PushNotificationHandlers) {
  const register = useCallback(async () => {
    try {
      // Request permission
      let permission = await PushNotifications.checkPermissions();

      if (permission.receive === 'prompt') {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return false;
      }

      // Register for push
      await PushNotifications.register();

      // Add listeners
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        handlers?.onRegistration?.(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration failed:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        handlers?.onNotificationReceived?.(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('Push notification action:', action);
        handlers?.onNotificationAction?.(action);
      });

      return true;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return false;
    }
  }, [handlers]);

  const unregister = useCallback(async () => {
    try {
      await PushNotifications.removeAllListeners();
    } catch (error) {
      console.error('Failed to unregister push notifications:', error);
    }
  }, []);

  return {
    register,
    unregister,
  };
}

// ============================================================================
// FILE SYSTEM HOOK
// ============================================================================

export function useFileSystem() {
  const saveFile = useCallback(async (
    data: string,
    filename: string,
    directory: Directory = Directory.Documents
  ) => {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data,
        directory,
      });
      return result.uri;
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }, []);

  const readFile = useCallback(async (
    path: string,
    directory: Directory = Directory.Documents
  ) => {
    try {
      const result = await Filesystem.readFile({
        path,
        directory,
      });
      return result.data;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }, []);

  const deleteFile = useCallback(async (
    path: string,
    directory: Directory = Directory.Documents
  ) => {
    try {
      await Filesystem.deleteFile({
        path,
        directory,
      });
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }, []);

  return {
    saveFile,
    readFile,
    deleteFile,
  };
}
