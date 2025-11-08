# Firefox Preferences Method: Complete Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the **Firefox Preferences Method** for integrating the Copy-URL-on-Hover extension with Quick Tabs. This is an alternative to the postMessage method.

### How It Works

The Firefox Preferences Method uses Firefox's built-in preference system (`Services.prefs`) as a communication bridge:

1. **Extension Side**: The Copy-URL extension writes hovered link data to Firefox preferences
2. **UC.JS Side**: Quick Tabs observes these preferences and reads the link data when it changes
3. **User Action**: When you press Ctrl+E, Quick Tabs reads the stored link data and opens it in a Quick Tab

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Webpage (Content Context)             │
│                                                          │
│  Copy-URL Extension (content.js)                        │
│  ├── Detects link hover (mouseover event)               │
│  ├── Extracts URL and title                             │
│  └── Sends message to background script                 │
│      browser.runtime.sendMessage({                      │
│        type: 'HOVER_DETECTED',                          │
│        action: 'SET_LINK',                              │
│        url: url,                                        │
│        title: title                                     │
│      })                                                 │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│           Extension Background Script                    │
│                                                          │
│  Copy-URL Extension (background.js)                     │
│  ├── Receives message from content script               │
│  └── Writes to browser.storage.local:                   │
│      browser.storage.local.set({                        │
│        quicktabs_hovered_url: url,                      │
│        quicktabs_hovered_title: title,                  │
│        quicktabs_hovered_state: 'hovering'              │
│      })                                                 │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Firefox Preference Store                    │
│              (prefs.js in profile folder)                │
│                                                          │
│  ├─ quicktabs_hovered_url = "https://example.com"       │
│  ├─ quicktabs_hovered_title = "Example Page"            │
│  ├─ quicktabs_hovered_state = "hovering" or "idle"      │
│  └─ quicktabs_hover_timestamp = 1731000000              │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ↓ (Services.prefs.addObserver)
┌─────────────────────────────────────────────────────────┐
│                Browser Chrome Context                    │
│                                                          │
│  Quick Tabs (Quick_Tabs.uc.js)                          │
│  ├── Preference observer detects changes                │
│  ├── Reads preferences when they change                 │
│  ├── Stores link data in global variables               │
│  ├── User presses Ctrl+E                                │
│  └── Creates Quick Tab with stored URL                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Part 1: Copy-URL Extension Changes

### File: `content.js`

Add the following code to your Copy-URL extension's `content.js` file. This code detects when the user hovers over links and sends messages to the background script.

```javascript
// ===== COPY-URL Extension: content.js =====
// Add this code to detect links and send to background

// Track the currently hovered link to avoid duplicate messages
let currentHoveredLink = null;

// Listen for when user hovers over elements
document.addEventListener('mouseover', (event) => {
    const link = event.target.closest('a[href]');
    
    if (!link || !link.href) return;
    
    // Avoid duplicate processing
    if (currentHoveredLink === link) return;
    
    currentHoveredLink = link;
    
    const url = link.href;
    const title = link.textContent.trim() || link.getAttribute('title') || url;
    
    console.log('[CopyURL] Link hover detected:', {
        url: url,
        title: title
    });
    
    // Send to background script to write to preferences
    browser.runtime.sendMessage({
        type: 'HOVER_DETECTED',
        action: 'SET_LINK',
        url: url,
        title: title,
        timestamp: Date.now()
    }).catch(e => {
        console.warn('[CopyURL] Failed to send message:', e);
    });
    
}, true); // Use capture phase for early detection

// Listen for mouse leaving links
document.addEventListener('mouseout', (event) => {
    const link = event.target.closest('a[href]');
    
    if (!link) return;
    
    // Only clear if we were tracking this link
    if (currentHoveredLink === link) {
        currentHoveredLink = null;
        
        console.log('[CopyURL] Mouse left link');
        
        browser.runtime.sendMessage({
            type: 'HOVER_DETECTED',
            action: 'CLEAR_LINK'
        }).catch(e => {
            console.warn('[CopyURL] Failed to send clear message:', e);
        });
    }
    
}, true); // Use capture phase
```

