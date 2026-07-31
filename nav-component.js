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

    // CSS is provided by desktop-enhancements.css — no runtime injection needed.

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

        // Build and inject nav HTML
        var navHtml = cfg.type === 'liberate'
            ? buildLiberateNav(cfg.activePage)
            : buildRepairNav(cfg.activePage, cfg.showApiSetup);

        document.body.insertAdjacentHTML('afterbegin', navHtml);
    };
}());
