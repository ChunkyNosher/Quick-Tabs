// QuickTabs Content Script
// This script runs in the content context of web pages to detect link hovers
// and communicate with the Quick Tabs userscript via message manager

(function() {
    'use strict';

    let currentHoveredLink = null;
    let currentHoveredUrl = null;
    let currentHoveredTitle = null;

    // Debounce helper to avoid sending too many messages
    let hoverTimeout = null;
    const HOVER_DELAY = 100; // milliseconds

    // Function to extract URL from an element
    function getUrlFromElement(element) {
        // Direct href attribute
        if (element.href) {
            return element.href;
        }

        // Check for data attributes that might contain URLs
        if (element.dataset && element.dataset.url) {
            return element.dataset.url;
        }

        // Check for common URL-containing attributes
        const urlAttributes = ['data-href', 'data-link', 'data-url'];
        for (const attr of urlAttributes) {
            const value = element.getAttribute(attr);
            if (value && value.startsWith('http')) {
                return value;
            }
        }

        return null;
    }

    // Function to extract title/text from a link element
    function getTitleFromElement(element) {
        // Try various methods to get a meaningful title
        const title = element.title || 
                     element.getAttribute('aria-label') || 
                     element.textContent?.trim() || 
                     element.alt || 
                     '';

        return title.substring(0, 200); // Limit title length
    }

    // Function to send hover message to Quick Tabs
    function sendHoverMessage(url, title) {
        try {
            if (typeof sendAsyncMessage === 'function') {
                sendAsyncMessage('CopyURLHover:Hover', {
                    url: url,
                    title: title || ''
                });
            } else {
                console.error('QuickTabs content script: sendAsyncMessage not available');
            }
        } catch (e) {
            console.error('QuickTabs content script: Error sending hover message:', e);
        }
    }

    // Function to send clear message to Quick Tabs
    function sendClearMessage() {
        try {
            if (typeof sendAsyncMessage === 'function') {
                sendAsyncMessage('CopyURLHover:Clear', {});
            } else {
                console.error('QuickTabs content script: sendAsyncMessage not available');
            }
        } catch (e) {
            console.error('QuickTabs content script: Error sending clear message:', e);
        }
    }

    // Handle mouseover events on links
    function handleMouseOver(event) {
        const element = event.target;

        // Find the closest link element (could be a child of the link)
        let linkElement = element.closest('a');

        // If not an anchor tag, check if element itself has href or URL data
        if (!linkElement && getUrlFromElement(element)) {
            linkElement = element;
        }

        if (!linkElement) {
            return;
        }

        const url = getUrlFromElement(linkElement);
        
        if (!url || !url.startsWith('http')) {
            return; // Ignore non-http links
        }

        // Avoid duplicate events for the same link
        if (currentHoveredLink === linkElement && currentHoveredUrl === url) {
            return;
        }

        currentHoveredLink = linkElement;
        currentHoveredUrl = url;
        currentHoveredTitle = getTitleFromElement(linkElement);

        // Debounce the message sending
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        hoverTimeout = setTimeout(() => {
            sendHoverMessage(url, currentHoveredTitle);
        }, HOVER_DELAY);
    }

    // Handle mouseout events
    function handleMouseOut(event) {
        const element = event.target;
        const linkElement = element.closest('a') || element;

        // Only clear if we're leaving the currently hovered link
        if (linkElement === currentHoveredLink) {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            currentHoveredLink = null;
            currentHoveredUrl = null;
            currentHoveredTitle = null;

            sendClearMessage();
        }
    }

    // Set up event listeners on the document
    function setupEventListeners() {
        // Only set up on HTTP(S) pages
        const location = content.location || document.location;
        if (!location || !location.href.startsWith('http')) {
            console.log('QuickTabs content script: Skipping non-HTTP page:', location?.href);
            return;
        }

        // Use capture phase to catch events before they bubble
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        console.log('QuickTabs content script: Link hover detection initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
        setupEventListeners();
    }

})();
