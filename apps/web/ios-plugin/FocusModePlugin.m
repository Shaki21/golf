/**
 * Focus Mode Plugin - Objective-C Bridge
 * Registers the Swift plugin with Capacitor
 */

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(FocusModePlugin, "FocusMode",
    CAP_PLUGIN_METHOD(isSupported, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(enableFocusMode, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(disableFocusMode, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getCurrentFocusMode, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(focusModeExists, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(addFocusModeListener, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(removeFocusModeListener, CAPPluginReturnPromise);
)
