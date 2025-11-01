/* ============================================
   PYTHON ZERO - LESSONS SYSTEM
   Lesson Navigation and Loading
   ============================================ */

// Current lesson state
let currentLesson = null;
let currentTrack = null;

// Lesson registry (tracks and their lessons)
const lessonRegistry = {
    beginner: [
        { id: '01-variables', title: 'Variables & Data Types' },
        { id: '02-print', title: 'Print & Input' },
        { id: '03-math', title: 'Basic Math Operations' }
    ],
    intermediate: [],
    advanced: [],
    'ai-tools': []
};

/**
 * Initialize lessons system
 */
function initLessons() {
    setupTrackNavigation();
    loadLessonFromURL();
    console.log('Lessons system initialized');
}

/**
 * Setup track navigation click handlers
 */
function setupTrackNavigation() {
    const tracks = document.querySelectorAll('.track');
    tracks.forEach(track => {
        track.addEventListener('click', (e) => {
            const trackName = e.currentTarget.dataset.track;
            toggleTrackLessons(trackName);
        });
    });
}

/**
 * Toggle lesson list for a track
 */
function toggleTrackLessons(trackName) {
    const lessonsList = document.getElementById('lessons-list');
    const lessons = lessonRegistry[trackName];

    if (!lessons || lessons.length === 0) {
        alert(`${trackName} track lessons coming soon in Phase 3-5!`);
        return;
    }

    // If clicking the same track, toggle visibility
    if (currentTrack === trackName && lessonsList.style.display === 'block') {
        lessonsList.style.display = 'none';
        currentTrack = null;
        return;
    }

    // Show lessons for this track
    currentTrack = trackName;
    lessonsList.innerHTML = '';
    lessonsList.style.display = 'block';

    // Add back button
    const backButton = document.createElement('div');
    backButton.className = 'lesson-back';
    backButton.innerHTML = '← Back to tracks';
    backButton.addEventListener('click', () => {
        lessonsList.style.display = 'none';
        currentTrack = null;
    });
    lessonsList.appendChild(backButton);

    // Add lessons
    lessons.forEach((lesson, index) => {
        const lessonItem = document.createElement('div');
        lessonItem.className = 'lesson-item';
        lessonItem.dataset.track = trackName;
        lessonItem.dataset.lessonId = lesson.id;

        if (currentLesson && currentLesson.id === lesson.id) {
            lessonItem.classList.add('active');
        }

        lessonItem.innerHTML = `
            <span class="lesson-number">${String(index + 1).padStart(2, '0')}</span>
            <span class="lesson-title">${escapeHtml(lesson.title)}</span>
        `;

        lessonItem.addEventListener('click', () => {
            loadLesson(trackName, lesson.id);
        });

        lessonsList.appendChild(lessonItem);
    });
}

/**
 * Load a lesson
 */