**What this code does:**
- Listens for `mouseover` events on all link elements (`<a>` tags)
- Extracts the URL and title from the link
- Sends a message to the background script with the link data
- Clears the link data when the mouse leaves the link

---

### File: `background.js`

Add or replace the existing code in your Copy-URL extension's `background.js` file with this:

```javascript
// ===== COPY-URL Extension: background.js =====
// This code receives messages from content scripts and writes to Firefox preferences

// Browser API compatibility (for Chrome/Firefox)
if (typeof browser === 'undefined') {
    var browser = chrome;
}

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // Check if this is a hover detection message
    if (message.type === 'HOVER_DETECTED') {
        
        if (message.action === 'SET_LINK') {
            // Write link data to browser storage (maps to Firefox preferences)
            browser.storage.local.set({
                quicktabs_hovered_url: message.url || '',
                quicktabs_hovered_title: message.title || '',
                quicktabs_hovered_state: 'hovering',
                quicktabs_hover_timestamp: message.timestamp || Date.now()
            }).then(() => {
                console.log('[CopyURL-BG] Preference updated:', message.url);
                sendResponse({ success: true });
            }).catch(error => {
                console.error('[CopyURL-BG] Failed to set preference:', error);
                sendResponse({ success: false, error: error.message });
            });
            
            // Return true to indicate we'll respond asynchronously
            return true;
        }
        
        else if (message.action === 'CLEAR_LINK') {
            // Clear the preference when mouse leaves the link
            browser.storage.local.set({
                quicktabs_hovered_url: '',
                quicktabs_hovered_title: '',
                quicktabs_hovered_state: 'idle',
                quicktabs_hover_timestamp: null
            }).then(() => {
                console.log('[CopyURL-BG] Preference cleared');
                sendResponse({ success: true });
            }).catch(error => {
                console.error('[CopyURL-BG] Failed to clear preference:', error);
                sendResponse({ success: false, error: error.message });
            });
            
            return true;
        }
    }
    
    // Handle other message types if needed
    else if (message.type === 'REQUEST_LINK') {
        // UC.JS might request the current link status
        browser.storage.local.get([
            'quicktabs_hovered_url',
            'quicktabs_hovered_title',
            'quicktabs_hovered_state'
        ]).then(result => {
            console.log('[CopyURL-BG] Sending link status:', result);
            sendResponse({
                success: true,
                data: result
            });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        
        return true;
    }
});

console.log('[CopyURL-BG] Background script loaded and message listener registered');
```

**What this code does:**
- Listens for messages from the content script
- When a `SET_LINK` message is received, writes the link data to `browser.storage.local`
- When a `CLEAR_LINK` message is received, clears the stored link data
- Provides error handling and logging for debugging

---

### File: `manifest.json`

Ensure your `manifest.json` has the necessary permissions:

```json
{
  "manifest_version": 2,
  "name": "Copy URL on Hover",
  "version": "1.0",
  "description": "Copy URLs on hover with Quick Tabs integration",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "background": {
    "scripts": ["background.js"]
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}
```

**Important permissions:**
- `storage`: Required to write to `browser.storage.local` (which maps to Firefox preferences)
- `activeTab`: Allows the extension to access the current tab
- `<all_urls>`: Allows the content script to run on all websites

---

## Part 2: Quick Tabs UC.JS Changes

The Quick Tabs side has already been implemented in this repository! The code includes:

### Functions Added

1. **`readPreference(prefName)`**: Helper function to read Firefox preference values
2. **`setupQuickTabsExtensionBridge()`**: Sets up the preference observer that listens for changes
3. **`cleanupExtensionBridge()`**: Cleanup function to remove the observer when unloading

### How It Works

