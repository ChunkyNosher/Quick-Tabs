# Quick Start Guide for Quick Tabs

Get started with Quick Tabs in just a few minutes!

## What Quick Tabs Does

**Quick Tabs** lets you open links in floating browser windows without cluttering your tab bar.

🚀 **New**: Built-in link hover detection - no extension required!

### Key Features:
- **Hover + Ctrl+E**: Hover over any link and press Ctrl+E to open it in a Quick Tab
- **Right-click menu**: Right-click any link → "Open Quick Tab"
- **Drag & drop**: Drag links to the Quick Tabs taskbar
- **Works everywhere**: Native link detection on all websites

## Quick Setup (2 Minutes)

### Step 1: Install Quick Tabs

**Via Sine (Recommended)**:
1. Navigate to [Sine](https://github.com/CosmoCreeper/Sine)
2. Search for "Quick Tabs"
3. Click **Install**
4. Clear Startup Cache and restart

**Manual Installation**:
1. Download `Quick_Tabs.uc.js` and `quicktabs-content.js`
2. Place both files in your profile's `chrome/JS/` directory
3. Add preferences from `preferences.json` to `about:config`
4. Clear Startup Cache and restart

### Step 2: Test It!

1. Go to any website with links (e.g., GitHub.com)
2. Hover over a link
3. Press **Ctrl+E**
4. Quick Tab opens! 🎉

## How It Works

Quick Tabs loads a content script into all web pages that:
- Detects when you hover over links
- Sends the link info to Quick Tabs (secure message passing)
- When you press Ctrl+E, Quick Tab opens with that link

**No external extension needed!** Everything works out of the box.

## Basic Usage

### Opening Quick Tabs

1. **Hover + Keyboard**: Hover over any link, press **Ctrl+E**
2. **Right-click menu**: Right-click link → "Open Quick Tab"  
3. **Drag & Drop**: Drag link to Quick Tabs taskbar
4. **From tabs**: Right-click tab → "Open in Quick Tab"

### Managing Quick Tabs

- **Move**: Drag the header
- **Resize**: Drag bottom-right corner
- **Rename**: Double-click title
- **Minimize**: Click minimize button
- **Close**: Click X button

### Taskbar

- Hover over taskbar (bottom-right) to see all Quick Tabs
- Click items to focus/restore
- Close from taskbar

## Optional: Copy-URL Extension Integration

Want specialized link detection for complex sites like YouTube, Twitter, Reddit?

The [Copy-URL-on-Hover extension](https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition) can enhance Quick Tabs with 100+ site-specific handlers.

**Setup**:
1. Download Copy-URL extension source
2. Modify it to use `sendAsyncMessage` (see [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md))
3. Load modified extension in Firefox
4. Enjoy enhanced link detection!

**Note**: This is optional - Quick Tabs works great without it!

## Documentation

📖 **Full README**: [README.md](./README.md) - Complete feature list and configuration

🔧 **Integration Guide**: [COPY_URL_INTEGRATION_GUIDE.md](./COPY_URL_INTEGRATION_GUIDE.md) - Optional Copy-URL extension setup

🧪 **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Verify everything works

## Troubleshooting

### "Ctrl+E doesn't work!"

1. **Verify installation**: Check that both files are in `chrome/JS/`:
   - `Quick_Tabs.uc.js`
   - `quicktabs-content.js`
2. **Check browser console**: Press Ctrl+Shift+J and look for:
   - "QuickTabs: Message listeners added successfully"
   - "QuickTabs: Content script loaded successfully"
3. **Restart browser**: Clear startup cache and restart
4. **Test on simple page**: Try hovering over links on GitHub or Wikipedia

### "Content script not loaded"

If you see "Content script file not found":
1. Verify `quicktabs-content.js` is in the same directory as `Quick_Tabs.uc.js`
2. Check file permissions (should be readable)
3. Path should be: `[profile]/chrome/JS/quicktabs-content.js`

### "Quick Tab opens wrong link"

Make sure you're hovering directly over the link when pressing Ctrl+E. The detection updates based on your current hover position.

### "Works sometimes but not always"

This is usually timing - make sure you:
- Hover over the link first
- Wait a split second  
- Then press Ctrl+E

## Customization

### Keyboard Shortcut

Change the shortcut in `about:config`:
```
extensions.quicktabs.keyboard_shortcut = "Control+E"
```

Examples:
- `"Control+E"` (default)
- `"Control+Shift+E"`
- `"Alt+Q"`

### Other Settings

See `preferences.json` for all configurable options:
- Theme (dark/light)
- Default window size
- Taskbar behavior
- Maximum containers
- And more!

## Benefits

✅ **Works out of the box**: No external dependencies  
✅ **Secure**: Uses Firefox's message manager API  
✅ **Universal**: Works on all HTTP/HTTPS websites  
✅ **Fast**: Instant link detection and Quick Tab opening  
✅ **Optional enhancement**: Can use Copy-URL for complex sites  

## Need Help?

1. Check the [README.md](./README.md) for detailed feature documentation
2. Read the [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md) if using Copy-URL extension
3. Review the [Testing Guide](./TESTING_GUIDE.md) to verify your setup
4. Open an issue on GitHub - we're here to help!

---

**Last Updated**: 2025-11-08  
**Version**: 2.0 (Built-in link detection)  
**Issue**: #5  
**Status**: ✅ Fixed - Native link hover detection implemented
