/* ============================================
   PYTHON ZERO - ERROR HELP SYSTEM
   Beginner-Friendly Error Explanations
   ============================================ */

// Error explanations database
const errorExplanations = {
    'SyntaxError': {
        title: 'Syntax Error',
        explanation: 'Python doesn\'t understand your code. You have a typo or mistake in how you wrote it.',
        commonCauses: [
            'Missing colon (:) at the end of if, for, while, or def statements',
            'Mismatched quotes (mixing \' and ")',
            'Missing parentheses or brackets',
            'Wrong indentation (spaces vs tabs)',
            'Typo in a keyword (like "pritn" instead of "print")'
        ],
        example: `# Wrong:
if x > 5
    print('Big')

# Right:
if x > 5:
    print('Big')`
    },

    'NameError': {
        title: 'Name Error',
        explanation: 'You\'re trying to use a variable or function that doesn\'t exist yet.',
        commonCauses: [
            'Using a variable before defining it',
            'Typo in variable name (Python is case-sensitive)',
            'Forgetting to put quotes around strings',
            'Variable is defined inside a function but used outside'
        ],
        example: `# Wrong:
print(name)  # name doesn't exist yet

# Right:
name = "Alice"
print(name)`
    },

    'TypeError': {
        title: 'Type Error',
        explanation: 'You\'re trying to do something with the wrong type of data.',
        commonCauses: [
            'Adding a number and a string together',
            'Using wrong number of arguments in a function',
            'Trying to use a method that doesn\'t exist for that type',
            'Calling something that isn\'t a function'
        ],
        example: `# Wrong:
age = 25
print("I am " + age)  # Can't add string and number

# Right:
age = 25
print("I am " + str(age))  # Convert to string
# OR
print(f"I am {age}")  # Use f-string`
    },

    'IndentationError': {
        title: 'Indentation Error',
        explanation: 'Your code indentation (spacing) is wrong. Python uses indentation to group code together.',
        commonCauses: [
            'Mixing tabs and spaces (use only spaces)',
            'Not indenting after if, for, while, def',
            'Inconsistent number of spaces (should be 4)',
            'Extra indentation where not needed'
        ],
        example: `# Wrong:
if x > 5:
print('Big')  # Not indented

# Right:
if x > 5:
    print('Big')  # Indented with 4 spaces`
    },

    'IndexError': {
        title: 'Index Error',
        explanation: 'You\'re trying to access a position in a list that doesn\'t exist.',
        commonCauses: [
            'Using an index that\'s too large for the list',
            'Trying to access an empty list',
            'Forgetting that lists start at index 0',
            'Using a negative index that\'s too large'
        ],
        example: `# Wrong:
fruits = ['apple', 'banana']
print(fruits[2])  # Only 0 and 1 exist

# Right:
fruits = ['apple', 'banana']
print(fruits[0])  # First item
print(fruits[1])  # Second item`
    },

    'KeyError': {
        title: 'Key Error',
        explanation: 'You\'re trying to access a dictionary key that doesn\'t exist.',
        commonCauses: [
            'Using a key that was never added to the dictionary',
            'Typo in the key name',
            'Using wrong type for the key (number vs string)'
        ],
        example: `# Wrong:
person = {'name': 'Alice', 'age': 25}
print(person['city'])  # 'city' key doesn't exist

# Right:
person = {'name': 'Alice', 'age': 25}
print(person.get('city', 'Unknown'))  # Safely get with default`
    },

    'ValueError': {
        title: 'Value Error',
        explanation: 'The value you\'re using is the right type, but not valid for this operation.',
        commonCauses: [
            'Converting invalid text to a number (like "hello" to int)',
            'Searching for an item that\'s not in a list',
            'Invalid format in string formatting'
        ],
        example: `# Wrong:
age = int("hello")  # Can't convert "hello" to number

# Right:
age_text = "25"
age = int(age_text)  # This works`
    },

    'AttributeError': {
        title: 'Attribute Error',
        explanation: 'You\'re trying to use a method or property that doesn\'t exist for this type of data.',
        commonCauses: [
            'Typo in method name',
            'Using a list method on a string (or vice versa)',
            'Variable is None instead of the expected type'
        ],
        example: `# Wrong:
text = "hello"
text.append('!')  # .append() is for lists, not strings

# Right:
text = "hello"
text = text + '!'  # Concatenate strings`
    },

    'ZeroDivisionError': {
        title: 'Zero Division Error',
        explanation: 'You\'re trying to divide a number by zero, which is mathematically impossible.',
        commonCauses: [
            'Dividing by a variable that equals 0',
            'Not checking if divisor is 0 before dividing'
        ],
        example: `# Wrong:
result = 10 / 0

# Right:
divisor = 0
if divisor != 0:
    result = 10 / divisor
else:
    print("Cannot divide by zero")`
    },

    'ImportError': {
        title: 'Import Error',
        explanation: 'Python can\'t find the module you\'re trying to import.',
        commonCauses: [
            'Typo in module name',
            'Module not available in browser (Skulpt limitation)',
            'Module not installed (in real Python)'
        ],
        example: `# Note: In the browser, only basic Python modules work
# Some modules like 'requests' won't work here

# Available modules:
import random
import math
import time`
    }
};

