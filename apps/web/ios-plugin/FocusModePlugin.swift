/**
 * iOS Focus Mode Capacitor Plugin
 * Native iOS implementation for controlling Focus modes
 *
 * Requirements:
 * - iOS 15.0+
 * - Privacy - Focus Status Usage Description in Info.plist
 */

import Foundation
import Capacitor

@objc(FocusModePlugin)
public class FocusModePlugin: CAPPlugin {

    private let focusManager = FocusModeManager()

    /**
     * Check if Focus mode is supported on this device
     */
    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            let version = ProcessInfo.processInfo.operatingSystemVersion
            call.resolve([
                "supported": true,
                "version": version.majorVersion
            ])
        } else {
            call.resolve([
                "supported": false
            ])
        }
    }

    /**
     * Enable a Focus mode by name
     */
    @objc func enableFocusMode(_ call: CAPPluginCall) {
        guard let focusName = call.getString("focusName") else {
            call.reject("Focus name is required")
            return
        }

        let duration = call.getInt("duration") ?? 0 // 0 = indefinite

        if #available(iOS 15.0, *) {
            focusManager.enableFocusMode(name: focusName, durationMinutes: duration) { success, error in
                if success {
                    call.resolve([
                        "success": true
                    ])
                } else {
                    call.resolve([
                        "success": false,
                        "error": error ?? "Failed to enable Focus mode"
                    ])
                }
            }
        } else {
            call.resolve([
                "success": false,
                "error": "Focus mode requires iOS 15 or later"
            ])
        }
    }

    /**
     * Disable the currently active Focus mode
     */
    @objc func disableFocusMode(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            focusManager.disableFocusMode { success, error in
                if success {
                    call.resolve([
                        "success": true
                    ])
                } else {
                    call.resolve([
                        "success": false,
                        "error": error ?? "Failed to disable Focus mode"
                    ])
                }
            }
        } else {
            call.resolve([
                "success": false,
                "error": "Focus mode requires iOS 15 or later"
            ])
        }
    }

    /**
     * Get the currently active Focus mode
     */
    @objc func getCurrentFocusMode(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            let focusInfo = focusManager.getCurrentFocusMode()
            call.resolve(focusInfo)
        } else {
            call.resolve([
                "isActive": false
            ])
        }
    }

    /**
     * Check if a specific Focus mode exists
     */
    @objc func focusModeExists(_ call: CAPPluginCall) {
        guard let focusName = call.getString("focusName") else {
            call.reject("Focus name is required")
            return
        }

        if #available(iOS 15.0, *) {
            let exists = focusManager.focusModeExists(name: focusName)
            call.resolve([
                "exists": exists
            ])
        } else {
            call.resolve([
                "exists": false
            ])
        }
    }

    /**
     * Request permission to control Focus modes
     */
    @objc func requestPermission(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            focusManager.requestPermission { granted, error in
                call.resolve([
                    "granted": granted,
                    "error": error ?? ""
                ])
            }
        } else {
            call.resolve([
                "granted": false,
                "error": "Focus mode requires iOS 15 or later"
            ])
        }
    }

    /**
     * Add listener for Focus mode state changes
     */
    @objc func addFocusModeListener(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            let listenerId = focusManager.addListener { isActive, focusName in
                self.notifyListeners("focusModeChanged", data: [
                    "isActive": isActive,
                    "focusName": focusName ?? ""
                ])
            }

            call.resolve([
                "id": listenerId
            ])
        } else {
            call.reject("Focus mode requires iOS 15 or later")
        }
    }

    /**
     * Remove Focus mode state listener
     */
    @objc func removeFocusModeListener(_ call: CAPPluginCall) {
        guard let listenerId = call.getString("id") else {
            call.reject("Listener ID is required")
            return
        }

        if #available(iOS 15.0, *) {
            focusManager.removeListener(id: listenerId)
            call.resolve()
        } else {
            call.reject("Focus mode requires iOS 15 or later")
        }
    }
}
