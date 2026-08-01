/**
 * Universal Theme System for REPAIR Protocol
 * Provides light/dark mode with glassmorphism effects
 */

// Theme management functions
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    document.dispatchEvent(new CustomEvent('discern-theme-change', {
        detail: { theme: newTheme }
    }));

    // Update theme toggle button if it exists
    const themeText = document.getElementById('theme-text');
    const themeToggle = document.getElementById('system-theme-toggle');

    if (themeText) themeText.textContent = newTheme === 'dark' ? 'Light' : 'Dark';
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Store preference
    localStorage.setItem('theme', newTheme);

    // Apply theme-aware inline style fixes after theme change
    setTimeout(() => {
        applyThemeInlineStyles();
    }, 50);
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.dispatchEvent(new CustomEvent('discern-theme-change', {
        detail: { theme: savedTheme }
    }));

    const themeText = document.getElementById('theme-text');
    const themeToggle = document.getElementById('system-theme-toggle');

    if (themeText) themeText.textContent = savedTheme === 'dark' ? 'Light' : 'Dark';
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', savedTheme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', savedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Apply theme-aware inline style fixes
    setTimeout(() => {
        applyThemeInlineStyles();
    }, 100);
}

// Apply theme-aware inline styles to override hardcoded colors
function applyThemeInlineStyles() {
    // Page and component styles own their colors. Theme-aware elements opt in
    // through the scoped utility classes below; never rewrite every inline style.
}

// Inject theme toggle button into navigation if not present
function injectThemeToggle() {
    if (document.getElementById('system-header')) return;

    // Check if any theme toggle already exists (navigation buttons or fixed toggle)
    if (document.querySelector('.theme-toggle') ||
        document.querySelector('#theme-icon') ||
        document.querySelector('[onclick*="toggleTheme"]')) {
        return; // Don't inject if there's already a theme toggle
    }

    // Create theme toggle element only if no other toggle exists
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.onclick = toggleTheme;
    themeToggle.innerHTML = `
        <span class="theme-icon" id="theme-icon">🌙</span>
        <span id="theme-text">Dark Mode</span>
    `;

    // Add to the page (try different positions)
    const nav = document.querySelector('nav');
    const header = document.querySelector('.header');
    const body = document.body;

    if (nav) {
        nav.appendChild(themeToggle);
    } else if (header) {
        header.appendChild(themeToggle);
    } else {
        body.appendChild(themeToggle);
    }
}

// Make theme system globally available
window.themeSystem = {
    toggleTheme: toggleTheme,
    initializeTheme: initializeTheme,
    injectThemeToggle: injectThemeToggle,
    applyThemeInlineStyles: applyThemeInlineStyles
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    if (!document.getElementById('system-header')) injectThemeToggle();
});