/**
 * Explain an error in the help panel
 */
function explainError(errorType, errorMessage, traceback) {
    const helpContent = document.getElementById('help-content');
    const explanation = errorExplanations[errorType];

    if (!explanation) {
        // Generic error explanation
        helpContent.innerHTML = `
            <h3>❌ ${errorType}</h3>
            <p>${errorMessage}</p>
            <div class="tip">
                <strong>TIP:</strong> Read the error message carefully.
                It often tells you exactly what's wrong and which line has the problem.
            </div>
        `;
        return;
    }

    // Build detailed explanation
    let html = `
        <h3>❌ ${explanation.title}</h3>
        <p><strong>What happened:</strong></p>
        <p>${explanation.explanation}</p>

        <h4>Common Causes:</h4>
        <ul>
            ${explanation.commonCauses.map(cause => `<li>${cause}</li>`).join('')}
        </ul>

        <h4>Example:</h4>
        <pre style="background-color: rgba(10, 255, 10, 0.05); padding: 12px; border: 1px solid var(--color-primary-dim); margin-top: 8px; overflow-x: auto;"><code>${explanation.example}</code></pre>

        <div class="tip">
            <strong>TIP:</strong> Try to understand what went wrong before asking for help.
            Reading error messages is an important skill for programmers!
        </div>
    `;

    helpContent.innerHTML = html;

    // Ensure help panel is visible on mobile
    const helpPanel = document.getElementById('help-panel');
    if (window.innerWidth <= 768) {
        helpPanel.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

/**
 * Reset help panel to default content
 */
function resetHelp() {
    const helpContent = document.getElementById('help-content');
    helpContent.innerHTML = `
        <h3>Welcome to PythonZero!</h3>
        <p>Your browser-based Python learning platform.</p>

        <h4>Quick Start:</h4>
        <ul>
            <li>Write Python code in the editor</li>
            <li>Press <strong>RUN</strong> or <strong>Ctrl+Enter</strong> to execute</li>
            <li>See output and errors below</li>
            <li>Choose lessons from the navigation panel</li>
        </ul>

        <h4>Keyboard Shortcuts:</h4>
        <ul>
            <li><strong>Ctrl+Enter</strong> - Run code</li>
            <li><strong>Ctrl+Space</strong> - Autocomplete</li>
            <li><strong>Tab</strong> - Indent</li>
        </ul>

        <div class="tip">
            <strong>TIP:</strong> Python uses indentation (4 spaces) to define code blocks. Be careful with your spacing!
        </div>
    `;
}
