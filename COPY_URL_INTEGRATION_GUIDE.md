# Copy-URL-on-Hover Extension Integration Guide

This guide provides step-by-step instructions on how to use the [Copy-URL-on-Hover Extension](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition) with Quick Tabs.

## Overview

The integration works through a **secure postMessage bridge**:
1. The Copy-URL extension detects when you hover over a link on a webpage
2. It sends a secure `postMessage` to the browser chrome with the link's URL and title
3. Quick Tabs listens for these messages and makes the link data available for Ctrl+E

## Prerequisites

- Use the **lite branch** of the [Copy-URL-on-Hover Extension](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition/tree/lite)
- The lite branch already includes the postMessage integration - no modifications needed!

## Installation Steps

### Step 1: Clone the Extension

Clone the **lite branch** of the Copy-URL-on-Hover extension:

```bash
git clone --branch lite https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition.git
```

### Step 2: Load the Extension in Firefox/Zen Browser

1. Open Firefox/Zen Browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the cloned directory
5. The extension should now be loaded and ready to use

That's it! The lite branch already includes the postMessage integration code.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Webpage (Content Context)                 │
│                                                              │
│  Copy-URL Extension (content.js)                            │
│  ├── Detects link hover (mouseover event)                   │
│  ├── Extracts URL using 100+ site-specific handlers         │
│  └── Sends postMessage:                                     │
│      window.postMessage({                                   │
│        direction: "from-content-to-chrome",                 │
│        type: 'QUICKTABS_URL_HOVER',                         │
│        payload: { url, title, state: 'hovering' }           │
│      }, "*");                                               │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │ postMessage
                           │ (Secure cross-context communication)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Browser Chrome Context                    │
│                                                              │
│  Quick Tabs (Quick_Tabs.uc.js)                              │
│  ├── Listens for 'message' events                           │
│  ├── Filters for QUICKTABS_URL_HOVER type                   │
│  ├── Captures URL and title from payload                    │
│  ├── User presses Ctrl+E                                    │
│  └── Creates Quick Tab with captured URL                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Message Format

The extension sends messages in this format:

```javascript
{
  direction: "from-content-to-chrome",
  type: "QUICKTABS_URL_HOVER",
  payload: {
    url: "https://example.com/page",
    title: "Page Title",
    state: "hovering"  // or "idle" when mouse moves away
  }
}
```

## Testing the Integration

### Test 1: Verify Extension Loading

1. Open Firefox/Zen Browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Verify the Copy-URL extension is listed and shows "Running" status

**Expected Result**: ✅ Extension loads without errors

---

### Test 2: Verify Quick Tabs Message Listener

