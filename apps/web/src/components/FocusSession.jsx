import React, { useState, useEffect, useRef } from 'react';
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
 * FocusSession Component
 * iOS-specific focus mode integration for practice sessions
 *
 * Features:
 * - iOS 15+ Focus mode integration via Shortcuts
 * - Fullscreen mode during session
 * - Wake lock to prevent screen sleep
 * - Session timer
 * - Auto-start from URL parameter (?focus=start)
 */
export default function FocusSession({ sessionData, onSessionComplete }) {
  const [sessionState, setSessionState] = useState('idle'); // idle | setup | active | paused | completed
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);
  const [capabilities, setCapabilities] = useState({});
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [focusModeSupported, setFocusModeSupported] = useState(false);

  const timerRef = useRef(null);
  const sessionStartTime = useRef(null);

  // Detect platform capabilities on mount
  useEffect(() => {
    const ios = isIOS();
    const focusSupport = supportsFocusMode();
    const caps = getFocusCapabilities();

    setIsIOSDevice(ios);
    setFocusModeSupported(focusSupport);
    setCapabilities(caps);
  }, []);

  // Auto-start session if launched from Shortcut (?focus=start)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally runs once on mount with URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const focusParam = urlParams.get('focus');
    const durationParam = urlParams.get('duration');

    if (focusParam === 'start') {
      // Check if this is first time (no shortcut setup yet)
      const hasSetupShortcut = localStorage.getItem('focus_shortcut_setup');

      if (!hasSetupShortcut && isIOSDevice && focusModeSupported) {
        setShowSetupModal(true);
      } else {
        startSession(durationParam ? parseInt(durationParam, 10) : null);
      }
    }
  }, []);

  /**
   * Start practice session with focus mode enhancements
   */
  const startSession = async (durationMinutes = null) => {
    setSessionState('active');
    sessionStartTime.current = Date.now();

    // Request fullscreen on iOS (if in standalone PWA)
    if (capabilities.fullscreen && isStandalone()) {
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
            Start Practice Session
          </button>

          {isIOSDevice && focusModeSupported && (
            <button
              className="btn-setup-shortcut"
              onClick={openShortcutSetup}
            >
              Setup iOS Focus Mode
            </button>
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
   * Render iOS Shortcut setup modal
   */
  const renderSetupModal = () => {
    if (!showSetupModal) return null;

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
              <strong>Note:</strong> This feature only works on iOS 15 and later.
              If you don't have a "Golf Training" Focus mode yet, the Shortcut will
              prompt you to create one.
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
