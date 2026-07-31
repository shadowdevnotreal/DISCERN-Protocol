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
 *     activePage:   'progress',     // key string (see REPAIR_LINKS / LIBERATE_LINKS), or null
 *     showApiSetup: false,          // show the ⚙️ API Settings button (repair type only)
 *   });
 *   </script>
 */

(function() {
    var AI_COACH_URL = 'https://chatgpt.com/g/g-685f7ec1cae4819183b514fdeff27b43-discern-bot-relationship-navigation-coach';

    var REPAIR_LINKS = [
        { key: 'home',          href: 'index.html',          emoji: '🏠', label: 'Home' },
        { key: 'repair',        href: 'repair.html',          emoji: '🔧', label: 'REPAIR Protocol' },
        { key: 'about',         href: 'about.html',           emoji: '📊', label: 'Visual Framework' },
        { key: 'progress',      href: 'progress.html',        emoji: '📈', label: 'Progress' },
        { key: 'mediation',     href: 'mediation-mode.html',  emoji: '🤝', label: 'Mediation' },
        { key: 'sign-contract', href: 'sign-contract.html',   emoji: '✍️', label: 'Sign Contract' },
        { key: 'api-guide',     href: 'api-quickstart.html',  emoji: '📚', label: 'API Guide' },
    ];

    var LIBERATE_LINKS = [
        { key: 'home',                href: 'index.html',                   emoji: '🏠', label: 'Home' },
        { key: 'liberate',            href: 'liberate.html',                emoji: '🕊️', label: 'LIBERATE' },
        { key: 'liberate-progress',   href: 'liberate-progress.html',       emoji: '📊', label: 'Progress' },
        { key: 'liberate-framework',  href: 'liberate_visual_framework.html', emoji: '🎨', label: 'Framework' },
    ];

    // ── CSS ───────────────────────────────────────────────────────────────────

    var NAV_CSS = [
        'nav {',
        '    background: var(--bg-glass);',
        '    backdrop-filter: var(--backdrop-blur);',
        '    padding: 15px;',
        '    box-shadow: 0 2px 10px var(--shadow-color);',
        '    position: sticky;',
        '    top: 0;',
        '    z-index: 100;',
        '    border-bottom: 1px solid var(--border-color);',
        '}',
        '.nav-container {',
        '    max-width: 1400px;',
        '    margin: 0 auto;',
        '    display: flex;',
        '    justify-content: center;',
        '    align-items: center;',
        '    gap: 30px;',
        '    flex-wrap: wrap;',
        '}',
        '.nav-link {',
        '    text-decoration: none;',
        '    color: var(--text-secondary);',
        '    font-weight: 600;',
        '    padding: 8px 16px;',
        '    border-radius: 8px;',
        '    transition: all 0.3s ease;',
        '    display: inline-flex;',
        '    align-items: center;',
        '    gap: 6px;',
        '}',
        '.nav-link:hover {',
        '    background: var(--bg-glass-hover);',
        '    color: var(--text-hover);',
        '}',
        '.nav-link.active {',
        '    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
        '    color: white;',
        '    cursor: default;',
        '}',
        '.nav-link.active:hover {',
        '    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
        '    color: white;',
        '}',
        '.ai-nav-link {',
        '    background: linear-gradient(135deg, #10b981 0%, #059669 100%);',
        '    color: white;',
        '    padding: 10px 20px;',
        '    font-weight: 700;',
        '    box-shadow: 0 2px 10px rgba(16,185,129,0.3);',
        '}',
        '.ai-nav-link:hover {',
        '    background: linear-gradient(135deg, #059669 0%, #047857 100%);',
        '    color: white;',
        '    transform: translateY(-1px);',
        '    box-shadow: 0 4px 15px rgba(16,185,129,0.4);',
        '}',
        '.nav-api-btn {',
        '    background: none;',
        '    border: none;',
        '    cursor: pointer;',
        '    font-family: inherit;',
        '    font-size: inherit;',
        '}',
    ].join('\n');

    // ── HTML builders ─────────────────────────────────────────────────────────

    function buildLink(item, activePage) {
        var isActive = item.key === activePage;
        var tag = isActive ? 'span' : 'a';
        var hrefAttr = isActive ? '' : (' href="' + item.href + '"');
        var activeClass = isActive ? ' active' : '';
        return '<' + tag + hrefAttr + ' class="nav-link' + activeClass + '">'
             + item.emoji + ' ' + item.label
             + '</' + tag + '>';
    }

    function buildRepairNav(activePage, showApiSetup) {
        var links = REPAIR_LINKS.map(function(item) {
            return '        ' + buildLink(item, activePage);
        });
        links.push(
            '        <a href="' + AI_COACH_URL + '" class="nav-link ai-nav-link" target="_blank" rel="noopener noreferrer">🤖 AI Coach</a>'
        );
        if (showApiSetup) {
            links.push(
                '        <button onclick="openAPIConfig()" class="nav-link nav-api-btn">⚙️ API Settings</button>'
            );
        }
        return '<nav>\n    <div class="nav-container">\n' + links.join('\n') + '\n    </div>\n</nav>';
    }

    function buildLiberateNav(activePage) {
        var links = LIBERATE_LINKS.map(function(item) {
            return '        ' + buildLink(item, activePage);
        });
        return '<nav>\n    <div class="nav-container">\n' + links.join('\n') + '\n    </div>\n</nav>';
    }

    // ── Public API ────────────────────────────────────────────────────────────

    window.initNav = function(config) {
        var cfg = Object.assign({
            type:         'repair',
            activePage:   null,
            showApiSetup: false,
        }, config);

        // Inject CSS once
        if (!document.getElementById('nav-component-style')) {
            var styleEl = document.createElement('style');
            styleEl.id = 'nav-component-style';
            styleEl.textContent = NAV_CSS;
            document.head.appendChild(styleEl);
        }

        // Build and inject nav HTML
        var navHtml = cfg.type === 'liberate'
            ? buildLiberateNav(cfg.activePage)
            : buildRepairNav(cfg.activePage, cfg.showApiSetup);

        document.body.insertAdjacentHTML('afterbegin', navHtml);
    };
}());
