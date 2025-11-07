# Quick Start: Copy-URL Extension Integration

This is a quick reference guide to help you get started with the Copy-URL extension integration for Quick Tabs.

## What This Integration Does

Allows you to **hover over any link on a webpage** and press **Ctrl+E** to instantly open it in a Quick Tab.

Works on 100+ websites including:
- YouTube (videos, channels, playlists)
- Twitter/X (tweets, profiles)  
- Reddit (posts, comments)
- GitHub (repos, issues, PRs)
- And many more!

## Quick Setup (5 Minutes)

### Step 1: Get the Extension
Download the Copy-URL-on-Hover extension source code:
```
https://github.com/ChunkyNosher/copy-URL-on-hover_ChunkyEdition
```

### Step 2: Modify the Extension
Follow the [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md) to make three simple changes to `content.js`:
1. Add marker initialization code (~60 lines)
2. Add one line to mouseover handler
3. Add one line to mouseout handler

### Step 3: Load the Extension
1. Open `about:debugging#/runtime/this-firefox` in Firefox/Zen Browser
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the modified extension

### Step 4: Test It!
1. Go to YouTube.com
2. Hover over a video thumbnail
3. Press **Ctrl+E**
4. Quick Tab opens with the video! 🎉

## Documentation

📖 **For detailed instructions**: [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md)

🧪 **To verify it works**: [Testing Guide](./TESTING_GUIDE.md)

🏗️ **To understand how it works**: [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## Troubleshooting

### "It's not working!"

1. **Check extension is loaded**: Go to `about:debugging` and verify Copy-URL is active
2. **Check console messages**: Press F12 and look for "CopyURL: Quick Tabs marker created"
3. **Check browser console**: Press Ctrl+Shift+J and look for "QuickTabs: Marker observer set up successfully"
4. **Try hovering slowly**: Make sure you're hovering directly over a link
5. **Verify modifications**: Double-check you added all three code changes

### "Works on some sites but not others"

This is expected! The Copy-URL extension has specialized handlers for 100+ sites. If a site doesn't work:
- Check if Copy-URL supports that site
- Try right-click → "Open Quick Tab" instead
- Or hover over the browser tab and press Ctrl+E

### "Quick Tabs opens but wrong link"

Make sure you're hovering directly over the link when pressing Ctrl+E. The marker updates based on your current hover position.

## Need Help?

1. Read the [Integration Guide](./COPY_URL_INTEGRATION_GUIDE.md) - detailed step-by-step instructions
2. Read the [Testing Guide](./TESTING_GUIDE.md) - 18+ tests to verify everything works
3. Check the [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - understand the architecture
4. Open an issue on GitHub - we're here to help!

## Benefits

✅ **Fast workflow**: Hover + Ctrl+E is faster than right-click menus  
✅ **100+ sites supported**: Works on all major platforms  
✅ **No code duplication**: Leverages existing extension  
✅ **Graceful fallback**: Still works with tabs if extension not installed  
✅ **Secure**: Uses browser-compliant DOM marker bridge  

## Requirements

- Firefox or Zen Browser
- Quick Tabs uc.js (installed via Sine or manually)
- Copy-URL extension (modified version)
- 5 minutes to set up

## Next Steps

1. **Get started**: Follow Step 1-4 above
2. **Test thoroughly**: Use the [Testing Guide](./TESTING_GUIDE.md)
3. **Enjoy**: Faster browsing with Quick Tabs! 🚀

---

**Last Updated**: 2025-11-07  
**Issue**: #5  
**Status**: ✅ Implemented and documented
