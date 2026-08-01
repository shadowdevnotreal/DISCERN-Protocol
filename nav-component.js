/**
 * Shared Navigation Component — DISCERN Protocol
 *
 * Injects the protocol-appropriate nav bar into a page.
 *
 * Usage (place in <head> or before </body>):
 *
 *   <script src="nav-component.js"></script>
 *   <script>
 *   initNav({
 *     type:         'repair',       // 'repair' | 'liberate'
 *     activePage:   'progress',     // key string (see link maps below), or null
 *     showApiSetup: false,          // show the ⚙️ API Settings button (repair type only)
 *   });
 *   </script>
 */

(function() {
    var AI_COACH_URL = 'https://chatgpt.com/g/g-685f7ec1cae4819183b514fdeff27b43-discern-bot-relationship-navigation-coach';

    // Keep the shared DISCERN gradient, but give each pathway a stable visual
    // identity wherever a page uses the shared colour tokens.
    var PATHWAY_THEMES = {
        repair: {
            light: {
                primary: '#132238', secondary: '#2f6f73', tint: '#edf6f4',
                glow: 'rgba(47, 111, 115, 0.30)', border: 'rgba(47, 111, 115, 0.24)'
            },
            dark: {
                primary: '#0b1422', secondary: '#79b8b4', tint: '#173f43',
                glow: 'rgba(121, 184, 180, 0.34)', border: 'rgba(121, 184, 180, 0.34)'
            }
        },
        liberate: {
            light: {
                primary: '#4f3438', secondary: '#a45a52', tint: '#faf1ef',
                glow: 'rgba(164, 90, 82, 0.30)', border: 'rgba(164, 90, 82, 0.24)'
            },
            dark: {
                primary: '#251b22', secondary: '#df938a', tint: '#573b40',
                glow: 'rgba(223, 147, 138, 0.34)', border: 'rgba(223, 147, 138, 0.34)'
            }
        }
    };

    function applyPathwayTheme(type) {
        var pathway = PATHWAY_THEMES[type];
        if (!pathway) return;
        var mode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var colors = pathway[mode];
        var root = document.documentElement.style;
        root.setProperty('--pathway-primary', colors.primary);
        root.setProperty('--pathway-secondary', colors.secondary);
        root.setProperty('--pathway-tint', colors.tint);
        root.setProperty('--pathway-glow', colors.glow);
        root.setProperty('--accent-primary', colors.primary);
        root.setProperty('--accent-secondary', colors.secondary);
        root.setProperty('--border-color', colors.border);
        root.setProperty('--shadow-hover', colors.glow);
        root.setProperty('--bg-primary', 'linear-gradient(135deg, ' + colors.primary + ' 0%, ' + colors.secondary + ' 100%)');
    }

    var REPAIR_LINKS = [
        { key: 'home',          href: 'index.html',          emoji: '🏠', label: 'Home' },
        { key: 'repair',        href: 'repair.html',          emoji: '🔧', label: 'REPAIR Protocol' },
        { key: 'framework',     href: 'repair_visual_framework.html', emoji: '🧭', label: 'Framework' },
        { key: 'progress',      href: 'progress.html',        emoji: '📈', label: 'Progress' },
        { key: 'mediation',     href: 'mediation-mode.html',  emoji: '🤝', label: 'Mediation' },
        { key: 'sign-contract', href: 'sign-contract.html',   emoji: '✍️', label: 'Sign Contract' },
        { key: 'analysis',      href: 'enhanced-repair-system.html', emoji: '🔎', label: 'Analysis' },
        { key: 'api-guide',     href: 'api-quickstart.html',  emoji: '📚', label: 'API Guide' },
    ];

    var LIBERATE_LINKS = [
        { key: 'home',                href: 'index.html',                   emoji: '🏠', label: 'Home' },
        { key: 'liberate',            href: 'liberate.html',                emoji: '🕊️', label: 'LIBERATE' },
        { key: 'liberate-progress',   href: 'liberate-progress.html',       emoji: '📊', label: 'Progress' },
        { key: 'liberate-contract',   href: 'liberate-contract.html',       emoji: '✍️', label: 'Commitment' },
        { key: 'liberate-framework',  href: 'liberate_visual_framework.html', emoji: '🎨', label: 'Framework' },
    ];

    var DISCERN_LINKS = [
        { key: 'home',       href: 'index.html',      emoji: '', label: 'Home' },
        { key: 'assessment', href: 'assessment.html', emoji: '', label: 'Assessment' },
        { key: 'protocols',  href: 'protocol-selector.html', emoji: '', label: 'Pathway Guide' },
    ];

    var CONTEXT_KEYS = {
        repair:          ['framework', 'progress', 'mediation', 'sign-contract', 'analysis'],
        framework:       ['repair', 'progress', 'sign-contract'],
        progress:        ['repair', 'framework', 'sign-contract'],
        mediation:       ['repair', 'sign-contract', 'progress'],
        'sign-contract': ['repair', 'mediation', 'progress'],
        analysis:        ['repair', 'mediation', 'sign-contract', 'api-guide'],
        'api-guide':     ['repair', 'analysis'],
        liberate:        ['liberate-progress', 'liberate-contract', 'liberate-framework'],
        'liberate-progress':  ['liberate', 'liberate-contract', 'liberate-framework'],
        'liberate-contract':  ['liberate', 'liberate-progress'],
        'liberate-framework': ['liberate', 'liberate-progress', 'liberate-contract'],
        home:            ['assessment', 'protocols'],
        assessment:      ['protocols'],
        protocols:       ['assessment'],
    };

    var COACH_LABELS = {
        repair: 'REPAIR Coach',
        framework: 'Framework Help',
        progress: 'Progress Coach',
        mediation: 'Mediation Coach',
        'sign-contract': 'Contract Help',
        analysis: 'Analysis Help',
        'api-guide': 'API Help',
    };

    // CSS is provided by desktop-enhancements.css — no runtime injection needed.

    // ── HTML builders ─────────────────────────────────────────────────────────

    function buildLink(item, activePage) {
        var isActive = item.key === activePage;
        var tag = isActive ? 'span' : 'a';
        var hrefAttr = isActive ? '' : (' href="' + item.href + '"');
        var activeClass = isActive ? ' active' : '';
        var ariaCurrent = isActive ? ' aria-current="page"' : '';
        var icon = item.emoji ? '<span aria-hidden="true">' + item.emoji + '</span>' : '';
        return '<' + tag + hrefAttr + ariaCurrent + ' class="nav-link' + activeClass + '">'
             + icon + '<span>' + item.label + '</span>'
             + '</' + tag + '>';
    }

    function getContextLinks(type, activePage, showApiSetup) {
        var items = type === 'liberate'
            ? LIBERATE_LINKS
            : type === 'discern'
                ? DISCERN_LINKS
                : REPAIR_LINKS;
        var visibleKeys = CONTEXT_KEYS[activePage];
        var links = items.filter(function(item) {
            return item.key !== 'home' && (!visibleKeys || visibleKeys.indexOf(item.key) !== -1);
        }).map(function(item) {
            return buildLink(item, activePage);
        });

        if (type !== 'repair') return links;

        links.push(
            '<a href="' + AI_COACH_URL + '" class="nav-link ai-nav-link" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🤖</span><span>'
            + (COACH_LABELS[activePage] || 'AI Coach') + '</span></a>'
        );
        if (showApiSetup) {
            links.push(
                '<button type="button" onclick="openAPIConfig()" class="nav-link nav-api-btn"><span aria-hidden="true">⚙️</span><span>API Settings</span></button>'
            );
        }
        return links;
    }

    function buildSystemHeader(type, activePage, showApiSetup) {
        var home = activePage === 'home'
            ? '<span class="system-home nav-link active" aria-current="page">Home</span>'
            : '<a class="system-home nav-link" href="index.html">Home</a>';
        var contextLinks = getContextLinks(type, activePage, showApiSetup);
        var contextNav = contextLinks.length
            ? '<div class="system-context-nav" aria-label="Section navigation">' + contextLinks.join('') + '</div>'
            : '';

        return '<nav id="system-header" class="system-header" aria-label="Primary navigation">'
             + '  <div class="system-header-row">'
             +        home
             + '    <a class="system-brand" href="index.html" aria-label="DISCERN home">DISCERN</a>'
             + '    <button id="system-theme-toggle" class="theme-toggle system-theme-toggle" type="button" onclick="toggleTheme()" aria-label="Switch to dark mode" aria-pressed="false">'
             + '      <span class="system-theme-icon" aria-hidden="true">☀</span>'
             + '      <span id="theme-text">Dark</span>'
             + '      <span class="system-theme-icon" aria-hidden="true">☾</span>'
             + '    </button>'
             + '  </div>'
             +    contextNav
             + '</nav>';
    }

    // ── Public API ────────────────────────────────────────────────────────────

    window.initNav = function(config) {
        var cfg = Object.assign({
            type:         'repair',
            activePage:   null,
            showApiSetup: false,
        }, config);

        // Remove page-local legacy controls so every screen uses one header.
        document.querySelectorAll('.theme-toggle').forEach(function(toggle) {
            toggle.remove();
        });
        var existingHeader = document.getElementById('system-header');
        if (existingHeader) existingHeader.remove();

        document.body.insertAdjacentHTML(
            'afterbegin',
            buildSystemHeader(cfg.type, cfg.activePage, cfg.showApiSetup)
        );
        document.documentElement.setAttribute('data-discern-section', cfg.type);
        applyPathwayTheme(cfg.type);
        document.addEventListener('discern-theme-change', function() {
            applyPathwayTheme(cfg.type);
        });

        // Full-bleed header even on legacy pages that put padding on <body>.
        var systemHeader = document.getElementById('system-header');
        if (systemHeader && window.getComputedStyle) {
            var bodyStyles = window.getComputedStyle(document.body);
            var bodyPaddingTop = bodyStyles.paddingTop;
            systemHeader.style.marginTop = 'calc(-1 * ' + bodyPaddingTop + ')';
            systemHeader.style.marginLeft = 'calc(-1 * ' + bodyStyles.paddingLeft + ')';
            systemHeader.style.marginRight = 'calc(-1 * ' + bodyStyles.paddingRight + ')';
        }

        if (window.themeSystem && typeof window.themeSystem.initializeTheme === 'function') {
            window.themeSystem.initializeTheme();
        }
    };
}());
