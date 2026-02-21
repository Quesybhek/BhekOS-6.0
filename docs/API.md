# BhekOS API Reference

## 📚 Table of Contents

- [Core OS API](#core-os-api)
- [Window Manager API](#window-manager-api)
- [Security API](#security-api)
- [App Manager API](#app-manager-api)
- [Integration APIs](#integration-apis)
  - [BhekThink API](#bhekthink-api)
  - [BhekWork API](#bhekwork-api)
- [Utility APIs](#utility-apis)
- [Event System](#event-system)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## 🖥️ Core OS API

The main BhekOS instance is available globally as `window.os`.

### Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `os.version` | string | OS version | `"6.0.0"` |
| `os.build` | string | Build number | `"22000.556"` |
| `os.wm` | object | Window manager instance | `os.wm.spawn()` |
| `os.security` | object | Security instance | `os.security.lockScreen()` |
| `os.appManager` | object | App manager instance | `os.appManager.getApp()` |
| `os.integrations` | object | Integration bridges | `os.integrations.bhekthink` |
| `os.selectedDesktopIcon` | string | Currently selected icon | `"explorer"` |
| `os.wallpaper` | string | Current wallpaper | `"default"` |
| `os.startMenuVisible` | boolean | Start menu state | `true/false` |

### Methods

#### `os.launchApp(name, type)`
Launches an application by name and type.

**Parameters:**
- `name` (string): Display name of the app
- `type` (string): App identifier

**Returns:** `void`

**Example:**
```javascript
// Launch built-in apps
os.launchApp('Terminal', 'terminal');
os.launchApp('File Explorer', 'explorer');
os.launchApp('BhekAI', 'ai');
os.launchApp('Web Browser', 'browser');

// Launch integration apps
os.launchApp('App Store', 'app-store');
os.launchApp('Integrations', 'integration-settings');
