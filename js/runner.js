/* ============================================
   PYTHON ZERO - PYTHON RUNNER
   Skulpt Configuration and Code Execution
   ============================================ */

// Output element
let outputElement;
let statusElement;
let errorCountElement;

// Error tracking
let errorCount = 0;

/**
 * Initialize Skulpt and output elements
 */
function initRunner() {
    outputElement = document.getElementById('output');
    statusElement = document.getElementById('status');
    errorCountElement = document.getElementById('error-count');

    // Configure Skulpt
    Sk.configure({
        output: outputToScreen,
        read: builtinRead,
        __future__: Sk.python3
    });
}

/**
 * Output function for Skulpt
 */
function outputToScreen(text) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.textContent = text;
    outputElement.appendChild(line);

    // Auto-scroll to bottom
    outputElement.scrollTop = outputElement.scrollHeight;
}

/**
 * Built-in read function for Skulpt (for imports)
 */
function builtinRead(filename) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
        throw new Error(`File not found: '${filename}'`);
    }
    return Sk.builtinFiles["files"][filename];
}

/**
 * Run Python code
 */
async function runCode() {
    // Clear previous output
    clearOutput();

    // Get code from editor
    const code = getCode();

    if (!code.trim()) {
        outputError('No code to run. Write some Python code first!');
        return;
    }

    // Update status
    updateStatus('RUNNING', 'running');

    try {
        // Run the code with Skulpt
        await Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        });

        // Success
        updateStatus('SUCCESS', 'success');
        errorCount = 0;
        updateErrorCount();
    } catch (error) {
        // Error occurred
        handlePythonError(error);
        updateStatus('ERROR', 'error');
        errorCount++;
        updateErrorCount();
    }
}

/**
 * Handle Python execution errors
 */
function handlePythonError(error) {
    console.error('Python Error:', error);

    // Extract error information
    const errorType = error.tp$name || 'Error';
    const errorMessage = error.toString();
    const traceback = error.traceback || [];

    // Display error in output
    outputError(`${errorType}: ${errorMessage}`);

    // Show helpful explanation in help panel
    explainError(errorType, errorMessage, traceback);
}

/**
 * Output error message
 */
function outputError(message) {
    const errorLine = document.createElement('div');
    errorLine.className = 'output-line output-error';
    errorLine.textContent = `❌ ${message}`;
    outputElement.appendChild(errorLine);
    outputElement.scrollTop = outputElement.scrollHeight;
}

/**
 * Clear output
 */
function clearOutput() {
    outputElement.innerHTML = '';
    updateStatus('IDLE', 'idle');
}

/**
 * Update status display
 */
function updateStatus(text, type) {
    statusElement.textContent = `STATUS: ${text}`;
    statusElement.className = '';

    if (type === 'running') {
        statusElement.classList.add('text-warning');
    } else if (type === 'error') {
        statusElement.classList.add('text-error');
    } else if (type === 'success') {
        statusElement.classList.add('text-success');
    }
}

/**
 * Update error count
 */
function updateErrorCount() {
    errorCountElement.textContent = `ERRORS: ${errorCount}`;

    if (errorCount > 0) {
        errorCountElement.classList.add('text-error');
    } else {
        errorCountElement.classList.remove('text-error');
    }
}

// Initialize runner when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRunner);
} else {
    initRunner();
}