// CSS for theme system - inject into page
const themeCSS = `
:root {
    /* Light Theme Variables */
    --bg-primary: linear-gradient(135deg, #132238 0%, #2f6f73 100%);
    --bg-secondary: rgba(255, 253, 249, 0.98);
    --bg-glass: rgba(255, 253, 249, 0.78);
    --bg-glass-hover: rgba(255, 255, 255, 0.94);
    --card-bg: rgba(255, 253, 249, 0.96);
    --card-shadow: 0 18px 48px rgba(19, 34, 56, 0.13);
    --text-primary: #132238;
    --text-secondary: #3f4e5f;
    --text-tertiary: #657181;
    --text-on-glass: #132238;
    --text-hover: #2f6f73;
    --border-color: rgba(47, 111, 115, 0.24);
    --shadow-color: rgba(19, 34, 56, 0.13);
    --shadow-hover: rgba(47, 111, 115, 0.28);
    --backdrop-blur: blur(20px);
    --accent-primary: #5b4b8a;
    --accent-secondary: #2f6f73;
    --repair-color: #2f6f73;
    --liberate-color: #a45a52;
    --positive-color: #3e7c59;
    --caution-color: #b7791f;
}

[data-theme="dark"] {
    /* Dark Theme Variables - WCAG AA+ Compliant */
    --bg-primary: linear-gradient(135deg, #0b1422 0%, #173f43 100%);
    --bg-secondary: rgba(15, 27, 42, 0.98);
    --bg-glass: rgba(27, 43, 57, 0.88);
    --bg-glass-hover: rgba(37, 55, 70, 0.96);
    --card-bg: rgba(24, 39, 54, 0.96);
    --card-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    /* High contrast text colors for maximum readability */
    --text-primary: #ffffff;
    --text-secondary: #f1f5f9;
    --text-tertiary: #e2e8f0;
    --text-on-glass: #ffffff;
    --text-hover: #9ad1cd;
    --border-color: rgba(203, 213, 225, 0.3);
    --shadow-color: rgba(0, 0, 0, 0.4);
    --shadow-hover: rgba(93, 169, 165, 0.36);
    --backdrop-blur: blur(20px);
    --accent-primary: #b9a9e8;
    --accent-secondary: #79b8b4;
    --repair-color: #79b8b4;
    --liberate-color: #df938a;
    --positive-color: #78b890;
    --caution-color: #e1b55c;
}

/* Theme Toggle Button */
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--bg-glass);
    backdrop-filter: var(--backdrop-blur);
    border: 1px solid var(--border-color);
    border-radius: 50px;
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px var(--shadow-color);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 0.9rem;
}

.theme-toggle:hover {
    background: var(--bg-glass-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow-hover);
}

.theme-icon {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
}

.theme-toggle:hover .theme-icon {
    transform: scale(1.1);
}

/* Glassmorphism effects for common elements */
.glass-effect {
    background: var(--bg-glass);
    backdrop-filter: var(--backdrop-blur);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px var(--shadow-color);
}

.glass-effect:hover {
    background: var(--bg-glass-hover);
    box-shadow: 0 8px 25px var(--shadow-hover);
}

/* Apply theme-aware colors */
.theme-text-primary { color: var(--text-primary); }
.theme-text-secondary { color: var(--text-secondary); }
.theme-text-tertiary { color: var(--text-tertiary); }
.theme-bg-primary { background: var(--bg-primary); }
.theme-bg-secondary { background: var(--bg-secondary); }
.theme-bg-glass { background: var(--bg-glass); }

/* Ensure smooth transitions */
* {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Override hardcoded colors for theme compatibility */
.nav-link:hover {
    color: var(--text-hover) !important;
}

.nav-link {
    color: var(--text-secondary) !important;
}

.nav-link.active {
    color: white !important;
}

.ai-nav-link {
    color: white !important;
}

/* Button text overrides */
button {
    color: var(--text-on-glass);
}

button:hover {
    color: var(--text-hover);
}

/* Glass effect text */
.glass-effect {
    color: var(--text-on-glass);
}

/* Navigation container text */
.nav-container {
    color: var(--text-secondary);
}

/* Links */
a {
    color: var(--text-hover);
}

a:hover {
    color: var(--accent-primary);
}

/* Tab navigation text */
.tab, .api-config-tab {
    color: var(--text-secondary) !important;
}

.tab.active, .api-config-tab.active {
    color: var(--text-primary) !important;
}

/* Code blocks and pre elements */
code, pre {
    color: var(--text-primary) !important;
    background: var(--bg-glass) !important;
}

/* Status and info text */
.status, .info, .note {
    color: var(--text-secondary) !important;
}

/* Fix specific navigation button styles */
nav button {
    color: var(--text-on-glass) !important;
}

nav button:hover {
    color: var(--text-hover) !important;
}

/* Ensure theme toggle buttons are visible */
#theme-toggle, [onclick*="toggleTheme"] {
    color: white !important;
    background: var(--accent-primary) !important;
}

#theme-toggle:hover, [onclick*="toggleTheme"]:hover {
    background: var(--accent-secondary) !important;
    color: white !important;
}

/* Override inline navigation styles */
nav [style*="color"] {
    color: var(--text-secondary) !important;
}

nav a[style*="color"] {
    color: var(--text-secondary) !important;
}

nav a[style*="color"]:hover {
    color: var(--text-hover) !important;
}

/* Navigation links accessibility */
.nav-link {
    color: var(--text-secondary) !important;
    background: transparent !important;
}

.nav-link:hover {
    color: var(--text-hover) !important;
    background: var(--bg-glass-hover) !important;
}

.nav-link.active {
    color: white !important;
    background: var(--accent-primary) !important;
}

/* Navigation specific dark mode fixes */
[data-theme="dark"] .nav-link {
    color: var(--text-secondary) !important;
}

[data-theme="dark"] .nav-link:hover {
    color: var(--text-hover) !important;
}

/* Button text fixes for dark mode */
[data-theme="dark"] button,
[data-theme="dark"] .btn {
    color: white !important;
}

[data-theme="dark"] .btn-secondary {
    color: var(--text-primary) !important;
}

/* Form elements in dark mode */
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
    background: var(--bg-glass) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
}

[data-theme="dark"] input::placeholder,
[data-theme="dark"] textarea::placeholder {
    color: var(--text-tertiary) !important;
}

/* Ensure readable text on all backgrounds */
[data-theme="dark"] .header,
[data-theme="dark"] .framework-container .header {
    color: white !important;
}

[data-theme="dark"] .disclaimer,
[data-theme="dark"] .disclaimer-text {
    color: var(--text-secondary) !important;
}
`;

// Inject CSS into the page
const style = document.createElement('style');
style.textContent = themeCSS;
document.head.appendChild(style);
