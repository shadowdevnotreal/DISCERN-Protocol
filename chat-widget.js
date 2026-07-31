/**
 * Shared Chat Widget — DISCERN Protocol
 *
 * Creates a floating chat panel that works across all pages.
 * repair.html keeps its own AI-integrated chat and does NOT load this file.
 *
 * Usage (place before </body>):
 *
 *   <script src="chat-widget.js"></script>
 *   <script>
 *   initChatWidget({
 *     panelId:        'agent-panel',          // optional, default: 'agent-panel'
 *     icon:           '❤️',                    // button & header emoji
 *     title:          'REPAIR Guide',          // header title text
 *     gradient:       'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 *     hasMaximize:    false,                   // show maximize button?
 *     placeholder:    'Ask about...',          // textarea placeholder
 *     welcomeMessage: 'Welcome! ...',          // first assistant message (null = none)
 *     response:       'Thank you for ...',     // reply to any user message
 *   });
 *   </script>
 */

function initChatWidget(config) {
    var cfg = Object.assign({
        panelId:        'agent-panel',
        icon:           '❤️',
        title:          'REPAIR Guide',
        gradient:       'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        hasMaximize:    false,
        placeholder:    'Ask about the REPAIR process...',
        welcomeMessage: null,
        response:       "Thank you for reaching out! I'm here to help you navigate this process. How can I assist you?"
    }, config);

    // ── 1. Inject gradient-specific CSS (structural CSS is in desktop-enhancements.css) ──
    // The background gradient for this page's chat is injected as a scoped style rule.
    var styleEl = document.createElement('style');
    styleEl.textContent = [
        '.floating-chat-button { background: ' + cfg.gradient + '; }',
        '.chat-widget-header    { background: ' + cfg.gradient + '; }',
        '.chat-avatar.assistant { background: ' + cfg.gradient + '; }',
        '.send-button           { background: ' + cfg.gradient + '; }',
    ].join('\n');
    document.head.appendChild(styleEl);

    // ── 2. Inject HTML ─────────────────────────────────────────────────────────
    var maximizeBtn = cfg.hasMaximize
        ? '<button class="chat-action-btn" onclick="toggleMaximize()" aria-label="Maximize">⛶</button>\n                '
        : '';

    var html = '\n    <button id="floating-chat-button" class="floating-chat-button" onclick="toggleChatWidget()" aria-label="Open chat">\n        ' + cfg.icon + '\n    </button>\n\n    <!-- Chat Panel -->\n    <div id="' + cfg.panelId + '" class="chat-widget-panel">\n        <div class="chat-widget-header">\n            <div class="chat-header-title">\n                <span class="chat-icon">' + cfg.icon + '</span>\n                <span>' + cfg.title + '</span>\n            </div>\n            <div class="chat-header-actions">\n                ' + maximizeBtn + '<button class="chat-action-btn" onclick="toggleChatWidget()" aria-label="Close">\n                    \u2715\n                </button>\n            </div>\n        </div>\n        <div class="chat-widget-body">\n            <div id="chat-messages" class="chat-messages"></div>\n            <div class="chat-input-area">\n                <textarea id="chat-input" class="chat-input"\n                       placeholder="' + cfg.placeholder + '"\n                       aria-label="Chat input"></textarea>\n                <button class="send-button" onclick="sendChatMessage()" aria-label="Send message">\n                    \u27a4\n                </button>\n            </div>\n        </div>\n    </div>\n';

    document.body.insertAdjacentHTML('beforeend', html);

    // ── 3. Global functions ────────────────────────────────────────────────────
    window.toggleChatWidget = function() {
        var panel  = document.getElementById(cfg.panelId);
        var button = document.getElementById('floating-chat-button');
        if (panel.classList.contains('active')) {
            panel.classList.remove('active');
            button.classList.remove('hidden');
        } else {
            panel.classList.add('active');
            button.classList.add('hidden');
        }
    };

    window.toggleMaximize = function() {
        var panel = document.getElementById(cfg.panelId);
        panel.classList.toggle('maximized');
    };

    window.addChatMessage = function(content, sender) {
        var container = document.getElementById('chat-messages');
        var msgDiv    = document.createElement('div');
        msgDiv.className = 'chat-message ' + sender;

        var avatar = document.createElement('div');
        avatar.className = 'chat-avatar ' + sender;
        avatar.textContent = sender === 'assistant' ? cfg.icon : '👤';

        var bubble = document.createElement('div');
        bubble.className = 'chat-bubble ' + sender;
        bubble.textContent = content;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    };

    window.sendChatMessage = function() {
        var input   = document.getElementById('chat-input');
        var message = input.value.trim();
        if (message) {
            addChatMessage(message, 'user');
            input.value = '';
            setTimeout(function() {
                addChatMessage(cfg.response, 'assistant');
            }, 1000);
        }
    };

    // ── 4. Enter key + welcome message ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function() {
        var chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                }
            });
        }
        if (cfg.welcomeMessage) {
            setTimeout(function() {
                addChatMessage(cfg.welcomeMessage, 'assistant');
            }, 500);
        }
    });
}