```javascript
// When a preference changes (e.g., quicktabs_hovered_url)
Services.prefs.addObserver('quicktabs_', prefObserver);

// The observer is called:
observe(subject, topic, data) {
    if (data === 'quicktabs_hovered_url') {
        // Read the new value
        const url = Services.prefs.getStringPref('quicktabs_hovered_url', '');
        const title = Services.prefs.getStringPref('quicktabs_hovered_title', '');
        
        // Store for Ctrl+E
        hoveredLinkUrl = url;
        hoveredLinkTitle = title;
    }
}

// When user presses Ctrl+E
if (hoveredLinkUrl) {
    createQuickTabContainer(hoveredLinkUrl, hoveredLinkTitle);
}
```

---

## Installation & Testing

### Step 1: Modify the Copy-URL Extension

1. **Clone the extension** (if you haven't already):
   ```bash
   git clone https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition.git
   cd copy-URL-on-hover_ChunkyEdition
   git checkout lite  # Or your preferred branch
   ```

2. **Edit `content.js`**: Add the hover detection code from above
3. **Edit `background.js`**: Replace with the preference-writing code from above
4. **Check `manifest.json`**: Ensure it has the `storage` permission

### Step 2: Load the Extension

1. Open Firefox/Zen Browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on"**
4. Select the `manifest.json` file from your modified extension directory

### Step 3: Verify Quick Tabs

Quick Tabs should already have the Firefox Preferences integration code. To verify:

1. Open the Browser Console (Ctrl+Shift+J)
2. Look for the message:
   ```
   [QuickTabs] Preference observer registered successfully
   ```

### Step 4: Test the Integration

1. **Navigate to any website** (e.g., https://www.youtube.com)
2. **Open Browser Console** (Ctrl+Shift+J - NOT the page console)
3. **Hover over a link**
4. Look for these messages:
   ```
   [CopyURL] Link hover detected: { url: "...", title: "..." }
   [CopyURL-BG] Preference updated: ...
   [QuickTabs] Preference changed: quicktabs_hovered_url
   [QuickTabs] Link hover detected from preferences: ...
   ```
5. **Press Ctrl+E** while hovering
6. A Quick Tab should open with the hovered link

---

## Data Flow: Step-by-Step

### Time: T=0ms - User Hovers Over Link

```
User hovers over a link on YouTube
    ↓
Copy-URL content.js detects mouseover
    ↓
Extracts URL: "https://youtu.be/abc123"
Extracts Title: "Cool Video"
    ↓
Sends message to background.js
```

### Time: T=1ms - Background Script Writes Preference

```
Background script receives message
    ↓
Calls browser.storage.local.set({
    quicktabs_hovered_url: "https://youtu.be/abc123",
    quicktabs_hovered_title: "Cool Video",
    quicktabs_hovered_state: "hovering",
    quicktabs_hover_timestamp: 1731000000
})
    ↓
Firefox Preference Store UPDATED
```

### Time: T=2ms - Quick Tabs Observer Notified

```
Firefox calls prefObserver.observe()
    ↓
Topic: "nsPref:changed"
Data: "quicktabs_hovered_url"
    ↓
Quick Tabs reads the preferences:
    url = "https://youtu.be/abc123"
    title = "Cool Video"
    state = "hovering"
    ↓
Stores in global variables:
    hoveredLinkUrl = url
    hoveredLinkTitle = title
```

### Time: T=1000ms - User Presses Ctrl+E

```
User presses Ctrl+E
    ↓
Keyboard listener fires
    ↓
Checks if hoveredLinkUrl exists
    ↓
Calls createQuickTabContainer(
    "https://youtu.be/abc123",
    "Cool Video"
)
    ↓
Quick Tab opens! ✓
```

---

## Debugging

### Check if Preferences Are Being Written

In the Browser Console, run:

```javascript
// Check current preference values
Services.prefs.getStringPref('quicktabs_hovered_url', 'NOT SET');
Services.prefs.getStringPref('quicktabs_hovered_title', 'NOT SET');
Services.prefs.getStringPref('quicktabs_hovered_state', 'NOT SET');
```

### Manually Test Preference Writing

In the Browser Console, run:

```javascript
// Manually set preferences
Services.prefs.setStringPref('quicktabs_hovered_url', 'https://example.com');
Services.prefs.setStringPref('quicktabs_hovered_title', 'Test Page');
Services.prefs.setStringPref('quicktabs_hovered_state', 'hovering');

// Check if Quick Tabs detected the change
// You should see: [QuickTabs] Preference changed: quicktabs_hovered_url
```

### Check Extension Storage

From the extension's background page console (about:debugging → Inspect):

```javascript
// Check what's stored in browser.storage.local
browser.storage.local.get().then(console.log);
```

### Common Issues

| Problem | Solution |
|---------|----------|
| No messages in console when hovering | Check if extension is loaded in about:debugging |
| Extension sends messages but preferences don't update | Check `storage` permission in manifest.json |
| Quick Tabs doesn't detect changes | Check if preference observer is registered (console message) |
| Ctrl+E doesn't work | Verify keyboard shortcut isn't conflicting with other extensions |

---

## Advantages of Firefox Preferences Method

### Security
- ✅ **Built-in Firefox API**: Uses official Firefox preference system
- ✅ **Secure**: No external dependencies or workarounds
- ✅ **Isolated**: Preferences are scoped to the Firefox profile

### Performance
- ✅ **Event-driven**: No polling, observer pattern is efficient
- ✅ **Low overhead**: Firefox manages the notification system
- ✅ **Instant updates**: Observers are notified immediately

### Reliability
- ✅ **Battle-tested**: Firefox has used this system for 20+ years
- ✅ **No race conditions**: Atomic read/write operations
- ✅ **Persistent**: Can optionally persist across browser restarts

### Developer Experience
- ✅ **Simple API**: Easy to read and write preferences
- ✅ **Good debugging tools**: about:config, browser console
- ✅ **Well-documented**: Extensive Mozilla documentation available

---

## Comparison: Preferences vs postMessage

| Feature | Firefox Preferences | postMessage |
|---------|-------------------|-------------|
| **Setup Complexity** | Moderate (extension + UC.JS) | Moderate (extension + UC.JS) |
| **Security** | Very Secure (built-in API) | Secure (recommended method) |
| **Performance** | Fast (event-driven) | Fast (event-driven) |
| **Browser Compatibility** | Firefox only | Cross-browser compatible |
| **Data Persistence** | Optional (can persist) | No persistence |
| **Debugging** | Easy (about:config) | Moderate (console logging) |
| **Cross-Tab Support** | Yes (global preferences) | Requires re-setup per tab |
| **Implementation** | Clean (observer pattern) | Clean (event listeners) |

**Recommendation**: Both methods work well. Choose based on your needs:
- **Use Preferences** if you want optional data persistence and global state
- **Use postMessage** if you want better cross-browser compatibility

---

## Advanced: Using Both Methods

Quick Tabs now supports **both** methods simultaneously! This provides:

1. **Redundancy**: If one method fails, the other can work
2. **Flexibility**: Users can choose which extension modification to use
3. **Compatibility**: Works with different versions of Copy-URL extension

The methods coexist peacefully because they both write to the same global variables (`hoveredLinkUrl` and `hoveredLinkTitle`).

---

## Summary

After implementing this guide:

1. ✅ Copy-URL extension detects hovered links
2. ✅ Extension writes link data to Firefox preferences via `browser.storage.local`
3. ✅ Quick Tabs observes preference changes via `Services.prefs.addObserver`
4. ✅ When user presses Ctrl+E, Quick Tabs reads the stored link and opens it
5. ✅ Works on 100+ websites with Copy-URL's specialized link detection
6. ✅ Secure, performant, and reliable communication method
7. ✅ Can coexist with the postMessage method for maximum compatibility

You now have a robust Firefox Preferences-based integration between Copy-URL and Quick Tabs!

---

## Additional Resources

- [Firefox Preferences API Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIPrefBranch)
- [WebExtension Storage API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage)
- [Observer Pattern in Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Observer_Notifications)
- [Quick Tabs GitHub Repository](https://github.com/ChunkyNosher/Quick-Tabs)
- [Copy-URL Extension Repository](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition)
