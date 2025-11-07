# Copy-URL-on-Hover Extension Integration Guide

This guide provides step-by-step instructions on how to modify the [Copy-URL-on-Hover Extension](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition) to work with Quick Tabs.

## Overview

The integration works through a **DOM marker bridge**:
1. The Copy-URL extension creates a hidden marker element in each webpage
2. When you hover over a link, it updates the marker with the link's URL and title
3. Quick Tabs observes the marker and makes the link data available for Ctrl+E

## Prerequisites

- Clone or download the [Copy-URL-on-Hover Extension](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition)
- Have a text editor ready to modify `content.js`

## Step 1: Add Quick Tabs Integration Code

Open `content.js` in the Copy-URL extension and add the following code **after line 82** (right after the `lastMouseY` variable declaration):

```javascript
// ============================================================
// QUICK TABS INTEGRATION - DOM Marker Bridge
// ============================================================

const QUICKTABS_MARKER_ID = 'quicktabs-link-marker';
let quickTabsMarker = null;

// Create marker element for Quick Tabs communication
function initQuickTabsMarker() {
    // Check if marker already exists
    quickTabsMarker = document.getElementById(QUICKTABS_MARKER_ID);
    
    if (!quickTabsMarker) {
        quickTabsMarker = document.createElement('div');
        quickTabsMarker.id = QUICKTABS_MARKER_ID;
        quickTabsMarker.style.display = 'none';
        quickTabsMarker.style.pointerEvents = 'none';
        
        // Append to body when it's available
        if (document.body) {
            document.body.appendChild(quickTabsMarker);
            console.log('CopyURL: Quick Tabs marker created');
        } else {
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(quickTabsMarker);
                console.log('CopyURL: Quick Tabs marker created (DOMContentLoaded)');
            });
        }
    }
}

// Update Quick Tabs marker with current hovered link
function updateQuickTabsMarker(url, title) {
    if (!quickTabsMarker) {
        initQuickTabsMarker();
    }
    
    if (quickTabsMarker) {
        if (url && url.trim() !== '') {
            quickTabsMarker.setAttribute('data-hovered-url', url);
            quickTabsMarker.setAttribute('data-hovered-title', title || url);
            quickTabsMarker.setAttribute('data-state', 'hovering');
            console.log('CopyURL: Updated Quick Tabs marker:', url);
        } else {
            quickTabsMarker.removeAttribute('data-hovered-url');
            quickTabsMarker.removeAttribute('data-hovered-title');
            quickTabsMarker.setAttribute('data-state', 'idle');
            console.log('CopyURL: Cleared Quick Tabs marker');
        }
    }
}

// Initialize marker on load
initQuickTabsMarker();

// ============================================================
// END QUICK TABS INTEGRATION
// ============================================================
```

## Step 2: Update the Mouseover Event Handler

Find the `mouseover` event listener (around **line 1471**) and add the marker update call. Look for this section:

```javascript
const url = findUrl(element, domainType);
if (url) {
    currentHoveredLink = element;
    currentHoveredElement = element;
    debug(`[${domainType}] URL found: ${url}`);
```

Add the marker update call right after `currentHoveredElement = element;`:

```javascript
const url = findUrl(element, domainType);
if (url) {
    currentHoveredLink = element;
    currentHoveredElement = element;
    
    // ADD THIS LINE - Update Quick Tabs marker
    updateQuickTabsMarker(url, getLinkText(element));
    
    debug(`[${domainType}] URL found: ${url}`);
```

## Step 3: Update the Mouseout Event Handler

Find the `mouseout` event listener (around **line 1553**) and add the marker clearing call:

```javascript
document.addEventListener('mouseout', function(event) {
    currentHoveredLink = null;
    currentHoveredElement = null;
    
    // ADD THIS LINE - Clear Quick Tabs marker
    updateQuickTabsMarker(null, null);
}, true);
```

## Step 4: Add Helper Function for Link Text (if not present)

If the extension doesn't already have a `getLinkText()` function, add this helper function near the marker functions:

```javascript
// Get readable text from a link element
function getLinkText(element) {
    if (!element) return '';
    
    // Try to get meaningful text from the element
    let text = element.textContent?.trim() || 
               element.title?.trim() || 
               element.alt?.trim() || 
               element.getAttribute('aria-label')?.trim() || '';
    
    // If text is too long, truncate it
    if (text.length > 100) {
        text = text.substring(0, 97) + '...';
    }
    
    return text;
}
```

## Step 5: Load the Modified Extension

1. Open Firefox/Zen Browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from your modified Copy-URL extension directory
5. The extension should now be loaded and ready to use

## Testing the Integration

### Test 1: Verify Marker Creation

1. Open any webpage (e.g., YouTube)
2. Open the browser console (F12)
3. Look for the message:
   ```
   CopyURL: Quick Tabs marker created
   ```

### Test 2: Verify Link Detection

1. With the console still open, hover over a link (e.g., a YouTube video thumbnail)
2. You should see:
   ```
   CopyURL: Updated Quick Tabs marker: https://youtube.com/watch?v=...
   ```
3. Move your mouse away from the link
4. You should see:
   ```
   CopyURL: Cleared Quick Tabs marker
   ```

### Test 3: Verify Marker in DOM

Run this in the web page console (F12):

