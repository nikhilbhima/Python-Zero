/* ============================================
   PYTHON ZERO - CODE EDITOR
   CodeMirror Setup and Configuration
   ============================================ */

// Global editor instance
let editor;

/**
 * Initialize CodeMirror editor
 */
function initEditor() {
    const textarea = document.getElementById('code-editor');

    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        tabSize: 4,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        smartIndent: true,
        electricChars: true,
        extraKeys: {
            'Ctrl-Enter': runCode,
            'Cmd-Enter': runCode, // For Mac
            'Tab': betterTab,
            'Shift-Tab': (cm) => cm.execCommand('indentLess')
        }
    });

    // Set initial height
    editor.setSize(null, '100%');

    // Focus editor on load
    setTimeout(() => {
        editor.refresh();
        editor.focus();
    }, 100);
}

/**
 * Better tab handling for indentation
 */
function betterTab(cm) {
    if (cm.somethingSelected()) {
        cm.indentSelection('add');
    } else {
        cm.replaceSelection('    ', 'end');
    }
}

/**
 * Get code from editor
 */
function getCode() {
    return editor.getValue();
}

/**
 * Set code in editor
 */
function setCode(code) {
    editor.setValue(code);
}

/**
 * Clear editor
 */
function clearEditor() {
    editor.setValue('# Your code here\n');
    editor.focus();
}

/**
 * Insert code at cursor
 */
function insertCode(code) {
    const cursor = editor.getCursor();
    editor.replaceRange(code, cursor);
    editor.focus();
}

/**
 * Get current line number
 */
function getCurrentLine() {
    return editor.getCursor().line + 1; // 1-indexed
}

// Initialize editor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditor);
} else {
    initEditor();
}
