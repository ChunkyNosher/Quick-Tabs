# Testing Guide for Copy-URL Extension Integration

This guide helps you verify that the Quick Tabs integration with the Copy-URL extension is working correctly.

## Prerequisites

Before testing, ensure:
- [ ] Quick Tabs is installed in your Zen Browser (via Sine or manually)
- [ ] Copy-URL extension **lite branch** is downloaded from https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition/tree/lite
- [ ] The lite branch extension is loaded in Firefox/Zen Browser (about:debugging)
- [ ] **No modifications required** - the lite branch already includes postMessage integration!

## Test Environment

- **Browser**: Firefox or Zen Browser
- **Extension**: Copy-URL-on-Hover (lite branch - unmodified)
- **Quick Tabs**: Latest version with postMessage listener support

## Test Suite

### Test 1: Extension Loading

**Purpose**: Verify the Copy-URL extension loads correctly

**Steps**:
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Verify the Copy-URL extension is listed
3. Check that it shows "Running" or similar active status

**Expected Result**: ✅ Extension loads without errors

---

### Test 2: Quick Tabs Message Listener Setup

**Purpose**: Verify Quick Tabs sets up the postMessage listener

**Steps**:
1. Open the Browser Console (Ctrl+Shift+J - NOT the page console F12)
2. Navigate to any webpage (e.g., https://www.youtube.com)
3. Look for the message: `QuickTabs: Message listener set up successfully`

**Expected Result**: ✅ Message appears in browser console

**Troubleshooting**:
- Make sure you're looking at the browser console (Ctrl+Shift+J), not the page console (F12)
- If no message appears, verify Quick Tabs is installed correctly
- Check for JavaScript errors in the browser console

---

### Test 3: Link Hover Detection (Extension Side)

**Purpose**: Verify the extension sends postMessage when hovering over links

**Steps**:
1. Keep the browser console open (Ctrl+Shift+J)
2. Navigate to YouTube: https://www.youtube.com
3. Slowly hover over a video thumbnail
4. Look for message: `QuickTabs: Link hover detected from extension: https://youtube.com/watch?v=...`
5. Move mouse away from the link
6. Look for message: `QuickTabs: Link unhovered`
**Expected Result**:
- ✅ Messages appear when hovering and unhovering
- ✅ URL is correctly captured

**Troubleshooting**:
- Try hovering slowly over different elements
- Check that the extension is loaded in about:debugging
- Verify the mouseover/mouseout handlers are firing
- Ensure you're using the lite branch

---

### Test 4: Quick Tab Opening from Hovered Link

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
3. Check browser console for: `QuickTabs: Page loaded, re-setting up message listener`
4. Hover over a related video and press Ctrl+E

**Expected Result**:
- ✅ Message listener resets after navigation
- ✅ Link detection works on new page

---

### Test 9: Fallback to Tab Hover

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

### Test 10: No Extension Graceful Degradation

**Purpose**: Verify Quick Tabs works without the extension

**Steps**:
1. Disable the Copy-URL extension in about:debugging
2. Refresh a webpage
3. Check browser console - message listener should still be set up but no messages received
4. Hover over a browser tab
5. Press Ctrl+E

**Expected Result**:
- ✅ No errors occur
- ✅ Tab hover still works
- ✅ Link hover gracefully fails (expected)
- ✅ Message listener is still set up

---

## Performance Tests

### Test 11: Memory Usage

**Purpose**: Verify integration doesn't cause memory leaks

**Steps**:
1. Open Browser Console (Ctrl+Shift+J)
2. Navigate to YouTube
3. Hover over 20+ different video links
4. Switch between tabs 5+ times
5. Check browser console for any warnings

**Expected Result**: ✅ No memory warnings or errors

---

### Test 12: CPU Usage

**Purpose**: Verify integration doesn't cause performance issues

**Steps**:
1. Open Task Manager / Activity Monitor
2. Note Firefox/Zen Browser CPU usage
3. Hover rapidly over multiple links
4. CPU should remain reasonable (<5% spike for postMessage)

**Expected Result**: ✅ No significant CPU usage increase (postMessage is very lightweight)

---

## Edge Cases

### Test 13: Rapid Hovering

**Purpose**: Verify system handles rapid mouse movements

**Steps**:
1. On YouTube, rapidly move mouse over multiple video thumbnails
2. Press Ctrl+E while hovering
3. Correct Quick Tab should open

**Expected Result**: ✅ System keeps up with rapid movements

---

### Test 14: Multiple Quick Tabs from Links

**Purpose**: Verify multiple Quick Tabs can be opened from links

**Steps**:
1. On YouTube, hover over first video, press Ctrl+E
2. Hover over second video, press Ctrl+E
3. Hover over third video, press Ctrl+E
4. Three Quick Tabs should be open

**Expected Result**: ✅ All Quick Tabs open correctly

---

### Test 15: Cross-Site Link Detection

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
| Extension not sending messages | Extension not loaded | Check about:debugging |
| postMessage not received | Wrong branch | Use lite branch, not main |
| Quick Tabs doesn't detect hover | Message listener not set up | Check browser console for errors |
| Ctrl+E doesn't work | Keyboard shortcut conflict | Change shortcut in about:config |
| Works on some sites but not others | Site-specific issue | Check if Copy-URL supports the site |
| No messages in console | Looking at wrong console | Use Ctrl+Shift+J (browser console) not F12 (page console) |

## Success Criteria

✅ All tests pass (Tests 1-15)
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