async function loadLesson(track, lessonId) {
    try {
        const response = await fetch(`/lessons/${track}/${lessonId}.json`);

        if (!response.ok) {
            throw new Error(`Lesson not found: ${track}/${lessonId}`);
        }

        const lesson = await response.json();
        currentLesson = lesson;

        // Update URL
        window.location.hash = `${track}/${lessonId}`;

        // Render lesson
        renderLesson(lesson);

        // Update active state in navigation
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-lesson-id="${lessonId}"]`)?.classList.add('active');

        // Close mobile navigation
        closeAllPanels();

    } catch (error) {
        console.error('Error loading lesson:', error);
        alert('Error loading lesson. Please try again.');
    }
}

/**
 * Render lesson content
 */
function renderLesson(lesson) {
    // Create lesson viewer if it doesn't exist
    let lessonViewer = document.getElementById('lesson-viewer');

    if (!lessonViewer) {
        lessonViewer = document.createElement('div');
        lessonViewer.id = 'lesson-viewer';
        lessonViewer.className = 'lesson-viewer';

        const editorSection = document.getElementById('editor-section');
        const panelContent = editorSection.querySelector('.panel-content');
        editorSection.insertBefore(lessonViewer, panelContent);
    }

    // Build lesson HTML
    let html = `
        <div class="lesson-header">
            <button id="close-lesson" class="btn btn-small">✕ Close Lesson</button>
            <div class="lesson-meta">
                <h2 class="lesson-title">${escapeHtml(lesson.title)}</h2>
                <p class="lesson-description">${escapeHtml(lesson.description)}</p>
                <div class="lesson-info">
                    <span class="lesson-difficulty">${escapeHtml(lesson.difficulty)}</span>
                    <span class="lesson-time">⏱ ${escapeHtml(lesson.estimatedTime)}</span>
                </div>
            </div>
        </div>
        <div class="lesson-content">
    `;

    // Render content blocks
    lesson.content.forEach((block, index) => {
        html += renderContentBlock(block, index);
    });

    html += `</div>`;

    // Add navigation buttons
    html += `
        <div class="lesson-footer">
            ${lesson.prevLesson ? `<button class="btn btn-secondary" onclick="loadLesson('${lesson.track}', '${lesson.prevLesson}')">← Previous</button>` : '<span></span>'}
            ${lesson.nextLesson ? `<button class="btn btn-primary" onclick="loadLesson('${lesson.track}', '${lesson.nextLesson}')">Next →</button>` : '<span></span>'}
        </div>
    `;

    lessonViewer.innerHTML = html;
    lessonViewer.style.display = 'block';

    // Setup close button
    document.getElementById('close-lesson').addEventListener('click', () => {
        lessonViewer.style.display = 'none';
    });

    // Scroll to top
    lessonViewer.scrollTop = 0;
}

/**
 * Render a content block
 */
function renderContentBlock(block, index) {
    switch (block.type) {
        case 'text':
            return `<p class="content-text">${escapeHtml(block.text)}</p>`;

        case 'code':
            return `
                <div class="content-code">
                    <pre><code>${escapeHtml(block.code)}</code></pre>
                    ${block.explanation ? `<p class="code-explanation">${escapeHtml(block.explanation)}</p>` : ''}
                    <button class="btn btn-small try-it-btn" data-code="${escapeHtml(block.code)}">Try It</button>
                </div>
            `;

        case 'tip':
            return `
                <div class="content-tip">
                    <strong>💡 TIP:</strong> ${escapeHtml(block.text)}
                </div>
            `;

        case 'exercise':
            return `
                <div class="content-exercise">
                    <h4>✏️ Exercise:</h4>
                    <p>${escapeHtml(block.prompt)}</p>
                    <button class="btn btn-primary try-it-btn" data-code="${escapeHtml(block.starter)}">Try It</button>
                    <button class="btn btn-secondary show-solution-btn" data-solution="${escapeHtml(block.solution)}" data-hint="${escapeHtml(block.hint || '')}">Show Solution</button>
                </div>
            `;

        default:
            return '';
    }
}

/**
 * Escape HTML for safe insertion
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Setup lesson interaction buttons
 */
function setupLessonButtons() {
    document.addEventListener('click', (e) => {
        // Try It button
        if (e.target.classList.contains('try-it-btn')) {
            const code = e.target.dataset.code;
            const decodedCode = decodeHtmlEntities(code);
            setCode(decodedCode);
            editor.focus();
        }

        // Show Solution button
        if (e.target.classList.contains('show-solution-btn')) {
            const solution = e.target.dataset.solution;
            const hint = e.target.dataset.hint;
            const decodedSolution = decodeHtmlEntities(solution);
            const decodedHint = decodeHtmlEntities(hint);

            if (hint && hint !== '') {
                const showSolution = confirm(`Hint: ${decodedHint}\n\nDo you still want to see the solution?`);
                if (!showSolution) return;
            }

            setCode(decodedSolution);
            editor.focus();
        }
    });
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Load lesson from URL hash
 */
function loadLessonFromURL() {
    const hash = window.location.hash.slice(1); // Remove #

    if (hash) {
        const [track, lessonId] = hash.split('/');
        if (track && lessonId) {
            loadLesson(track, lessonId);
            toggleTrackLessons(track);
        }
    }
}

// Handle browser back/forward
window.addEventListener('hashchange', loadLessonFromURL);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initLessons();
        setupLessonButtons();
    });
} else {
    initLessons();
    setupLessonButtons();
}
