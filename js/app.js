/* ============================================
   PYTHON ZERO - MAIN APP
   UI Interactions and Event Handlers
   ============================================ */

/**
 * Initialize app
 */
function initApp() {
    setupEventListeners();
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
