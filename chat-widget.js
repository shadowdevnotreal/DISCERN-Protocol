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

    // ── 1. Inject CSS ──────────────────────────────────────────────────────────
    var styleEl = document.createElement('style');
    styleEl.textContent = [
        '.floating-chat-button {',
        '    position: fixed;',
        '    bottom: 30px;',
        '    right: 30px;',
        '    width: 60px;',
        '    height: 60px;',
        '    border-radius: 50%;',
        '    background: ' + cfg.gradient + ';',
        '    color: white;',
        '    border: none;',
        '    font-size: 2rem;',
        '    cursor: pointer;',
        '    box-shadow: 0 8px 24px rgba(0,0,0,0.25);',
        '    z-index: 1000;',
        '    display: flex;',
        '    align-items: center;',
        '    justify-content: center;',
        '    transition: all 0.3s ease;',
        '    animation: chat-pulse 2s infinite;',
        '}',
        '@keyframes chat-pulse {',
        '    0%, 100% { transform: scale(1); }',
        '    50% { transform: scale(1.1); }',
        '}',
        '.floating-chat-button:hover {',
        '    transform: scale(1.15);',
        '    box-shadow: 0 12px 32px rgba(0,0,0,0.35);',
        '}',
        '.floating-chat-button.hidden { display: none; }',
        '.chat-widget-panel {',
        '    position: fixed;',
        '    bottom: 30px;',
        '    right: 30px;',
        '    width: 400px;',
        '    height: 600px;',
        '    background: var(--bg-secondary);',
        '    border-radius: 20px;',
        '    box-shadow: 0 20px 60px rgba(0,0,0,0.3);',
        '    display: flex;',
        '    flex-direction: column;',
        '    transform: translateY(calc(100% + 60px));',
        '    opacity: 0;',
        '    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);',
        '    z-index: 999;',
        '    overflow: hidden;',
        '}',
        '.chat-widget-panel.active {',
        '    transform: translateY(0);',
        '    opacity: 1;',
        '}',
        '.chat-widget-panel.maximized {',
        '    width: 90vw;',
        '    max-width: 1200px;',
        '    height: 90vh;',
        '    bottom: 5vh;',
        '    right: 5vw;',
        '}',
        '.chat-widget-header {',
        '    background: ' + cfg.gradient + ';',
        '    color: white;',
        '    padding: 1.5rem;',
        '    display: flex;',
        '    justify-content: space-between;',
        '    align-items: center;',
        '    border-radius: 20px 20px 0 0;',
        '}',
        '.chat-header-title {',
        '    display: flex;',
        '    align-items: center;',
        '    gap: 0.75rem;',
        '    font-weight: 600;',
        '    font-size: 1.1rem;',
        '}',
        '.chat-icon { font-size: 1.5rem; }',
        '.chat-header-actions { display: flex; gap: 0.5rem; }',
        '.chat-action-btn {',
        '    background: rgba(255,255,255,0.2);',
        '    border: none;',
        '    color: white;',
        '    width: 32px;',
        '    height: 32px;',
        '    border-radius: 8px;',
        '    cursor: pointer;',
        '    display: flex;',
        '    align-items: center;',
        '    justify-content: center;',
        '    transition: all 0.2s ease;',
        '    font-size: 1.2rem;',
        '}',
        '.chat-action-btn:hover { background: rgba(255,255,255,0.3); }',
        '.chat-widget-body {',
        '    flex: 1;',
        '    overflow-y: auto;',
        '    padding: 1rem;',
        '    display: flex;',
        '    flex-direction: column;',
        '    gap: 0;',
        '    background: var(--bg-secondary);',
        '}',
        '.chat-messages {',
        '    flex: 1;',
        '    overflow-y: auto;',
        '    padding: 1rem;',
        '    background: transparent;',
        '    min-height: 300px;',
        '    max-height: 400px;',
        '}',
        '.chat-message {',
        '    display: flex;',
        '    gap: 0.75rem;',
        '    margin-bottom: 1.5rem;',
        '    align-items: flex-start;',
        '}',
        '.chat-avatar {',
        '    width: 36px;',
        '    height: 36px;',
        '    border-radius: 50%;',
        '    display: flex;',
        '    align-items: center;',
        '    justify-content: center;',
        '    font-size: 1.2rem;',
        '    flex-shrink: 0;',
        '}',
        '.chat-avatar.assistant { background: ' + cfg.gradient + '; }',
        '.chat-avatar.user { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }',
        '.chat-bubble {',
        '    background: var(--bg-glass);',
        '    backdrop-filter: var(--backdrop-blur);',
        '    padding: 0.875rem 1.125rem;',
        '    border-radius: 16px;',
        '    max-width: 75%;',
        '    line-height: 1.5;',
        '    color: var(--text-primary);',
        '}',
        '.chat-bubble.assistant { border-top-left-radius: 4px; }',
        '.chat-bubble.user { border-top-right-radius: 4px; margin-left: auto; }',
        '.chat-input-area {',
        '    padding: 0 1rem 1rem 1rem;',
        '    background: var(--bg-secondary);',
        '    display: flex;',
        '    gap: 0.5rem;',
        '}',
        '.chat-input {',
        '    flex: 1;',
        '    padding: 1rem;',
        '    border: 2px solid var(--border-color);',
        '    border-radius: 12px;',
        '    background: var(--bg-glass);',
        '    backdrop-filter: var(--backdrop-blur);',
        '    color: var(--text-primary);',
        '    font-size: 0.95rem;',
        '    resize: none;',
        '    min-height: 80px;',
        '    font-family: inherit;',
        '    transition: all 0.2s ease;',
        '}',
        '.chat-input:focus {',
        '    outline: none;',
        '    border-color: #667eea;',
        '    box-shadow: 0 0 0 3px rgba(102,126,234,0.1);',
        '}',
        '.chat-input::placeholder { color: var(--text-tertiary); }',
        '.send-button {',
        '    width: 48px;',
        '    height: 48px;',
        '    background: ' + cfg.gradient + ';',
        '    color: white;',
        '    border: none;',
        '    border-radius: 12px;',
        '    cursor: pointer;',
        '    display: flex;',
        '    align-items: center;',
        '    justify-content: center;',
        '    font-size: 1.3rem;',
        '    transition: all 0.2s ease;',
        '    flex-shrink: 0;',
        '    align-self: flex-end;',
        '}',
        '.send-button:hover {',
        '    transform: scale(1.05);',
        '    box-shadow: 0 4px 12px rgba(0,0,0,0.25);',
        '}',
        '@media (max-width: 768px) {',
        '    .chat-widget-panel {',
        '        width: calc(100vw - 40px);',
        '        height: calc(100vh - 40px);',
        '        bottom: 20px;',
        '        right: 20px;',
        '    }',
        '    .floating-chat-button { bottom: 20px; right: 20px; }',
        '}'
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
