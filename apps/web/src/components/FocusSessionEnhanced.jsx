import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { FocusMode } from '../plugins/focus-mode';
import {
  isIOS,
  supportsFocusMode,
  getFocusCapabilities,
  isStandalone,
  generateShortcutURL
} from '../utils/platform';
import { SectionTitle, SubSectionTitle } from './typography';
import './FocusSession.css';

/**
 * Enhanced FocusSession Component with Native iOS Support
 * Uses Capacitor plugin when running as native app
 * Falls back to PWA + Shortcuts when running in browser
 */
export default function FocusSessionEnhanced({ sessionData, onSessionComplete }) {
  const [sessionState, setSessionState] = useState('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);
  const [capabilities, setCapabilities] = useState({});
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [focusModeSupported, setFocusModeSupported] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [nativeFocusSupported, setNativeFocusSupported] = useState(false);

  const timerRef = useRef(null);
  const sessionStartTime = useRef(null);
  const focusListenerId = useRef(null);

  // Detect platform and native capabilities on mount
  useEffect(() => {
    const init = async () => {
      const ios = isIOS();
      const focusSupport = supportsFocusMode();
      const caps = getFocusCapabilities();
      const native = Capacitor.isNativePlatform();

      setIsIOSDevice(ios);
      setFocusModeSupported(focusSupport);
      setCapabilities(caps);
      setIsNativeApp(native);

      // Check if native Focus mode plugin is supported
      if (native) {
        try {
          const { supported } = await FocusMode.isSupported();
          setNativeFocusSupported(supported);
        } catch (error) {
          console.warn('[FocusSession] Native plugin not available:', error);
        }
      }
    };

    init();
  }, []);

  // Auto-start session if launched from Shortcut (?focus=start)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startSession is stable, deps are platform flags
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const focusParam = urlParams.get('focus');
    const durationParam = urlParams.get('duration');

    if (focusParam === 'start') {
      const hasSetupShortcut = localStorage.getItem('focus_shortcut_setup');

      if (!hasSetupShortcut && isIOSDevice && focusModeSupported && !isNativeApp) {
        setShowSetupModal(true);
      } else {
        startSession(durationParam ? parseInt(durationParam, 10) : null);
      }
    }
  }, [isIOSDevice, focusModeSupported, isNativeApp]);

  // Setup Focus mode listener for native app
  useEffect(() => {
    if (!isNativeApp || !nativeFocusSupported) return;

    const setupListener = async () => {
      try {
        const { id } = await FocusMode.addFocusModeListener((info) => {
          // If Focus mode was disabled externally, pause the session
          if (!info.isActive && sessionState === 'active') {
            pauseSession();
          }
        });

        focusListenerId.current = id;
      } catch (error) {
        console.warn('[FocusSession] Failed to add Focus listener:', error);
      }
    };

    setupListener();

    return () => {
      if (focusListenerId.current) {
        FocusMode.removeFocusModeListener({ id: focusListenerId.current })
          .catch(console.warn);
      }
    };
  }, [isNativeApp, nativeFocusSupported, sessionState]);

  /**
   * Start practice session with native or web Focus mode
   */
  const startSession = async (durationMinutes = null) => {
    setSessionState('active');
    sessionStartTime.current = Date.now();

    // Enable native Focus mode if running as native app
    if (isNativeApp && nativeFocusSupported) {
      try {
        const result = await FocusMode.enableFocusMode({
          focusName: 'Golf Training',
          duration: durationMinutes || 0 // 0 = indefinite
        });

        if (!result.success) {
          console.warn('[FocusSession] Failed to enable Focus mode:', result.error);
          // Continue anyway with web-based features
        }
      } catch (error) {
        console.warn('[FocusSession] Error enabling Focus mode:', error);
      }
    }

    // Request fullscreen on iOS (if in standalone PWA or native app)
    if (capabilities.fullscreen && (isStandalone() || isNativeApp)) {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    }

    // Request wake lock (keep screen on)
    if (capabilities.wakeLock) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
      } catch (err) {
        console.warn('Wake lock request failed:', err);
      }
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // If duration specified, auto-complete after that time
    if (durationMinutes) {
      setTimeout(() => {
        completeSession();
      }, durationMinutes * 60 * 1000);
    }
  };

  /**
   * Pause active session
   */
  const pauseSession = () => {
    setSessionState('paused');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * Resume paused session
   */
  const resumeSession = () => {
    setSessionState('active');
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  /**
   * Complete session and cleanup
   */
  const completeSession = async () => {
    setSessionState('completed');

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Disable native Focus mode if running as native app
    if (isNativeApp && nativeFocusSupported) {
      try {
        await FocusMode.disableFocusMode();
      } catch (error) {
        // Silently ignore errors when disabling focus mode
      }
    }

    // Release wake lock
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (err) {
        console.warn('Wake lock release failed:', err);
      }
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }

    // Notify parent component
    if (onSessionComplete) {
      onSessionComplete({
        duration: elapsedTime,
        sessionData,
        completedAt: new Date().toISOString()
      });
    }
  };

  /**
   * Format seconds to HH:MM:SS
   */
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Open iOS Shortcut setup modal
   */
  const openShortcutSetup = () => {
    setShowSetupModal(true);
  };

  /**
   * Mark shortcut as set up
   */
  const markShortcutSetup = () => {
    localStorage.setItem('focus_shortcut_setup', 'true');
    setShowSetupModal(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wakeLock) {
        wakeLock.release().catch(console.warn);
      }
    };
  }, [wakeLock]);

  /**
   * Render session controls based on state
   */
  const renderSessionControls = () => {
    if (sessionState === 'idle') {
      return (
        <div className="focus-session-controls">
          <button
            className="btn-start-session"
            onClick={() => startSession()}
          >
            {isNativeApp ? 'Start Practice Session (Native)' : 'Start Practice Session'}
          </button>

          {isIOSDevice && focusModeSupported && !isNativeApp && (
            <button
              className="btn-setup-shortcut"
              onClick={openShortcutSetup}
            >
              Setup iOS Focus Mode
            </button>
          )}

          {isNativeApp && nativeFocusSupported && (
            <div className="native-mode-badge">
              ✓ Native Focus Mode Available
            </div>
          )}
        </div>
      );
    }

    if (sessionState === 'active') {
      return (
        <div className="focus-session-active">
          <div className="session-timer">
            <SectionTitle>{formatTime(elapsedTime)}</SectionTitle>
            <p>Session in progress</p>
            {isNativeApp && nativeFocusSupported && (
              <p className="native-mode-indicator">Focus Mode Active</p>
            )}
          </div>

          <div className="session-actions">
            <button className="btn-pause" onClick={pauseSession}>
              Pause
            </button>
            <button className="btn-complete" onClick={completeSession}>
              Complete Session
            </button>
          </div>
        </div>
      );
    }

    if (sessionState === 'paused') {
      return (
        <div className="focus-session-paused">
          <div className="session-timer">
            <SectionTitle>{formatTime(elapsedTime)}</SectionTitle>
            <p>Session paused</p>
          </div>

          <div className="session-actions">
            <button className="btn-resume" onClick={resumeSession}>
              Resume
            </button>
            <button className="btn-complete" onClick={completeSession}>
              Complete Session
            </button>
          </div>
        </div>
      );
    }

    if (sessionState === 'completed') {
      return (
        <div className="focus-session-completed">
          <SubSectionTitle>Session Completed!</SubSectionTitle>
          <p>Duration: {formatTime(elapsedTime)}</p>
          <button
            className="btn-new-session"
            onClick={() => {
              setSessionState('idle');
              setElapsedTime(0);
            }}
          >
            Start New Session
          </button>
        </div>
      );
    }

    return null;
  };

  /**
   * Render iOS Shortcut setup modal (only for PWA mode)
   */
  const renderSetupModal = () => {
    if (!showSetupModal || isNativeApp) return null;

    const shortcutURL = generateShortcutURL({
      focusName: 'Golf Training',
      duration: sessionData?.estimatedDuration || 60,
      appURL: window.location.origin
    });

    return (
      <div className="modal-overlay" onClick={() => setShowSetupModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <SectionTitle>Setup iOS Focus Mode</SectionTitle>

          <div className="setup-instructions">
            <p>
              To enable automatic Focus mode during practice sessions, you'll need to:
            </p>

            <ol>
              <li>
                <strong>Create a Focus Mode</strong>
                <p>
                  Go to Settings → Focus → Create a new Focus called "Golf Training"
                </p>
              </li>

              <li>
                <strong>Install the Shortcut</strong>
                <p>
                  Tap the button below to install the iOS Shortcut that will:
                </p>
                <ul>
                  <li>Enable "Golf Training" Focus mode</li>
                  <li>Block notifications automatically</li>
                  <li>Launch this app in focus mode</li>
                </ul>
              </li>

              <li>
                <strong>Add to Home Screen</strong>
                <p>
                  For best experience, add this app to your Home Screen as a PWA
                </p>
              </li>
            </ol>

            <div className="setup-actions">
              <a
                href={shortcutURL}
                className="btn-install-shortcut"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install Shortcut
              </a>

              <button
                className="btn-done"
                onClick={markShortcutSetup}
              >
                I've Set It Up
              </button>

              <button
                className="btn-skip"
                onClick={() => setShowSetupModal(false)}
              >
                Skip for Now
              </button>
            </div>
          </div>

          <div className="setup-note">
            <p>
              <strong>Tip:</strong> For automatic Focus mode control, download the native iOS app.
              The native app can enable/disable Focus mode without requiring Shortcuts.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="focus-session-container">
      {renderSessionControls()}
      {renderSetupModal()}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>Platform Debug</summary>
            <pre>{JSON.stringify({
              isIOS: isIOSDevice,
              focusModeSupported,
              isNativeApp,
              nativeFocusSupported,
              capabilities,
              standalone: isStandalone(),
              sessionState,
              elapsedTime
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
