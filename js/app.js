/* ============================================
   PYTHON ZERO - MAIN APP
   UI Interactions and Event Handlers
   ============================================ */

/**
 * Initialize app
 */
function initApp() {
    setupEventListeners();
    registerServiceWorker();
    setupInstallPrompt();
    console.log('PythonZero v1.0 initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Run Code Button
    const runButton = document.getElementById('run-code');
    if (runButton) {
        runButton.addEventListener('click', runCode);
    }

    // Clear Editor Button
    const clearEditorButton = document.getElementById('clear-editor');
    if (clearEditorButton) {
        clearEditorButton.addEventListener('click', () => {
            if (confirm('Clear all code in the editor?')) {
                clearEditor();
                clearOutput();
            }
        });
    }

    // Clear Output Button
    const clearOutputButton = document.getElementById('clear-output');
    if (clearOutputButton) {
        clearOutputButton.addEventListener('click', clearOutput);
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleNavPanel);
    }

    // Panel Close Buttons
    const panelCloseButtons = document.querySelectorAll('.panel-close');
    panelCloseButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.closest('.panel');
            if (panel) {
                panel.classList.remove('active');
                document.body.classList.remove('panel-open');
            }
        });
    });

    // Close panels when clicking overlay (mobile)
    document.body.addEventListener('click', (e) => {
        if (e.target === document.body && document.body.classList.contains('panel-open')) {
            closeAllPanels();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Track navigation is now handled in lessons.js
}

/**
 * Toggle navigation panel (mobile)
 */
function toggleNavPanel() {
    const navPanel = document.getElementById('navigation');
    const isActive = navPanel.classList.contains('active');

    closeAllPanels();

    if (!isActive) {
        navPanel.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

/**
 * Toggle help panel (mobile)
 */
function toggleHelpPanel() {
    const helpPanel = document.getElementById('help-panel');
    const isActive = helpPanel.classList.contains('active');

    closeAllPanels();

    if (!isActive) {
        helpPanel.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

/**
 * Close all mobile panels
 */
function closeAllPanels() {
    const panels = document.querySelectorAll('.panel-nav, .panel-help');
    panels.forEach(panel => panel.classList.remove('active'));
    document.body.classList.remove('panel-open');
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl+? or Cmd+? - Show help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleHelpPanel();
    }

    // Ctrl+Enter or Cmd+Enter - Run code (handled by CodeMirror extraKeys)
    // This is a fallback
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!editor.hasFocus()) {
            e.preventDefault();
            runCode();
        }
    }

    // Escape - Close panels
    if (e.key === 'Escape') {
        closeAllPanels();
    }
}

/**
 * Show welcome message on first load
 */
function showWelcome() {
    const hasVisited = localStorage.getItem('pythonzero-visited');

    if (!hasVisited) {
        setTimeout(() => {
            alert('Welcome to PythonZero! 🚀\n\nPress RUN or Ctrl+Enter to execute the example code.\n\nThis is your browser-based Python playground!');
            localStorage.setItem('pythonzero-visited', 'true');
        }, 500);
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    // Close mobile panels on resize to desktop
    if (window.innerWidth > 768) {
        closeAllPanels();
    }

    // Refresh CodeMirror
    if (editor) {
        editor.refresh();
    }
}

// Debounce resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        showWelcome();
    });
} else {
    initApp();
    showWelcome();
}

// Handle visibility change (when tab becomes active)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && editor) {
        editor.refresh();
    }
});

/* ============================================
   PWA - SERVICE WORKER REGISTRATION
   ============================================ */

/**
 * Register service worker for offline functionality
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                console.log('Cache updated');
            }
        });
    }
}

/**
 * Show update notification when new service worker is available
 */
function showUpdateNotification() {
    const updateBar = document.createElement('div');
    updateBar.id = 'update-notification';
    updateBar.innerHTML = `
        <div class="update-content">
            <span>A new version of PythonZero is available!</span>
            <button onclick="updateApp()">Update Now</button>
            <button onclick="dismissUpdate()">Later</button>
        </div>
    `;
    updateBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--color-primary);
        color: var(--color-bg);
        padding: 12px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(updateBar);
}

/**
 * Update app with new service worker
 */
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    }
    location.reload();
}

/**
 * Dismiss update notification
 */
function dismissUpdate() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.remove();
    }
}

/* ============================================
   PWA - INSTALL PROMPT
   ============================================ */

let deferredInstallPrompt = null;

/**
 * Setup PWA install prompt
 */
function setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Store the event so it can be triggered later
        deferredInstallPrompt = e;

        // Show install button
        showInstallButton();

        console.log('PWA install prompt ready');
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed');
        deferredInstallPrompt = null;
        hideInstallButton();

        // Show success message
        showInstallSuccess();
    });
}

/**
 * Show install button in UI
 */
function showInstallButton() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
        const dismissTime = parseInt(dismissed);
        const daysSince = (Date.now() - dismissTime) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            // Don't show again for 7 days
            return;
        }
    }

    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
        <div class="install-content">
            <div class="install-message">
                <span class="install-icon">&gt;</span>
                <div class="install-text">
                    <strong>Install PythonZero</strong>
                    <span>Code offline, learn anywhere</span>
                </div>
            </div>
            <div class="install-actions">
                <button class="install-btn" onclick="installApp()">Install</button>
                <button class="dismiss-btn" onclick="dismissInstallPrompt()">×</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
        banner.classList.add('show');
    }, 1000);
}

/**
 * Hide install button
 */
function hideInstallButton() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

/**
 * Install the PWA
 */
async function installApp() {
    if (!deferredInstallPrompt) {
        return;
    }

    // Show the install prompt
    deferredInstallPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredInstallPrompt.userChoice;

    console.log(`Install prompt outcome: ${outcome}`);

    // Clear the deferred prompt
    deferredInstallPrompt = null;

    // Hide the install button
    hideInstallButton();
}

/**
 * Dismiss install prompt
 */
function dismissInstallPrompt() {
    hideInstallButton();

    // Remember dismissal
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
}

/**
 * Show install success message
 */
function showInstallSuccess() {
    const message = document.createElement('div');
    message.id = 'install-success';
    message.innerHTML = `
        <div class="success-content">
            <span style="font-size: 48px;">✓</span>
            <div>
                <strong>PythonZero Installed!</strong>
                <p>Find it on your home screen</p>
            </div>
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('show');
    }, 100);

    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 4000);
}