```javascript
const marker = document.getElementById('quicktabs-link-marker');
console.log('Marker exists:', !!marker);

if (marker) {
    console.log('Marker URL:', marker.getAttribute('data-hovered-url'));
    console.log('Marker Title:', marker.getAttribute('data-hovered-title'));
    console.log('Marker State:', marker.getAttribute('data-state'));
}
```

### Test 4: Test with Quick Tabs

1. Make sure Quick Tabs uc.js is installed in your Zen Browser
2. Open the browser console (Ctrl+Shift+J for browser console, not page console)
3. Navigate to a website like YouTube
4. Wait a moment for Quick Tabs to detect the marker
5. Look for these messages in the browser console:
   ```
   QuickTabs: Marker element found, setting up observer
   QuickTabs: Marker observer set up successfully
   ```
6. Hover over a link (e.g., a video thumbnail)
7. You should see:
   ```
   QuickTabs: Link hover detected from extension: https://youtube.com/...
   ```
8. Press **Ctrl+E**
9. A Quick Tab should open with the hovered link!

## Troubleshooting

### Extension marker not created

**Problem**: No "CopyURL: Quick Tabs marker created" message in console

**Solutions**:
- Verify the extension is loaded in `about:debugging`
- Check for JavaScript errors in the console
- Make sure you added the code after the variable declarations
- Refresh the page after loading the extension

### Marker created but not updating

**Problem**: Marker exists but doesn't update when hovering over links

**Solutions**:
- Verify you added the `updateQuickTabsMarker()` call in the correct location
- Check that the `findUrl()` function is working (look for "URL found" debug messages)
- Make sure the mouseover handler is being triggered
- Try hovering over links slowly

### Quick Tabs not detecting changes

**Problem**: Quick Tabs doesn't open when pressing Ctrl+E

**Solutions**:
- Check the browser console (Ctrl+Shift+J) not the page console
- Look for "Marker observer set up" message
- Verify Quick Tabs is installed correctly
- Make sure you're hovering over a link when pressing Ctrl+E
- Try switching to a different tab and back to refresh the observer

### Console shows security errors

**Problem**: Cross-origin or security-related errors

**Solutions**:
- This is expected for some websites - the integration works within browser security limits
- The marker bridge approach is designed to work across security boundaries
- Make sure both Quick Tabs and the extension are properly installed

## Complete Code Example

Here's what the relevant section of `content.js` should look like after modification:

```javascript
let CONFIG = { ...DEFAULT_CONFIG };
let currentHoveredLink = null;
let currentHoveredElement = null;
let quickTabWindows = [];
let minimizedQuickTabs = [];
let quickTabZIndex = 1000000;
let lastMouseX = 0;
let lastMouseY = 0;

// ============================================================
// QUICK TABS INTEGRATION - DOM Marker Bridge
// ============================================================

const QUICKTABS_MARKER_ID = 'quicktabs-link-marker';
let quickTabsMarker = null;

function initQuickTabsMarker() {
    quickTabsMarker = document.getElementById(QUICKTABS_MARKER_ID);
    if (!quickTabsMarker) {
        quickTabsMarker = document.createElement('div');
        quickTabsMarker.id = QUICKTABS_MARKER_ID;
        quickTabsMarker.style.display = 'none';
        quickTabsMarker.style.pointerEvents = 'none';
        if (document.body) {
            document.body.appendChild(quickTabsMarker);
            console.log('CopyURL: Quick Tabs marker created');
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(quickTabsMarker);
                console.log('CopyURL: Quick Tabs marker created (DOMContentLoaded)');
            });
        }
    }
}

function updateQuickTabsMarker(url, title) {
    if (!quickTabsMarker) {
        initQuickTabsMarker();
    }
    if (quickTabsMarker) {
        if (url && url.trim() !== '') {
            quickTabsMarker.setAttribute('data-hovered-url', url);
            quickTabsMarker.setAttribute('data-hovered-title', title || url);
            quickTabsMarker.setAttribute('data-state', 'hovering');
            console.log('CopyURL: Updated Quick Tabs marker:', url);
        } else {
            quickTabsMarker.removeAttribute('data-hovered-url');
            quickTabsMarker.removeAttribute('data-hovered-title');
            quickTabsMarker.setAttribute('data-state', 'idle');
            console.log('CopyURL: Cleared Quick Tabs marker');
        }
    }
}

function getLinkText(element) {
    if (!element) return '';
    let text = element.textContent?.trim() || 
               element.title?.trim() || 
               element.alt?.trim() || 
               element.getAttribute('aria-label')?.trim() || '';
    if (text.length > 100) {
        text = text.substring(0, 97) + '...';
    }
    return text;
}

initQuickTabsMarker();

// ============================================================
// END QUICK TABS INTEGRATION
// ============================================================
```

## Summary

After making these changes:

1. ✅ The extension creates a hidden marker element in each webpage
2. ✅ The marker updates when you hover over links (100+ websites supported!)
3. ✅ Quick Tabs observes the marker and captures the hovered link
4. ✅ Pressing Ctrl+E opens the hovered link in a Quick Tab
5. ✅ No code duplication - leverages the extension's existing link detection
6. ✅ Works across the content/chrome security boundary

You can now hover over links on YouTube, Twitter, Reddit, GitHub, and 100+ other websites and instantly open them in Quick Tabs with Ctrl+E!