1. Open the Browser Console (Ctrl+Shift+J - NOT the page console)
2. Navigate to any webpage (e.g., https://www.youtube.com)
3. Look for the message:
   ```
   QuickTabs: Link hover detection setup complete
   QuickTabs: Message listener set up successfully
   ```

**Expected Result**: ✅ Quick Tabs sets up the message listener

---

### Test 3: Verify Link Detection

1. With the browser console still open (Ctrl+Shift+J)
2. Navigate to YouTube: https://www.youtube.com
3. Hover over a video thumbnail
4. Look for messages:
   ```
   QuickTabs: Link hover detected from extension: https://youtube.com/watch?v=...
   ```
5. Move your mouse away from the link
6. Look for message:
   ```
   QuickTabs: Link unhovered
   ```

**Expected Result**:
- ✅ Messages appear when hovering and unhovering
- ✅ URL is correctly captured

---

### Test 4: Open Quick Tab from Hovered Link

1. On YouTube, hover over a video thumbnail
2. While hovering, press **Ctrl+E** (or your configured shortcut)
3. A Quick Tab window should appear
4. The Quick Tab should load the video you hovered over

**Expected Result**:
- ✅ Quick Tab opens immediately when pressing Ctrl+E
- ✅ Quick Tab loads the correct URL
- ✅ Notification shows "Quick Tab opened from link: ..."

---

### Test 5: Multiple Websites

Test on various websites to verify the integration works broadly:

| Website | Test Link | Expected Behavior |
|---------|-----------|-------------------|
| YouTube | Video thumbnail | ✅ Opens video in Quick Tab |
| Twitter/X | Tweet | ✅ Opens tweet in Quick Tab |
| Reddit | Post title | ✅ Opens post in Quick Tab |
| GitHub | Repository link | ✅ Opens repo in Quick Tab |
| Google | Search result | ✅ Opens result in Quick Tab |

**Steps** (for each site):
1. Navigate to the website
2. Hover over a link
3. Press Ctrl+E
4. Verify Quick Tab opens with correct content

**Expected Result**: ✅ Works on all supported websites

---

### Test 6: Tab Switch Behavior

1. On YouTube, verify link detection works (hover over a video, see console message)
2. Open a new tab and navigate to Twitter/X
3. Check browser console for: `QuickTabs: Tab switched, re-setting up message listener`
4. Wait for: `QuickTabs: Message listener set up successfully`
5. Hover over a tweet and press Ctrl+E

**Expected Result**:
- ✅ Message listener resets when switching tabs
- ✅ Link detection works on new tab

---

### Test 7: Page Navigation

1. On YouTube homepage, verify link detection works
2. Click on a video to navigate to a new page
3. Check browser console for: `QuickTabs: Page loaded, re-setting up message listener`
4. Hover over a related video and press Ctrl+E

**Expected Result**:
- ✅ Message listener resets after navigation
- ✅ Link detection works on new page

---

## Troubleshooting

### Extension not sending messages

**Problem**: No messages appear in console when hovering over links

**Solutions**:
- Verify the extension is loaded in `about:debugging`
- Make sure you're using the **lite branch** of the extension
- Check for JavaScript errors in the page console (F12)
- Refresh the page after loading the extension

### Quick Tabs not receiving messages

**Problem**: Extension sends messages but Quick Tabs doesn't respond

**Solutions**:
- Check the browser console (Ctrl+Shift+J) not the page console
- Look for "Message listener set up successfully" message
- Verify Quick Tabs is installed correctly
- Try switching to a different tab and back to refresh the listener

### Ctrl+E doesn't work

**Problem**: Quick Tabs doesn't open when pressing Ctrl+E

**Solutions**:
- Make sure you're hovering over a link when pressing Ctrl+E
- Verify the keyboard shortcut in about:config (`extensions.quicktabs.keyboard_shortcut`)
- Check for keyboard shortcut conflicts with other extensions
- Look for error messages in the browser console

### Works on some sites but not others

**Problem**: Integration works on some websites but not others

**Solutions**:
- Check if Copy-URL supports the website (it supports 100+ sites)
- Look for console errors on the problematic site
- Try hovering slowly over links
- Verify the extension is active on this website

## Benefits of postMessage Approach

### Security
- ✅ **Secure cross-context communication**: postMessage is the recommended way to communicate between content scripts and privileged chrome code
- ✅ **No DOM pollution**: Doesn't create any visible elements in web pages
- ✅ **Works within browser security model**: Respects Firefox's security boundaries

### Performance
- ✅ **No polling**: Event-driven, no periodic checks required
- ✅ **Lightweight**: Minimal overhead on webpage performance
- ✅ **Efficient**: Direct message passing without DOM mutations

### Reliability
- ✅ **No race conditions**: Messages are reliably delivered
- ✅ **No timing issues**: No need to wait for DOM elements to be created
- ✅ **Cleaner implementation**: Simpler code, easier to maintain

## Summary

After installation:

1. ✅ The extension uses postMessage to communicate with Quick Tabs
2. ✅ No DOM marker element is created (cleaner and more secure)
3. ✅ Messages are sent when you hover over links (100+ websites supported!)
4. ✅ Quick Tabs listens for messages and captures the hovered link
5. ✅ Pressing Ctrl+E opens the hovered link in a Quick Tab
6. ✅ No code duplication - leverages the extension's existing link detection
7. ✅ Secure communication across the content/chrome boundary

You can now hover over links on YouTube, Twitter, Reddit, GitHub, and 100+ other websites and instantly open them in Quick Tabs with Ctrl+E!
    currentHoveredElement = element;
    debug(`[${domainType}] URL found: ${url}`);
```

Add the marker update call right after `currentHoveredElement = element;`:
