# Testing Guide for Copy-URL Extension Integration

This guide helps you verify that the Quick Tabs integration with the Copy-URL extension is working correctly.

## Prerequisites

Before testing, ensure:
- [ ] Quick Tabs is installed in your Zen Browser (via Sine or manually)
- [ ] Copy-URL extension source code is downloaded from https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition
- [ ] You have modified the extension's `content.js` file following the [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md)
- [ ] The modified extension is loaded in Firefox/Zen Browser (about:debugging)

## Test Environment

- **Browser**: Firefox or Zen Browser
- **Extension**: Copy-URL-on-Hover (modified version)
- **Quick Tabs**: Latest version with integration support

## Test Suite

### Test 1: Extension Loading

**Purpose**: Verify the Copy-URL extension loads correctly with modifications

**Steps**:
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Verify the Copy-URL extension is listed
3. Check that it shows "Running" or similar active status

**Expected Result**: ✅ Extension loads without errors

---

### Test 2: Marker Element Creation

**Purpose**: Verify the extension creates the DOM marker element

**Steps**:
1. Open any webpage (e.g., https://www.youtube.com)
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Look for the message: `CopyURL: Quick Tabs marker created`

**Expected Result**: ✅ Message appears in console

**Troubleshooting**:
- If no message appears, verify the extension is loaded
- Check for JavaScript errors in the console
- Ensure you added the marker initialization code correctly

---

### Test 3: Marker Element in DOM

**Purpose**: Verify the marker element exists in the page DOM

**Steps**:
1. With the console still open (F12)
2. Run this command in the console:
   ```javascript
   document.getElementById('quicktabs-link-marker')
   ```
3. You should see: `<div id="quicktabs-link-marker" data-state="idle" style="display: none; pointer-events: none;"></div>`

**Expected Result**: ✅ Marker element is present

---

### Test 4: Link Hover Detection (Extension Side)

**Purpose**: Verify the extension updates the marker when hovering over links

**Steps**:
1. Open YouTube: https://www.youtube.com
2. Keep the console open (F12)
3. Slowly hover over a video thumbnail
4. Look for message: `CopyURL: Updated Quick Tabs marker: https://youtube.com/watch?v=...`
5. Move mouse away from the link
6. Look for message: `CopyURL: Cleared Quick Tabs marker`

**Expected Result**: 
- ✅ Marker updates when hovering over link
- ✅ Marker clears when mouse moves away

**Troubleshooting**:
- Try hovering slowly over different elements
- Check that the `updateQuickTabsMarker()` call was added correctly
- Verify the mouseover handler is firing

---

### Test 5: Marker Attributes Update

**Purpose**: Verify marker attributes are set correctly

**Steps**:
1. On YouTube, hover over a video thumbnail
2. In the console (F12), run:
   ```javascript
   const marker = document.getElementById('quicktabs-link-marker');
   console.log('URL:', marker.getAttribute('data-hovered-url'));
   console.log('Title:', marker.getAttribute('data-hovered-title'));
   console.log('State:', marker.getAttribute('data-state'));
   ```

**Expected Result**:
- ✅ URL shows the video link (e.g., `https://youtube.com/watch?v=...`)
- ✅ Title shows the video title or link text
- ✅ State shows `hovering`

---

### Test 6: Quick Tabs Marker Observer Setup

**Purpose**: Verify Quick Tabs detects and observes the marker

**Steps**:
1. Open the Browser Console (Ctrl+Shift+J - NOT the page console)
2. Navigate to YouTube: https://www.youtube.com
3. Wait 1-2 seconds (Quick Tabs will poll for the marker for up to 10 seconds)
4. Look for messages:
   ```
   QuickTabs: Setting up link hover detection via extension marker
   QuickTabs: Marker not found yet, waiting...
   QuickTabs: Marker element found after XXX ms
   QuickTabs: Setting up marker observer
   QuickTabs: Marker observer set up successfully
   ```

**Expected Result**: ✅ Messages show polling activity and successful marker detection

**Note**: With the improved retry mechanism, Quick Tabs now polls every 500ms for up to 10 seconds to find the marker, which resolves race conditions where the extension's content script hasn't loaded yet.

**Troubleshooting**:
- If you see "Marker detection timed out after 10000 ms", the extension may not be installed or not active on this page
- Check that the Copy-URL extension is enabled and properly modified
- Verify the extension is active on this website
- If timeout occurs on non-content pages (about:, chrome://), this is expected behavior

---

### Test 7: Link Hover Detection (Quick Tabs Side)

**Purpose**: Verify Quick Tabs detects hovered links via the marker

**Steps**:
1. Keep the Browser Console open (Ctrl+Shift+J)
2. On YouTube, hover over a video thumbnail
3. Look for message: `QuickTabs: Link hover detected from extension: https://youtube.com/...`
4. Move mouse away
5. Look for message: `QuickTabs: Link unhovered`

**Expected Result**:
- ✅ Quick Tabs detects when you hover over a link
- ✅ Quick Tabs detects when you move away

---

### Test 8: Quick Tab Opening from Hovered Link

**Purpose**: Verify Ctrl+E opens a Quick Tab with the hovered link

**Steps**:
1. On YouTube, hover over a video thumbnail
2. While hovering, press **Ctrl+E** (or your configured shortcut)
3. A Quick Tab window should appear
4. The Quick Tab should load the video you hovered over

**Expected Result**:
- ✅ Quick Tab opens immediately when pressing Ctrl+E
- ✅ Quick Tab loads the correct URL
- ✅ Notification shows "Quick Tab opened from link: ..."

**Troubleshooting**:
- Make sure you're holding the mouse over the link when pressing Ctrl+E
- Check the browser console for error messages
- Verify Quick Tabs is properly installed

---

### Test 9: Multiple Websites

**Purpose**: Verify integration works on various websites

**Test Sites**:

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

### Test 10: Tab Switch Behavior

**Purpose**: Verify observer re-establishes when switching tabs

**Steps**:
1. On YouTube, verify Quick Tabs link detection works (Test 7)
2. Open a new tab and navigate to Twitter/X
3. Check browser console for: `QuickTabs: Tab switched, re-setting up observer`
4. Wait for: `QuickTabs: Marker observer set up successfully`
5. Hover over a tweet and press Ctrl+E

**Expected Result**:
- ✅ Observer resets when switching tabs
- ✅ Link detection works on new tab

---

### Test 11: Page Navigation

**Purpose**: Verify observer re-establishes after page navigation

**Steps**:
1. On YouTube homepage, verify link detection works
2. Click on a video to navigate to a new page
3. Check browser console for: `QuickTabs: Page loaded, re-setting up observer`
4. Hover over a related video and press Ctrl+E

**Expected Result**:
- ✅ Observer resets after navigation
- ✅ Link detection works on new page

---

### Test 12: Fallback to Tab Hover

**Purpose**: Verify Quick Tabs still works with tab hover when not over a link

**Steps**:
1. On YouTube, do NOT hover over any link
2. Hover over the browser tab itself
3. Press Ctrl+E
4. A Quick Tab should open with the current page URL

**Expected Result**:
- ✅ Quick Tab opens from hovered tab
- ✅ No link hover detected (falls back to tab hover)

---

### Test 13: No Extension Graceful Degradation

**Purpose**: Verify Quick Tabs works without the extension

**Steps**:
1. Disable the Copy-URL extension in about:debugging
2. Refresh a webpage
3. Check browser console - should show:
   - "Marker not found yet, waiting..." (repeating every 500ms)
   - "Marker detection timed out after 10000 ms" (after 10 seconds)
   - "Marker not detected - extension may not be installed or page not supported"
4. Hover over a browser tab
5. Press Ctrl+E

**Expected Result**:
- ✅ No errors occur
- ✅ Tab hover still works
- ✅ Polling stops after 10 seconds timeout
- ✅ Informative message about extension not being detected
- ✅ Link hover gracefully fails (expected)

---

## Performance Tests

### Test 14: Memory Usage

**Purpose**: Verify integration doesn't cause memory leaks

**Steps**:
1. Open Browser Console (Ctrl+Shift+J)
2. Navigate to YouTube
3. Hover over 20+ different video links
4. Switch between tabs 5+ times
5. Check browser console for any warnings

**Expected Result**: ✅ No memory warnings or errors

---

### Test 15: CPU Usage

**Purpose**: Verify integration doesn't cause performance issues

**Steps**:
1. Open Task Manager / Activity Monitor
2. Note Firefox/Zen Browser CPU usage
3. Hover rapidly over multiple links
4. CPU should remain reasonable (<10% spike)

**Expected Result**: ✅ No significant CPU usage increase

---

## Edge Cases

### Test 16: Rapid Hovering

**Purpose**: Verify system handles rapid mouse movements

**Steps**:
1. On YouTube, rapidly move mouse over multiple video thumbnails
2. Press Ctrl+E while hovering
3. Correct Quick Tab should open

**Expected Result**: ✅ System keeps up with rapid movements

---

### Test 17: Multiple Quick Tabs from Links

**Purpose**: Verify multiple Quick Tabs can be opened from links

**Steps**:
1. On YouTube, hover over first video, press Ctrl+E
2. Hover over second video, press Ctrl+E
3. Hover over third video, press Ctrl+E
4. Three Quick Tabs should be open

**Expected Result**: ✅ All Quick Tabs open correctly

---

### Test 18: Cross-Site Link Detection

**Purpose**: Verify links to different sites are detected

**Steps**:
1. On Reddit, find a post with external link
2. Hover over the external link
3. Press Ctrl+E
4. Quick Tab should open with external site

**Expected Result**: ✅ External links work correctly

---

## Troubleshooting Guide

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| No marker created | Extension not loaded | Check about:debugging |
| Marker exists but doesn't update | Code not added to mouseover | Verify Step 2 of integration guide |
| Quick Tabs doesn't detect hover | Observer not set up | Check browser console for errors |
| Ctrl+E doesn't work | Keyboard shortcut conflict | Change shortcut in about:config |
| Works on some sites but not others | Site-specific issue | Check if Copy-URL supports the site |
| Memory leaks | Observer not cleaned up | Report as bug |

## Success Criteria

✅ All tests pass (Tests 1-18)
✅ No console errors
✅ Works on at least 5 different websites
✅ Graceful fallback when extension not installed
✅ No performance degradation

## Reporting Issues

If any tests fail, please report with:
- Test number that failed
- Browser version (Firefox/Zen Browser)
- Extension version
- Console error messages
- Steps to reproduce

## Additional Testing

For comprehensive testing, also verify:
- [ ] Works with Zen Browser's workspace feature
- [ ] Compatible with other Firefox extensions
- [ ] Works in private/incognito mode (extension must be enabled for private windows)
- [ ] Works with different keyboard shortcuts
- [ ] Quick Tabs close properly when finished
- [ ] Taskbar shows Quick Tabs correctly
- [ ] Minimize/restore works for Quick Tabs opened from links

---

**Last Updated**: 2025-11-07
**Compatible With**: Quick Tabs v1.0+ with integration support
